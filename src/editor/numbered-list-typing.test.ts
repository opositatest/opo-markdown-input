import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { BlockNoteEditor } from '@blocknote/core'

import { editorSchema } from './editor-schema'

/**
 * Typing a number at the end of a paragraph is what the author sees, so the
 * "keep the number I typed" behaviour has to hold through the editor's real
 * input rule plumbing, not only through the rule object (`numbered-list-numbering.test.ts`).
 *
 * `typeText` reproduces a keystroke the way ProseMirror does: it calls the
 * `handleTextInput` prop of every plugin in order, which is where BlockNote's
 * input rules live.
 */
function createEditor() {
  return BlockNoteEditor.create({ schema: editorSchema })
}

type TEditor = ReturnType<typeof createEditor>

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

function typeText(text: string): void {
  const view = editor.prosemirrorView
  const { from, to } = view.state.selection
  // Same flow as prosemirror-view's own keypress handling: every plugin gets a
  // chance to handle the input, and the browser's default insertion is used
  // when nobody does.
  const performDefaultInsert = () => view.state.tr.insertText(text, from, to)
  const handled = view.someProp('handleTextInput', (handler) =>
    handler(view, from, to, text, performDefaultInsert),
  )
  if (!handled) {
    view.dispatch(performDefaultInsert().scrollIntoView())
  }
}

function setContent(blocks: Parameters<TEditor['replaceBlocks']>[1]): void {
  editor.replaceBlocks(editor.document, blocks)
}

// `focusBlock` walks the document instead of using the last block: the editor
// keeps a trailing empty paragraph of its own at the end of the document.
function focusBlock(index: number): void {
  editor.setTextCursorPosition(editor.document[index], 'end')
}

function blocksWithText(): Array<{ type: string; text: string }> {
  return editor.document.map((block) => {
    const content = Array.isArray(block.content) ? block.content : []
    const first = content[0] as { text?: string } | undefined
    return { type: block.type, text: first?.text ?? '' }
  })
}

describe('typing a number in a paragraph', () => {
  it('keeps the typed number as text when it differs from the automatic one', () => {
    setContent([
      { type: 'numberedListItem', content: 'uno' },
      { type: 'paragraph', content: '3.' },
    ])
    focusBlock(1)

    typeText(' ')

    // The author wrote 3, so the block keeps the 3 as text (the space the
    // browser inserts on top of it included) instead of being renumbered to 2.
    expect(blocksWithText()[1]).toEqual({ type: 'paragraph', text: '3. ' })
  })

  it('converts into a list item when the typed number matches the automatic one', () => {
    setContent([
      { type: 'numberedListItem', content: 'uno' },
      { type: 'paragraph', content: '2.' },
    ])
    focusBlock(1)

    typeText(' ')

    expect(blocksWithText()[1]).toEqual({ type: 'numberedListItem', text: '' })
  })

  it('converts 1. in a paragraph that does not follow a list', () => {
    setContent([{ type: 'paragraph', content: '1.' }])
    focusBlock(0)

    typeText(' ')

    expect(blocksWithText()[0]).toEqual({ type: 'numberedListItem', text: '' })
  })

  it('never converts a heading', () => {
    setContent([{ type: 'heading', props: { level: 1 }, content: '1.' }])
    focusBlock(0)

    typeText(' ')

    expect(blocksWithText()[0]).toEqual({ type: 'heading', text: '1. ' })
  })
})
