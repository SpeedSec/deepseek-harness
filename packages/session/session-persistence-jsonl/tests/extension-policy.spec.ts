import { afterEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadJsonlMigrationExtension } from '../src/extension-policy.ts'
import { verifyCurrentGenerationInWorker } from '../src/migration-verifier.ts'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true, force: true }))) })

async function owner() {
  const moduleUrl = new URL('./fixtures/migration-owner.mjs', import.meta.url)
  return { moduleUrl: moduleUrl.href, sha256: createHash('sha256').update(await readFile(moduleUrl)).digest('hex'), fingerprint: 'test-migration-owner-v1', options: { sessionId: 'extension-session' } }
}

describe('pinned migration extension', () => {
  it('refuses changed bytes and policy fingerprints', async () => {
    const descriptor = await owner()
    await expect(loadJsonlMigrationExtension(descriptor)).resolves.toMatchObject({ fingerprint: descriptor.fingerprint })
    await expect(loadJsonlMigrationExtension({ ...descriptor, sha256: '0'.repeat(64) })).rejects.toThrow(/digest changed/)
    await expect(loadJsonlMigrationExtension({ ...descriptor, fingerprint: 'different-version' })).rejects.toThrow(/fingerprint/)
  })

  it('applies the same owner rejection in a real verification worker', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-migration-owner-'))
    roots.push(root)
    const path = join(root, 'session.v3.jsonl')
    await writeFile(path, JSON.stringify({ type: 'session', version: 3, id: 'extension-session', createdAt: 1, isSeeded: false, delegationDepth: 0 }) + '\n')
    const descriptor = await owner()
    const verified = await verifyCurrentGenerationInWorker(path, 'none', 'extension-session', 0, undefined, undefined, descriptor)
    expect(typeof verified.bytes).toBe('number')
    await expect(verifyCurrentGenerationInWorker(path, 'none', 'extension-session', 0, undefined, undefined, { ...descriptor, options: { ...descriptor.options, deny: true } })).rejects.toThrow(/owner refuses publication/)
  })
})
