/** Fork runner selection and explicit opt-ins for credential-dependent integrations. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

interface Job {
  if?: string
  'runs-on'?: string
  needs?: string[]
  steps?: Array<{ name?: string; if?: string; run?: string }>
}

function workflow(name: string): Record<string, Job> {
  return (load(readFileSync(resolve(import.meta.dirname, '../../.github/workflows', name), 'utf8')) as {
    jobs: Record<string, Job>
  }).jobs
}

// These canonical-case boolean/string fixtures share Actions and JavaScript semantics.
function evaluate(expression: string, options: {
  fork: boolean
  variables?: Record<string, string>
  event?: string
  os?: string
}): unknown {
  return runInNewContext(expression.trim().replace(/^\$\{\{|\}\}$/g, ''), {
    vars: options.variables ?? {},
    github: {
      event_name: options.event ?? 'pull_request',
      ref: 'refs/heads/master',
      event: {
        action: 'opened',
        repository: { fork: options.fork },
        pull_request: { state: 'open', user: { login: 'maintainer' }, head: { repo: { fork: false } } },
      },
    },
    inputs: { ci: true },
    runner: { os: options.os ?? 'Linux' },
    fromJSON: JSON.parse,
  }, { timeout: 1000 })
}

describe('fork CI', () => {
  const ci = workflow('ci.yml')

  it.each([
    ['node-24', 'ubuntu-24.04', 'dsh-ubuntu-24-04-16core'],
    ['node-24-coverage', 'ubuntu-24.04', 'dsh-ubuntu-24-04-16core'],
    ['node-24-consumers', 'ubuntu-24.04', 'dsh-ubuntu-24-04-16core'],
    ['windows-build', 'windows-2025', 'dsh-windows-2025-16core'],
    ['windows-coverage', 'windows-2025', 'dsh-windows-2025-16core'],
    ['windows-native-tests', 'windows-2025', 'dsh-windows-2025-16core'],
  ])('%s uses public runners only for fork repositories', (name, hosted, upstream) => {
    const job = ci[name]!
    for (const mode of ['', 'selfhosted', 'blacksmith']) {
      expect(evaluate(job['runs-on']!, {
        fork: true, variables: { DSH_CI_FAILOVER_LINUX: mode, DSH_CI_FAILOVER_WINDOWS: mode },
      })).toBe(hosted)
    }
    expect(evaluate(job['runs-on']!, { fork: false })).toBe(upstream)
    expect(job.if).toBe("github.event_name == 'pull_request'")
  })

  it('keeps the blocking product validation inventory', () => {
    expect(ci['all-checks-passed']!.needs).toEqual([
      'node-24', 'node-24-coverage', 'node-24-bench', 'node-24-consumers',
      'node-compat', 'python-sdk', 'python-runtime', 'windows-build', 'windows-native-tests',
    ])
    for (const name of ['node-24', 'node-24-coverage', 'node-24-consumers', 'windows-build', 'windows-native-tests']) {
      expect(ci[name]).not.toHaveProperty('continue-on-error', true)
    }
  })

  it.each([
    ['issue-policy.yml', 'policy', 'DSH_UPSTREAM_PROJECT_AUTOMATION', 'pull_request'],
    ['issue-lifecycle.yml', 'lifecycle', 'DSH_UPSTREAM_PROJECT_AUTOMATION', 'pull_request'],
    ['build-preview-cloudflare.yml', 'preview', 'DSH_CLOUDFLARE_PREVIEW', 'pull_request'],
    ['weighted-approval.yml', 'publish-status', 'DSH_WEIGHTED_APPROVAL', 'pull_request_target'],
    ['ci-master.yml', 'serial-linux-selfhosted', 'DSH_SELF_HOSTED_STANDBY', 'push'],
    ['ci-master.yml', 'serial-windows', 'DSH_SELF_HOSTED_STANDBY', 'push'],
  ])('%s/%s requires a fork opt-in for external infrastructure', (file, name, variable, event) => {
    const condition = workflow(file)[name]!.if!
    expect(evaluate(condition, { fork: false, event })).toBe(true)
    expect(evaluate(condition, { fork: true, event })).toBe(false)
    expect(evaluate(condition, { fork: true, event, variables: { [variable]: 'false' } })).toBe(false)
    expect(evaluate(condition, { fork: true, event, variables: { [variable]: 'true' } })).toBe(true)
  })

  it.each(['Linux', 'Windows'])('keeps %s installed-wheel CI keyless on a fork by default', (os) => {
    const steps = workflow('build-exe-for-python-sdk.yml').build!.steps!.filter(step =>
      /^(?:Preflight installed-wheel real API test|Run installed-wheel real API black-box test)/.test(step.name ?? ''),
    )
    expect(steps).toHaveLength(4)
    for (const step of steps) {
      const selectedOS = step.name!.includes('(Windows)') ? 'Windows' : 'Linux'
      expect(evaluate(step.if!, { fork: true, os, event: 'push' })).toBe(false)
      expect(evaluate(step.if!, { fork: false, os, event: 'push' })).toBe(os === selectedOS)
      expect(evaluate(step.if!, {
        fork: true, os, event: 'push', variables: { DSH_LIVE_API_VALIDATION: 'true' },
      })).toBe(os === selectedOS)
    }
  })
})
