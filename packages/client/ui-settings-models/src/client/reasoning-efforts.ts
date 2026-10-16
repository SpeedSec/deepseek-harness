/** pi-ai model-level reasoning declarations, matching llm-pi-ai's catalog validation. */

/** pi-ai's selectable thinking levels in escalation order; these are protocol ids. */
export const REASONING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const

/** Localized failures for model reasoning declarations. */
export type ReasoningEffortsFailure = 'modelReasoningInvalid' | 'modelReasoningLevelRequired' | 'modelReasoningWireInvalid'

/**
 * Validate a persisted or edited pi-ai reasoning declaration without changing it.
 * @param value - absent for inheritance, false for disabled, or a level-to-wire map.
 * @returns a localized failure key, or undefined when the adapter accepts the declaration.
 */
export function reasoningEffortsFailure(value: unknown): ReasoningEffortsFailure | undefined {
  if (value === undefined || value === false) return undefined
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return 'modelReasoningInvalid'
  const entries = Object.entries(value)
  if (entries.some(([level]) => !REASONING_LEVELS.some(known => known === level))) return 'modelReasoningInvalid'
  if (entries.some(([level, wire]) => !(level === 'off' && wire === null)
    && (typeof wire !== 'string' || wire.length === 0))) return 'modelReasoningWireInvalid'
  if (!entries.some(([level]) => level !== 'off')) return 'modelReasoningLevelRequired'
  return undefined
}
