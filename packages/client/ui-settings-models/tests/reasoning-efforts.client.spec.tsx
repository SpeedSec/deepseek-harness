// @vitest-environment jsdom
/** Model reasoning declaration modes, exact wire values, and persisted-data validation. */
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModelReasoningEfforts } from '../src/client/ModelReasoningEfforts.tsx'
import { validatePiAiModels } from '../src/client/ModelListEditor.tsx'
import type { ModelDraft } from '../src/client/ModelListEditor.tsx'
import { en, zh } from '../src/client/locales.ts'
import { REASONING_LEVELS } from '../src/client/reasoning-efforts.ts'

afterEach(cleanup)

function mount(model: ModelDraft, disabled = false, copy = en) {
  const onChange = vi.fn<(next: ModelDraft) => void>()
  function Editor() {
    const [draft, setDraft] = useState(model)
    return <ModelReasoningEfforts model={draft} position={2} disabled={disabled} t={key => copy[key]} onChange={(next) => {
      onChange(next)
      setDraft(next)
    }} />
  }
  render(<Editor />)
  return onChange
}

function choose(mode: string) {
  fireEvent.change(screen.getByRole('combobox', { name: `${en.modelReasoning} 2` }), { target: { value: mode } })
}

describe('reasoning declaration controls', () => {
  it.each([
    [{ id: 'm' }, 'inherit'],
    [{ id: 'm', reasoningEfforts: false }, 'disabled'],
    [{ id: 'm', reasoningEfforts: { off: null, max: 'ultra' } }, 'custom'],
  ])('opens %j without writing an override', (model, mode) => {
    const onChange = mount(model)
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: `${en.modelReasoning} 2` }).value).toBe(mode)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('switches modes without removing unrelated model fields', () => {
    const model = { id: 'm', compat: { thinkingFormat: 'deepseek' }, reasoningEfforts: { high: 'ultra' } }
    const onChange = mount(model)
    choose('disabled')
    expect(onChange).toHaveBeenLastCalledWith({ ...model, reasoningEfforts: false })
    choose('inherit')
    expect(onChange).toHaveBeenLastCalledWith({ id: 'm', compat: model.compat })
    choose('custom')
    expect(onChange).toHaveBeenLastCalledWith({ ...model, reasoningEfforts: {} })
    expect(screen.getAllByRole('checkbox')).toHaveLength(REASONING_LEVELS.length)
    expect(model.reasoningEfforts).toEqual({ high: 'ultra' })
  })

  it('selects every offered level and edits wire values verbatim', () => {
    const onChange = mount({ id: 'm', reasoningEfforts: {} })
    for (const level of REASONING_LEVELS) {
      fireEvent.click(screen.getByRole('checkbox', { name: level }))
    }
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'm',
      reasoningEfforts: { off: null, minimal: 'minimal', low: 'low', medium: 'medium', high: 'high', xhigh: 'xhigh', max: 'max' },
    })
    const max = screen.getByRole<HTMLInputElement>('textbox', { name: `${en.modelReasoningWire} max 2` })
    fireEvent.change(max, { target: { value: 'ultra-custom' } })
    expect(onChange.mock.lastCall?.[0]['reasoningEfforts']).toHaveProperty('max', 'ultra-custom')
    fireEvent.change(max, { target: { value: '' } })
    expect(max.getAttribute('aria-invalid')).toBe('true')
    expect(validatePiAiModels([onChange.mock.lastCall?.[0]])).toEqual({ index: 0, key: 'modelReasoningWireInvalid' })
    fireEvent.click(screen.getByRole('checkbox', { name: 'max' }))
    expect(onChange.mock.lastCall?.[0]['reasoningEfforts']).not.toHaveProperty('max')
    expect(screen.queryByRole('textbox', { name: `${en.modelReasoningWire} max 2` })).toBeNull()
  })

  it('stores blank off as null and preserves an explicit off wire value', () => {
    const onChange = mount({ id: 'm', reasoningEfforts: { off: 'none', high: 'ultra' } })
    const off = screen.getByRole<HTMLInputElement>('textbox', { name: `${en.modelReasoningWire} off 2` })
    expect(off.value).toBe('none')
    fireEvent.change(off, { target: { value: '' } })
    expect(off.getAttribute('aria-invalid')).toBe('false')
    expect(off.placeholder).toBe(en.modelReasoningOffEmpty)
    expect(onChange).toHaveBeenLastCalledWith({ id: 'm', reasoningEfforts: { off: null, high: 'ultra' } })
    fireEvent.change(off, { target: { value: 'disabled' } })
    expect(onChange).toHaveBeenLastCalledWith({ id: 'm', reasoningEfforts: { off: 'disabled', high: 'ultra' } })
  })

  it.each([null, true, [], 'high'])('allows replacing malformed persisted reasoning %j explicitly', (value) => {
    const onChange = mount({ id: 'm', reasoningEfforts: value })
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('custom')
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'high' }))
    expect(onChange).toHaveBeenLastCalledWith({ id: 'm', reasoningEfforts: { high: 'high' } })
  })

  it('shows invalid persisted null wire values without silently repairing them', () => {
    const onChange = mount({ id: 'm', reasoningEfforts: { high: null } })
    const high = screen.getByRole<HTMLInputElement>('textbox', { name: `${en.modelReasoningWire} high 2` })
    expect(high.value).toBe('')
    expect(high.getAttribute('aria-invalid')).toBe('true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it.each([
    undefined, false, { off: null, high: 'high' },
  ])('disables mutations for the declaration %j', (reasoningEfforts) => {
    const onChange = mount({ id: 'm', reasoningEfforts }, true)
    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(true)
    for (const input of screen.queryAllByRole<HTMLInputElement>('checkbox')) {
      expect(input.disabled).toBe(true)
      input.click()
    }
    for (const input of screen.queryAllByRole<HTMLInputElement>('textbox')) expect(input.disabled).toBe(true)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('localizes labels while retaining protocol ids', () => {
    mount({ id: 'm', reasoningEfforts: { off: null, high: 'ultra' } }, false, zh)
    expect(screen.getByRole('group', { name: `${zh.modelReasoning} 2` })).toBeTruthy()
    expect(screen.getByRole('option', { name: zh.modelReasoningDisabled })).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: `${zh.modelReasoningWire} high 2` }).value).toBe('ultra')
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: `${zh.modelReasoningWire} off 2` }).placeholder).toBe(zh.modelReasoningOffEmpty)
  })
})

