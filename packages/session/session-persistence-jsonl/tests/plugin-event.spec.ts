/** Current-format plugin events survive independent persistence instances. */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '../src/index.ts'
import { expect, it } from 'vitest'

it('reopens a plugin batch and preserves it when continuing the current generation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-plugin-event-'))
  const first = new Context()
  const second = new Context()
  try {
    await first.plugin(SessionStore)
    await first.plugin(JsonlSessionPersistence, { root, compression: 'none' })
    const session = first.sessions.prepare(SessionId('plugin-batch'))
    const event = session.appendPluginEvent('security-research/batch', {
      batchId: 'batch-one', records: [{ id: 'record-one', title: 'retained evidence' }],
    })
    const writer = await first.sessionPersistence.create(session.header)
    try {
      await writer.append(session.snapshotEvents())
    } finally {
      await writer.close()
    }
    await first.fiber.dispose()

    await second.plugin(SessionStore)
    await second.plugin(JsonlSessionPersistence, { root, compression: 'none' })
    const reopened = await second.sessionPersistence.open(session.id, 'write')
    try {
      const read = await reopened.read()
      expect(read.events).toEqual([event])
      const restored = second.sessions.prepare(session.id, {
        seed: [...read.events], eventState: read.eventState,
        meta: reopened.header, inheritedEventCount: reopened.inheritedEventCount,
      })
      expect(restored.deriveMessages()).toEqual([])
      restored.appendPluginEvent('security-research/batch', { batchId: 'batch-two' })
      await reopened.append(restored.snapshotEvents(restored.firstLiveSeq))
    } finally {
      await reopened.close()
    }
    const reader = await second.sessionPersistence.open(session.id, 'read')
    try {
      const read = await reader.read()
      expect(read.events[0]).toEqual(event)
      expect(read.events[1]).toMatchObject({ seq: 1, type: 'session/end-seed' })
      expect(read.events[2]).toMatchObject({
        seq: 2, type: 'security-research/batch', ignorable: true, data: { batchId: 'batch-two' },
      })
    } finally {
      await reader.close()
    }
  } finally {
    await Promise.all([first.fiber.dispose(), second.fiber.dispose()])
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  }
})
