/** Model-level pi-ai reasoning capability and wire-value controls. */

import type { ReactNode } from 'react'
import { Checkbox } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DeepSeekModelDraft } from './DeepSeekModelsEditor.tsx'
import type { ModelsKey } from './locales.ts'
import { REASONING_LEVELS } from './reasoning-efforts.ts'
import styles from './ModelsSection.module.css'

/** Drafted model and the owning row's replacement action. */
interface ModelReasoningEffortsProps {
  model: DeepSeekModelDraft
  position: number
  disabled: boolean
  t: (key: ModelsKey) => string
  onChange: (model: DeepSeekModelDraft) => void
}

/**
 * Edit inheritance, disabled reasoning, or explicit selectable levels and wire values.
 * @param props - model draft, accessible row position, copy, and replacement action.
 * @returns reasoning controls without materializing an override merely on opening.
 */
export function ModelReasoningEfforts({ model, position, disabled, t, onChange }: ModelReasoningEffortsProps): ReactNode {
  const value = model['reasoningEfforts']
  const mode = value === undefined ? 'inherit' : value === false ? 'disabled' : 'custom'
  const efforts: Record<string, unknown> = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const replace = (next: false | Record<string, unknown> | undefined): void => {
    const updated = { ...model }
    if (next === undefined) Reflect.deleteProperty(updated, 'reasoningEfforts')
    else updated['reasoningEfforts'] = next
    onChange(updated)
  }

  return (
    <fieldset className={styles['modelReasoning']} aria-label={`${t('modelReasoning')} ${String(position)}`}>
      <legend className={styles['modelFieldLabel']}>{t('modelReasoning')}</legend>
      <select
        className={`${styles['input']} ${styles['selectInput']}`}
        aria-label={`${t('modelReasoning')} ${String(position)}`}
        value={mode}
        disabled={disabled}
        onChange={(event) => {
          replace(event.target.value === 'inherit' ? undefined : event.target.value === 'disabled' ? false : {})
        }}
      >
        <option value="inherit">{t('modelReasoningInherit')}</option>
        <option value="disabled">{t('modelReasoningDisabled')}</option>
        <option value="custom">{t('modelReasoningCustom')}</option>
      </select>
      {mode === 'custom'
        ? (
          <div className={styles['reasoningLevels']}>
            {REASONING_LEVELS.map((level) => {
              const selected = Object.hasOwn(efforts, level)
              const wire = efforts[level]
              return (
                <div className={styles['reasoningLevel']} key={level}>
                  <Checkbox
                    label={level}
                    checked={selected}
                    disabled={disabled}
                    onChange={(checked) => {
                      const next = { ...efforts }
                      if (checked) next[level] = level === 'off' ? null : level
                      else Reflect.deleteProperty(next, level)
                      replace(next)
                    }}
                  />
                  {selected
                    ? (
                      <input
                        className={styles['input']}
                        type="text"
                        aria-label={`${t('modelReasoningWire')} ${level} ${String(position)}`}
                        aria-invalid={!(level === 'off' && wire === null)
                          && (typeof wire !== 'string' || wire.length === 0)}
                        placeholder={level === 'off' ? t('modelReasoningOffEmpty') : level}
                        value={typeof wire === 'string' ? wire : ''}
                        disabled={disabled}
                        onChange={(event) => {
                          const text = event.target.value
                          replace({ ...efforts, [level]: level === 'off' && text === '' ? null : text })
                        }}
                      />
                    )
                    : null}
                </div>
              )
            })}
          </div>
        )
        : null}
    </fieldset>
  )
}
