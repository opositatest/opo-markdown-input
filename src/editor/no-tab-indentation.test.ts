import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BlockNoteEditor } from '@blocknote/core'

import { editorSchema } from './editor-schema'
import {
  NO_TAB_INDENTATION_EXTENSION_KEY,
  noTabIndentationExtension,
  shouldSwallowTab,
} from './no-tab-indentation'

/** Shared defaults: `shouldSwallowTab` is a pure decision function. */
function tabDecision(overrides: Partial<Parameters<typeof shouldSwallowTab>[0]> = {}) {
  return {
    key: 'Tab',
    shiftKey: false,
    isInCodeBlock: false,
    isInTable: false,
    canMoveToAdjacentTableCell: false,
    canNestIntoPreviousListBlock: false,
    isNestedBlock: false,
    ...overrides,
  }
}

const extension = noTabIndentationExtension({ editor: undefined as never })

describe('shouldSwallowTab', () => {
  it('ignores keys other than Tab', () => {
    expect(shouldSwallowTab(tabDecision({ key: 'Enter' }))).toBe(false)
  })

  it('leaves the editor on Tab inside a regular block', () => {
    expect(shouldSwallowTab(tabDecision())).toBe(true)
  })

  it('keeps indenting lines inside a code block', () => {
    expect(shouldSwallowTab(tabDecision({ isInCodeBlock: true }))).toBe(false)
  })

  it('leaves the editor on Shift-Tab inside a code block', () => {
    expect(shouldSwallowTab(tabDecision({ isInCodeBlock: true, shiftKey: true }))).toBe(true)
  })

  it('keeps moving between table cells', () => {
    expect(
      shouldSwallowTab(tabDecision({ isInTable: true, canMoveToAdjacentTableCell: true })),
    ).toBe(false)
  })

  it('leaves the editor at the edge of a table instead of indenting it', () => {
    expect(
      shouldSwallowTab(tabDecision({ isInTable: true, canMoveToAdjacentTableCell: false })),
    ).toBe(true)
  })

  // `goToNextCell` also returns false outside a table, so without the
  // `isInTable` gate a list would never be allowed to nest.
  it('does not treat "not in a table" as "at the edge of a table"', () => {
    expect(
      shouldSwallowTab(
        tabDecision({ isInTable: false, canNestIntoPreviousListBlock: true }),
      ),
    ).toBe(false)
  })

  it('never nests a list inside a table cell', () => {
    expect(
      shouldSwallowTab(
        tabDecision({
          isInTable: true,
          canMoveToAdjacentTableCell: false,
          canNestIntoPreviousListBlock: true,
        }),
      ),
    ).toBe(true)
  })

  it('lets BlockNote nest a list item that has a list item before it', () => {
    expect(shouldSwallowTab(tabDecision({ canNestIntoPreviousListBlock: true }))).toBe(false)
  })

  it('leaves the editor when the list item cannot nest', () => {
    expect(shouldSwallowTab(tabDecision({ canNestIntoPreviousListBlock: false }))).toBe(true)
  })

  it('lets BlockNote lift a nested block out on Shift-Tab', () => {
    expect(shouldSwallowTab(tabDecision({ shiftKey: true, isNestedBlock: true }))).toBe(false)
  })

  it('leaves the editor on Shift-Tab in a top level block', () => {
    expect(shouldSwallowTab(tabDecision({ shiftKey: true, isNestedBlock: false }))).toBe(true)
  })

  it('never nests on Shift-Tab, even in a nestable list item', () => {
    expect(
      shouldSwallowTab(tabDecision({ shiftKey: true, canNestIntoPreviousListBlock: true })),
    ).toBe(true)
  })
})

/**
 * `Tab` is defined by what the *editor* ends up doing, not only by the decision
 * above: the handler has to read a real ProseMirror state, and the nesting only
 * happens if returning `false` really hands the keydown back to BlockNote's
 * shortcut. These tests mount a real editor and replay prosemirror-view's own
 * dispatcher (`handleDOMEvents` first, then tiptap's `handleKeyDown` keymap),
 * exactly like `numbered-list-typing.test.ts` does for typing.
 */
