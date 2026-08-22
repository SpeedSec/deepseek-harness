/** Typed LLM failure with serializable provider facts. @module @deepseek-ai/dsh-llm/llm-error */

import type { ProviderRequestId } from './brand.ts'
import type { CallId } from './brand.ts'
import { HarnessError, MALFORMED_RESPONSE_CODE } from './error.ts'
import type { LlmFailure } from './types.ts'

/** Structured provider facts and cause accepted by {@link LlmError}. */
export interface LlmErrorOptions extends ErrorOptions {
  /** Valid HTTP status observed at the provider boundary. */
  status?: number
  /** Positive finite provider-requested delay in milliseconds. */
  providerRetryAfterMs?: number
  /** Non-empty opaque provider request id. */
  requestId?: ProviderRequestId
}

/** Typed LLM-related failure with a stable code and detached serializable facts. */
export class LlmError extends HarnessError {
  /** Serializable facts retained beside this live Error. */
  readonly failure: LlmFailure

  /**
   * @param message - non-empty human-readable failure summary.
   * @param code - non-empty stable provider-neutral machine code.
   * @param options - optional cause and validated serializable provider facts.
   */
  constructor(message: string, code: string, options?: LlmErrorOptions) {
    if (typeof message !== 'string' || message.length === 0) throw new Error('LlmError message must be a non-empty string')
    if (typeof code !== 'string' || code.length === 0) throw new Error('LlmError code must be a non-empty string')
    if (options?.status !== undefined
      && (!Number.isInteger(options.status) || options.status < 100 || options.status > 599)) {
      throw new Error('LlmError status must be an integer from 100 through 599')
    }
    if (options?.providerRetryAfterMs !== undefined
      && (!Number.isFinite(options.providerRetryAfterMs) || options.providerRetryAfterMs <= 0)) {
      throw new Error('LlmError providerRetryAfterMs must be a positive finite number')
    }
    if (options?.requestId !== undefined
      && (typeof options.requestId !== 'string' || options.requestId.length === 0)) {
      throw new Error('LlmError requestId must be a non-empty string')
    }
    super(message, code, options)
    this.name = 'LlmError'
    this.failure = Object.freeze({
      message,
      code,
      ...options?.status === undefined ? {} : { status: options.status },
      ...options?.providerRetryAfterMs === undefined ? {} : { providerRetryAfterMs: options.providerRetryAfterMs },
      ...options?.requestId === undefined ? {} : { requestId: options.requestId },
    })
  }
}

/**
 * Return a complete provider tool-call identity or reject the malformed response.
 * @param id - provider-issued correlation id.
 * @param name - registered tool name selected by the model.
 * @returns the narrowed identity.
 */
export function requireToolCallIdentity(
  id: CallId | undefined,
  name: string | undefined,
): { id: CallId; name: string } {
  if (id === undefined || id.trim() === '') {
    throw new LlmError('model response contained a tool call without a non-empty id', MALFORMED_RESPONSE_CODE)
  }
  if (name === undefined || name.trim() === '') {
    throw new LlmError('model response contained a tool call without a non-empty name', MALFORMED_RESPONSE_CODE)
  }
  return { id, name }
}
