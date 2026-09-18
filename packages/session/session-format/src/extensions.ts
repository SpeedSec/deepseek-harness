/** Trusted extension admission and coordinate notifications for adjacent migrations. */
import { SessionFormatError } from './error.ts'
import { sessionFormatCount, sessionFormatSafeInteger, snapshotSessionFormatJson } from './json.ts'
import type { SessionFormatEvent, SessionFormatMigrationStageInput } from './types.ts'

/**
 * Validate a plugin log envelope before consulting its deployment-selected owner.
 * @param event - Historical event outside the first-party inventory.
 * @param input - Adjacent migration input and trusted policy.
 * @returns Whether the policy owns and validates this event.
 */
export function admitSessionFormatExtension(event: SessionFormatEvent, input: SessionFormatMigrationStageInput): boolean {
  if (input.extensions === undefined) return false
  if (!input.extensions.admit(event, input.sourceHeader.version, input.sourceHeader.id)) return false
  if (Object.keys(event).some(key => !['type', 'seq', 'time', 'data', 'ignorable'].includes(key))
    || event.ignorable !== true || typeof event.type !== 'string') {
    throw new SessionFormatError('owned historical extension requires an ignorable log-only envelope')
  }
  sessionFormatCount(event.seq, 'extension seq')
  sessionFormatSafeInteger(event.time, 'extension time')
  snapshotSessionFormatJson(event.data, 'extension payload')
  return true
}

/**
 * Report a surviving core coordinate and rewrite only owner-managed payload fields.
 * @param source - Original event at this adjacent edge.
 * @param target - Core-transformed event.
 * @param input - Adjacent migration input and trusted policy.
 * @returns Rewritten event with its core envelope preserved.
 */
export function rewriteSessionFormatExtension(
  source: SessionFormatEvent,
  target: SessionFormatEvent,
  input: SessionFormatMigrationStageInput,
): SessionFormatEvent {
  const policy = input.extensions
  if (policy === undefined) return target
  const coordinates = {
    sessionId: input.sourceHeader.id,
    fromVersion: input.sourceHeader.version,
    toVersion: input.targetHeader.version,
    sourceSeq: source.seq,
    targetSeq: target.seq,
    sourceEvent: source,
  }
  policy.mapped(coordinates)
  const rewritten = policy.rewrite(target, coordinates)
  const { data: _before, ...before } = target
  const { data: _after, ...after } = rewritten
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new SessionFormatError('extension policy changed a core-owned event envelope')
  snapshotSessionFormatJson(rewritten.data, 'rewritten extension payload')
  return rewritten
}
