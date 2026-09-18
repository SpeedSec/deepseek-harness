/** Deployment-selected migration owner loaded identically in Host and verifier isolates. */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { SessionFormatExtensionPolicy, SessionFormatJsonValue } from '@deepseek-ai/dsh-session-format'

/** Trusted deployment input; never read this descriptor from a Session event or header. */
export interface JsonlMigrationExtensionModule {
  readonly moduleUrl: string
  readonly sha256: string
  readonly fingerprint: string
  readonly options: SessionFormatJsonValue
}

/**
 * Load a deployment-pinned owner module before preparing or verifying a generation.
 * @param descriptor - Explicit file URL, content digest, policy version, and owner configuration.
 * @returns Validated policy exported by the pinned module.
 */
export async function loadJsonlMigrationExtension(descriptor: JsonlMigrationExtensionModule): Promise<SessionFormatExtensionPolicy> {
  if (!/^file:/.test(descriptor.moduleUrl) || !/^[a-f0-9]{64}$/.test(descriptor.sha256)) throw new Error('migration owner requires a pinned local module')
  const bytes = await readFile(fileURLToPath(descriptor.moduleUrl))
  if (createHash('sha256').update(bytes).digest('hex') !== descriptor.sha256) throw new Error('migration owner module digest changed')
  const loaded = await import(descriptor.moduleUrl) as {
    createSessionMigrationPolicy?: (options: SessionFormatJsonValue) => SessionFormatExtensionPolicy
  }
  if (typeof loaded.createSessionMigrationPolicy !== 'function') throw new Error('migration owner lacks createSessionMigrationPolicy')
  const policy = loaded.createSessionMigrationPolicy(descriptor.options)
  if (policy.fingerprint !== descriptor.fingerprint
    || !['admit', 'mapped', 'rewrite', 'validate'].every(key => typeof (policy as unknown as Record<string, unknown>)[key] === 'function')) {
    throw new Error('migration owner policy fingerprint or methods do not match deployment')
  }
  return policy
}
