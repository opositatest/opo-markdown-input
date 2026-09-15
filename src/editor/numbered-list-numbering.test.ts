import { describe, it, expect, vi } from 'vitest'
import {
  NUMBERED_LIST_AUTOFORMAT_SOURCE,
  createNumberPreservingNumberedListItemSpec,
  getUpcomingNumberedIndex,
  resolveUpcomingNumberedIndex,
} from './numbered-list-numbering'

const numbered = (start?: number) => ({ type: 'numberedListItem', props: { start } })

function createFlatEditor(blocks: Array<{ id: string; type?: string; props?: { start?: number } }>, cursorIndex: number) {
  return {
    document: blocks,
    getTextCursorPosition: () => ({ block: blocks[cursorIndex], parentBlock: undefined }),
  }
}

function createNestedEditor(
  children: Array<{ id: string; type?: string; props?: { start?: number } }>,
  cursorIndex: number,
) {
  const parentBlock = { id: 'parent', type: 'paragraph', children }
  return {
    document: [parentBlock],
    getTextCursorPosition: () => ({ block: children[cursorIndex], parentBlock }),
  }
}

function match(typed: string): RegExpMatchArray {
  const result = new RegExp(NUMBERED_LIST_AUTOFORMAT_SOURCE).exec(typed)
  if (!result) {
    throw new Error(`"${typed}" does not match the autoformat rule`)
  }

  return result
}

type TTestExtension = {
  key: string
  inputRules: Array<{ find: RegExp; replace: (props: unknown) => unknown }>
  keyboardShortcuts?: Record<string, unknown>
  prosemirrorPlugins?: unknown[]
}

function createSpecExtension(spec: unknown, index = 0): TTestExtension {
  const extensions = (spec as { extensions: Array<(context: unknown) => TTestExtension> }).extensions
  return extensions[index]({ editor: undefined })
}

describe('resolveUpcomingNumberedIndex', () => {
  it('returns 1 when nothing precedes the new item', () => {
    expect(resolveUpcomingNumberedIndex([], 0)).toBe(1)
    expect(resolveUpcomingNumberedIndex([{ type: 'paragraph' }], 1)).toBe(1)
  })

  it('continues the run of numbered items before the new one', () => {
    const siblings = [numbered(), numbered()]
    expect(resolveUpcomingNumberedIndex(siblings, 1)).toBe(2)
    expect(resolveUpcomingNumberedIndex(siblings, 2)).toBe(3)
  })

  it('starts over after a non-numbered block', () => {
    const siblings = [numbered(), numbered(), { type: 'paragraph' }]
    expect(resolveUpcomingNumberedIndex(siblings, 3)).toBe(1)
  })

  it('respects the start of the run', () => {
    const siblings = [numbered(3), numbered()]
    expect(resolveUpcomingNumberedIndex(siblings, 1)).toBe(4)
    expect(resolveUpcomingNumberedIndex(siblings, 2)).toBe(5)
  })
})

describe('getUpcomingNumberedIndex', () => {
  it('resolves the position from the block holding the cursor', () => {
    const editor = createFlatEditor(
      [{ id: 'a', ...numbered() }, { id: 'b', ...numbered() }, { id: 'c' }],
      2,
    )

    expect(getUpcomingNumberedIndex(editor)).toBe(3)
  })

  it('looks at the siblings of a nested block', () => {
    const editor = createNestedEditor([{ id: 'a', ...numbered() }, { id: 'b' }], 1)

    expect(getUpcomingNumberedIndex(editor)).toBe(2)
  })

  it('falls back to 1 when the cursor block cannot be located', () => {
    const editor = {
      document: [],
      getTextCursorPosition: () => ({ block: { id: 'missing' }, parentBlock: undefined }),
    }

    expect(getUpcomingNumberedIndex(editor)).toBe(1)
  })
})

describe('createNumberPreservingNumberedListItemSpec', () => {
  it('keeps the upstream shortcuts and plugins', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())

    expect(extension.key).toBe('numbered-list-item-shortcuts')
    expect(Object.keys(extension.keyboardShortcuts ?? {})).toEqual(['Enter', 'Mod-Shift-7'])
    expect(extension.prosemirrorPlugins).toHaveLength(1)
  })

  it('replaces the upstream ordered-list autoformat rule', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())

    expect(extension.inputRules).toHaveLength(1)
    // Guardrail: if upstream renames or changes this rule, this test fails
    // instead of the autoformat silently going back to its old behaviour.
    expect(extension.inputRules[0].find.source).toBe(NUMBERED_LIST_AUTOFORMAT_SOURCE)
  })

  it('converts "1. " into a list item when the number matches the automatic one', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())
    const editor = createFlatEditor([{ id: 'a', type: 'paragraph' }], 0)

    const result = extension.inputRules[0].replace({
      match: match('1. '),
      range: { from: 0, to: 0 },
      editor,
    })

    expect(result).toEqual({ type: 'numberedListItem', props: { start: undefined } })
  })

  it('converts "2. " after an item 1', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())
    const editor = createFlatEditor([{ id: 'a', ...numbered() }, { id: 'b', type: 'paragraph' }], 1)

    const result = extension.inputRules[0].replace({
      match: match('2. '),
      range: { from: 0, to: 0 },
      editor,
    })

    expect(result).toEqual({ type: 'numberedListItem', props: { start: 2 } })
  })

  it('keeps the typed number as text when it differs from the automatic one', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())
    const editor = createFlatEditor([{ id: 'a', ...numbered() }, { id: 'b', type: 'paragraph' }], 1)

    const result = extension.inputRules[0].replace({
      match: match('3. '),
      range: { from: 0, to: 0 },
      editor,
    })

    expect(result).toBeUndefined()
  })

  it('never converts a heading', () => {
    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec())
    const editor = createFlatEditor([{ id: 'a', type: 'heading' }], 0)

    const result = extension.inputRules[0].replace({
      match: match('1. '),
      range: { from: 0, to: 0 },
      editor,
    })

    expect(result).toBeUndefined()
  })

  it('leaves rules that are not the ordered-list autoformat alone', () => {
    const rule = { find: /^#\s$/, replace: vi.fn() }
    const spec = {
      config: { type: 'numberedListItem' },
      extensions: [
        () => ({ key: 'other', inputRules: [rule], prosemirrorPlugins: [] }),
      ],
    }

    const extension = createSpecExtension(createNumberPreservingNumberedListItemSpec(spec))

    expect(extension.inputRules[0]).toBe(rule)
  })

  it('keeps already created extensions untouched', () => {
    const extension = { key: 'ready', inputRules: [{ find: /x/, replace: vi.fn() }] }
    const spec = {
      config: { type: 'numberedListItem' },
      extensions: [extension],
    }

    const created = createNumberPreservingNumberedListItemSpec(spec) as {
      extensions: unknown[]
    }

    expect(created.extensions[0]).toBe(extension)
  })
})