function createEditor() {
  return BlockNoteEditor.create({
    schema: editorSchema,
    extensions: [noTabIndentationExtension],
  })
}

type TEditor = ReturnType<typeof createEditor>

type TBlock = TEditor['document'][number]

let editor: TEditor
let host: HTMLDivElement

beforeAll(() => {
  editor = createEditor()
  host = document.createElement('div')
  document.body.appendChild(host)
  editor.mount(host)
})

afterAll(() => {
  editor.unmount()
  host.remove()
})

function setContent(blocks: Parameters<TEditor['replaceBlocks']>[1]): void {
  editor.replaceBlocks(editor.document, blocks)
}

/** Places the cursor in `block` and reports what the real keydown handlers did. */
function pressTab(
  block: TBlock,
  shiftKey = false,
  at: 'start' | 'end' = 'end',
): { swallowed: boolean; handled: boolean } {
  editor.setTextCursorPosition(block, at)
  const view = editor.prosemirrorView
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  })

  const swallowed = Boolean(
    view.someProp('handleDOMEvents', (handlers) =>
      handlers.keydown ? handlers.keydown(view, event) : false,
    ),
  )

  if (swallowed) {
    return { swallowed, handled: false }
  }

  return {
    swallowed,
    handled: Boolean(view.someProp('handleKeyDown', (handler) => handler(view, event))),
  }
}

function toMarkdown(): string {
  return editor.blocksToMarkdownLossy(editor.document)
}

function blockText(block: TBlock): string {
  return (block.content as { text?: string }[])
    .map((inlineContent) => inlineContent.text ?? '')
    .join('')
}

/** Top level blocks only: the editor keeps a trailing empty paragraph of its own. */
function topLevelTypes(): string[] {
  return editor.document.map((block) => block.type)
}

function childTypes(block: TBlock): string[] {
  return block.children.map((child) => child.type)
}

