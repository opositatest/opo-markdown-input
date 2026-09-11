import { describe, it, expect } from 'vitest'
import type { EditorView } from '@tiptap/pm/view'

import {
  NO_TAB_INDENTATION_EXTENSION_KEY,
  noTabIndentationExtension,
  shouldSwallowTab,
} from './no-tab-indentation'

/**
 * The handler only reads the current block/node and asks prosemirror-tables
 * whether a neighbouring cell exists (`depth: 0` => not in a table), so a
 * minimal stand-in is enough - the repo's tests never mount a real editor.
 */
function createFakeView(nodeName: string): EditorView {
  return {
    state: {
      selection: {
        $from: { parent: { type: { name: nodeName } } },
        $head: { depth: 0, node: () => ({ type: { spec: {} } }) },
      },
    },
  } as unknown as EditorView
}

function createTabEvent(shiftKey = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey })
}

const extension = noTabIndentationExtension({ editor: undefined as never })
const plugin = extension.prosemirrorPlugins![0]
const handleKeydown = plugin.props.handleDOMEvents!.keydown!

describe('shouldSwallowTab', () => {
  it('ignores keys other than Tab', () => {
    expect(
      shouldSwallowTab({
        key: 'Enter',
        shiftKey: false,
        isInCodeBlock: false,
        canMoveToAdjacentTableCell: false,
      }),
    ).toBe(false)
  })

  it('leaves the editor on Tab inside a regular block', () => {
    expect(
      shouldSwallowTab({
        key: 'Tab',
        shiftKey: false,
        isInCodeBlock: false,
        canMoveToAdjacentTableCell: false,
      }),
    ).toBe(true)
  })

  it('keeps indenting lines inside a code block', () => {
    expect(
      shouldSwallowTab({
        key: 'Tab',
        shiftKey: false,
        isInCodeBlock: true,
        canMoveToAdjacentTableCell: false,
      }),
    ).toBe(false)
  })

  it('leaves the editor on Shift-Tab inside a code block', () => {
    expect(
      shouldSwallowTab({
        key: 'Tab',
        shiftKey: true,
        isInCodeBlock: true,
        canMoveToAdjacentTableCell: false,
      }),
    ).toBe(true)
  })

  it('keeps moving between table cells', () => {
    expect(
      shouldSwallowTab({
        key: 'Tab',
        shiftKey: false,
        isInCodeBlock: false,
        canMoveToAdjacentTableCell: true,
      }),
    ).toBe(false)
  })

  it('leaves the editor at the edge of a table instead of indenting it', () => {
    expect(
      shouldSwallowTab({
        key: 'Tab',
        shiftKey: false,
        isInCodeBlock: false,
        canMoveToAdjacentTableCell: false,
      }),
    ).toBe(true)
  })
})

describe('noTabIndentationExtension', () => {
  it('is registered under a stable key', () => {
    expect(extension.key).toBe(NO_TAB_INDENTATION_EXTENSION_KEY)
  })

  it('swallows Tab in a paragraph so the browser can move focus', () => {
    expect(handleKeydown.call(plugin, createFakeView('paragraph'), createTabEvent())).toBe(true)
  })

  it('lets BlockNote handle Tab inside a code block', () => {
    expect(handleKeydown.call(plugin, createFakeView('codeBlock'), createTabEvent())).toBe(false)
  })

  it('swallows Shift-Tab inside a code block', () => {
    expect(handleKeydown.call(plugin, createFakeView('codeBlock'), createTabEvent(true))).toBe(true)
  })

  it('ignores any other key', () => {
    const view = createFakeView('paragraph')
    const event = new KeyboardEvent('keydown', { key: 'Enter' })

    expect(handleKeydown.call(plugin, view, event)).toBe(false)
  })
})