describe('pi-ai reasoning validation', () => {
  it.each([
    undefined, false,
    { high: 'high' },
    { off: null, minimal: 'minimal', low: 'low', medium: 'medium', high: 'high', xhigh: 'xhigh', max: 'ultra' },
    { off: 'none', high: 'high' },
  ])('accepts %j without changing it', (reasoningEfforts) => {
    const model = { id: 'm', reasoningEfforts }
    const before = structuredClone(model)
    expect(validatePiAiModels([model])).toBeUndefined()
    expect(model).toEqual(before)
  })

  it.each([
    [null, 'modelReasoningInvalid'],
    [true, 'modelReasoningInvalid'],
    ['high', 'modelReasoningInvalid'],
    [[], 'modelReasoningInvalid'],
    [{ ultra: 'ultra' }, 'modelReasoningInvalid'],
    [{}, 'modelReasoningLevelRequired'],
    [{ off: null }, 'modelReasoningLevelRequired'],
    [{ off: 'none' }, 'modelReasoningLevelRequired'],
    [{ high: null }, 'modelReasoningWireInvalid'],
    [{ high: '' }, 'modelReasoningWireInvalid'],
    [{ high: 42 }, 'modelReasoningWireInvalid'],
    [{ high: false }, 'modelReasoningWireInvalid'],
    [{ off: '', high: 'high' }, 'modelReasoningWireInvalid'],
    [{ off: true, high: 'high' }, 'modelReasoningWireInvalid'],
  ])('rejects %j at its row', (reasoningEfforts, key) => {
    expect(validatePiAiModels([{ id: 'valid' }, { id: 'invalid', reasoningEfforts }])).toEqual({ index: 1, key })
  })

  it('keeps common model validation and inherited arrays', () => {
    expect(validatePiAiModels([{}])).toEqual({ index: 0, key: 'modelIdRequired' })
    expect(validatePiAiModels(undefined)).toBeUndefined()
  })
})