describe('Tab inside a list', () => {
  it.each(['bulletListItem', 'checkListItem', 'numberedListItem', 'toggleListItem'] as const)(
    'nests the second %s under the first one',
    (type) => {
      setContent([
        { type, content: 'parent' },
        { type, content: 'child' },
      ])

      const result = pressTab(editor.document[1])

      expect(result).toEqual({ swallowed: false, handled: true })
      expect(childTypes(editor.document[0])).toEqual([type])
      expect(topLevelTypes()).toEqual([type, 'paragraph'])
    },
  )

  it('stores nested bullets as a nested Markdown list that survives a re-parse', () => {
    setContent([
      { type: 'bulletListItem', content: 'parent' },
      { type: 'bulletListItem', content: 'child' },
    ])

    pressTab(editor.document[1])

    expect(toMarkdown()).toBe('* parent\n\n  * child\n')
    expect(childTypes(editor.tryParseMarkdownToBlocks(toMarkdown())[0] as TBlock)).toEqual([
      'bulletListItem',
    ])
  })

  it('stores nested numbered items as a nested Markdown list that survives a re-parse', () => {
    setContent([
      { type: 'numberedListItem', content: 'uno' },
      { type: 'numberedListItem', content: 'dos' },
    ])

    pressTab(editor.document[1])

    const markdown = toMarkdown()
    expect(markdown).toBe('1. uno\n\n   1. dos\n')
    expect(childTypes(editor.tryParseMarkdownToBlocks(markdown)[0] as TBlock)).toEqual([
      'numberedListItem',
    ])
  })

  it('leaves the editor on Tab in the first item of a list', () => {
    setContent([
      { type: 'bulletListItem', content: 'first' },
      { type: 'bulletListItem', content: 'second' },
    ])

    const result = pressTab(editor.document[0])

    expect(result).toEqual({ swallowed: true, handled: false })
    expect(childTypes(editor.document[0])).toEqual([])
  })

  it('lifts a nested list item back out on Shift-Tab', () => {
    setContent([
      {
        type: 'bulletListItem',
        content: 'parent',
        children: [{ type: 'bulletListItem', content: 'child' }],
      },
    ])

    const result = pressTab(editor.document[0].children[0] as TBlock, true)

    expect(result).toEqual({ swallowed: false, handled: true })
    expect(childTypes(editor.document[0])).toEqual([])
    expect(topLevelTypes()).toEqual(['bulletListItem', 'bulletListItem', 'paragraph'])
  })

  it('leaves the editor on Shift-Tab in a top level list item', () => {
    setContent([{ type: 'bulletListItem', content: 'top level' }])

    expect(pressTab(editor.document[0], true)).toEqual({ swallowed: true, handled: false })
    expect(topLevelTypes()).toEqual(['bulletListItem', 'paragraph'])
  })

  // Nesting a list under a paragraph is not a nested list in Markdown: it comes
  // back as two siblings. Only a list item under a list item is allowed.
  it('does not nest a list item whose previous sibling is a paragraph', () => {
    setContent([
      { type: 'paragraph', content: 'intro' },
      { type: 'bulletListItem', content: 'item' },
    ])

    const result = pressTab(editor.document[1])

    expect(result).toEqual({ swallowed: true, handled: false })
    expect(topLevelTypes()).toEqual(['paragraph', 'bulletListItem', 'paragraph'])
  })

  it('does not nest a paragraph after a list item', () => {
    setContent([
      { type: 'bulletListItem', content: 'item' },
      { type: 'paragraph', content: 'after' },
    ])

    const result = pressTab(editor.document[1])

    expect(result).toEqual({ swallowed: true, handled: false })
    expect(childTypes(editor.document[0])).toEqual([])
  })

  it('does not nest the second of two paragraphs', () => {
    setContent([
      { type: 'paragraph', content: 'one' },
      { type: 'paragraph', content: 'two' },
    ])

    const result = pressTab(editor.document[1])

    expect(result).toEqual({ swallowed: true, handled: false })
    expect(topLevelTypes()).toEqual(['paragraph', 'paragraph', 'paragraph'])
  })
})

describe('Tab in the blocks with their own behaviour', () => {
  it('still inserts two spaces in a code block after another block', () => {
    setContent([
      { type: 'paragraph', content: 'intro' },
      { type: 'codeBlock', content: 'line' },
    ])

    const result = pressTab(editor.document[1])

    expect(result).toEqual({ swallowed: false, handled: true })
    expect(blockText(editor.document[1])).toBe('line  ')
    expect(topLevelTypes()).toEqual(['paragraph', 'codeBlock', 'paragraph'])
  })

  it('leaves the editor on Shift-Tab in a code block', () => {
    setContent([{ type: 'codeBlock', content: 'line' }])

    expect(pressTab(editor.document[0], true)).toEqual({ swallowed: true, handled: false })
    expect(blockText(editor.document[0])).toBe('line')
  })

  it('walks between table cells and leaves the editor in the last one', () => {
    setContent([
      {
        type: 'table',
        content: {
          type: 'tableContent',
          rows: [{ cells: ['first', 'second'] }],
        },
      },
    ])

    // Setting the cursor on the table block itself resolves into a cell, so the
    // first Tab has a neighbouring cell to move to and the second one doesn't.
    const first = pressTab(editor.document[0], false, 'start')
    const cellAfterFirstTab = editor.prosemirrorView.state.selection.$head.parent.textContent
    const second = pressTab(editor.document[0])

    expect(first).toEqual({ swallowed: false, handled: true })
    expect(cellAfterFirstTab).toBe('second')
    expect(second).toEqual({ swallowed: true, handled: false })
  })
})

describe('noTabIndentationExtension', () => {
  it('is registered under a stable key', () => {
    expect(extension.key).toBe(NO_TAB_INDENTATION_EXTENSION_KEY)
  })
})
