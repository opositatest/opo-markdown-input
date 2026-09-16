import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { BlockNoteEditor } from '@blocknote/core'

import { editorSchema } from './editor-schema'

/**
 * Typing is where the author notices this behaviour, so it has to hold through
 * the editor's real input rule plumbing, not only through the spec
 * (`numbered-list-numbering.test.ts`).
 *
 * `typeText` and `pressEnter` reproduce a keystroke the way ProseMirror does: by
 * calling the `handleTextInput` / `handleKeyDown` prop of every plugin in order.
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
  const performDefaultInsert = () => view.state.tr.insertText(text, from, to)
  const handled = view.someProp('handleTextInput', (handler) =>
    handler(view, from, to, text, performDefaultInsert),
  )
  if (!handled) {
    view.dispatch(performDefaultInsert().scrollIntoView())
  }
}

function pressEnter(): void {
  const view = editor.prosemirrorView
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
  view.someProp('handleKeyDown', (handler) => handler(view, event))
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
  it('keeps "1. " as text instead of creating a numbered list', () => {
    setContent([{ type: 'paragraph', content: '1.' }])
    focusBlock(0)

    typeText(' ')

    expect(blocksWithText()[0]).toEqual({ type: 'paragraph', text: '1. ' })
  })

  it('keeps "3. " as text right after an existing list item', () => {
    setContent([
      { type: 'numberedListItem', content: 'apartado uno' },
      { type: 'paragraph', content: '3.' },
    ])
    focusBlock(1)

    typeText(' ')

    expect(blocksWithText()[1]).toEqual({ type: 'paragraph', text: '3. ' })
  })

  it('keeps every apartado the author writes as text, Enter included', () => {
    setContent([{ type: 'paragraph', content: '1.' }])
    focusBlock(0)

    typeText(' ')
    pressEnter()
    typeText('3')
    typeText('.')
    typeText(' ')

    expect(blocksWithText().slice(0, 2)).toEqual([
      { type: 'paragraph', text: '1. ' },
      { type: 'paragraph', text: '3. ' },
    ])
  })

  it('never converts a heading', () => {
    setContent([{ type: 'heading', props: { level: 1 }, content: '1.' }])
    focusBlock(0)

    typeText(' ')

    expect(blocksWithText()[0]).toEqual({ type: 'heading', text: '1. ' })
  })
})
