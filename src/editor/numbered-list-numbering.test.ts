import { describe, it, expect, vi } from 'vitest'
import { defaultBlockSpecs } from '@blocknote/core'

import {
  NUMBERED_LIST_AUTOFORMAT_SOURCE,
  createNumberedListItemSpecWithoutAutoformat,
} from './numbered-list-numbering'

type TTestExtension = {
  key: string
  inputRules?: Array<{ find: RegExp }>
  keyboardShortcuts?: Record<string, unknown>
  prosemirrorPlugins?: unknown[]
}

function createSpecExtension(spec: unknown, index = 0): TTestExtension {
  const extensions = (spec as { extensions: Array<(context: unknown) => TTestExtension> }).extensions
  return extensions[index]({ editor: undefined })
}

function upstreamInputRuleSources(): string[] {
  const spec = defaultBlockSpecs.numberedListItem as unknown as {
    extensions: Array<(context: unknown) => TTestExtension>
  }

  return spec.extensions[0]({ editor: undefined }).inputRules?.map((rule) => rule.find.source) ?? []
}

describe('createNumberedListItemSpecWithoutAutoformat', () => {
  it('removes the ordered-list autoformat that upstream defines', () => {
    // Guardrail: if upstream renames or removes this rule our filter stops
    // matching and typing `1. ` would silently turn into a list again.
    expect(upstreamInputRuleSources()).toContain(NUMBERED_LIST_AUTOFORMAT_SOURCE)

    const extension = createSpecExtension(createNumberedListItemSpecWithoutAutoformat())

    expect(extension.inputRules?.map((rule) => rule.find.source) ?? []).not.toContain(
      NUMBERED_LIST_AUTOFORMAT_SOURCE,
    )
  })

  it('keeps the upstream shortcuts and plugins, so lists still work on purpose', () => {
    const extension = createSpecExtension(createNumberedListItemSpecWithoutAutoformat())

    expect(extension.key).toBe('numbered-list-item-shortcuts')
    expect(Object.keys(extension.keyboardShortcuts ?? {})).toEqual(['Enter', 'Mod-Shift-7'])
    expect(extension.prosemirrorPlugins).toHaveLength(1)
  })

  it('leaves other input rules alone', () => {
    const rule = { find: /^#\s$/, replace: vi.fn() }
    const spec = {
      config: { type: 'numberedListItem' },
      extensions: [() => ({ key: 'other', inputRules: [rule], prosemirrorPlugins: [] })],
    }

    const extension = createSpecExtension(createNumberedListItemSpecWithoutAutoformat(spec))

    expect(extension.inputRules?.[0]).toBe(rule)
  })

  it('keeps already created extensions untouched', () => {
    const extension = { key: 'ready', inputRules: [{ find: /x/, replace: vi.fn() }] }
    const spec = { config: { type: 'numberedListItem' }, extensions: [extension] }

    const created = createNumberedListItemSpecWithoutAutoformat(spec) as { extensions: unknown[] }

    expect(created.extensions[0]).toBe(extension)
  })
})
