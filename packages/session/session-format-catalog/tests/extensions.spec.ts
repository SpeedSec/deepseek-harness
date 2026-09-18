import { describe, expect, it } from 'vitest'
import type { SessionFormatExtensionPolicy } from '@deepseek-ai/dsh-session-format'
import { sessionFormatCatalog } from '../src/index.ts'

describe('trusted historical extension ownership', () => {
  it.each([0, 1, 2])('validates owned v%i events across every adjacent edge', (version) => {
    const admitted: number[] = []
    const mapped: number[] = []
    let validated = false
    const extensions: SessionFormatExtensionPolicy = {
      fingerprint: 'test-owner-v1',
      admit(event, sourceVersion) {
        if (event.type !== 'test/owned') return false
        if (JSON.stringify(event.data) !== '{"value":"kept"}') throw new Error('invalid owned payload')
        admitted.push(sourceVersion)
        return true
      },
      mapped(coordinates) { mapped.push(coordinates.fromVersion) },
      rewrite(event) { return event },
      validate(artifact) { validated = artifact.events[0]?.type === 'test/owned' },
    }
    const restore = sessionFormatCatalog.createRestore({
      type: 'session', version, id: 'owned-session', createdAt: 1, delegationDepth: 0,
      ...(version === 2 ? { isSeeded: false } : {}),
    }, { recovery: 'strict', validation: 'current', extensions })
    restore.decodeRow({ type: 'test/owned', seq: 0, time: 1, data: { value: 'kept' }, ignorable: true })
    expect(restore.finish().events[0]).toMatchObject({ type: 'test/owned', seq: 0, data: { value: 'kept' } })
    expect(admitted).toEqual(Array.from({ length: 3 - version }, (_, i) => version + i))
    expect(mapped).toEqual(admitted)
    expect(validated).toBe(true)
  })

  it('refuses owner changes to core event identity', () => {
    const extensions: SessionFormatExtensionPolicy = {
      fingerprint: 'invalid-owner', admit: () => true, mapped() {}, validate() {},
      rewrite: event => ({ ...event, seq: event.seq + 1 }),
    }
    const restore = sessionFormatCatalog.createRestore({ type: 'session', version: 0, id: 'refused', createdAt: 1, delegationDepth: 0 }, { recovery: 'strict', validation: 'current', extensions })
    expect(() => { restore.decodeRow({ type: 'test/owned', seq: 0, time: 1, data: {}, ignorable: true }) }).toThrow(/core-owned event envelope/)
  })
})
