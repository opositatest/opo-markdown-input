import { describe, it, expect } from 'vitest'
import { BlockNoteEditor } from '@blocknote/core'

import { editorSchema } from '../editor-schema'
import { NUMBERED_LIST_AUTOFORMAT_SOURCE } from '../numbered-list-numbering'
import { editorBlocksToMarkdown, markdownToEditorBlocks } from './editor-field-markdown'
import type { TMarkdownBlock, TMarkdownEditor } from './editor-field.types'

/**
 * Round-trip tests against the real BlockNote editor. The rest of the suite
 * stubs `blocksToMarkdownLossy`, which is exactly why a paragraph starting with
 * `3. ` could silently come back as a numbered list item.
 */
function createEditor(): TMarkdownEditor {
  return BlockNoteEditor.create({ schema: editorSchema }) as unknown as TMarkdownEditor
}

function paragraph(text: string): TMarkdownBlock {
  return { type: 'paragraph', content: [{ type: 'text', text, styles: {} }] }
}

function firstText(blocks: TMarkdownBlock[]): string {
  return blocks[0]?.content?.[0]?.text ?? ''
}

describe('editorBlocksToMarkdown round trip', () => {
  it('keeps a paragraph that starts with an ordered list marker a paragraph', () => {
    const editor = createEditor()
    const blocks = [paragraph('3. No será preciso acudir a un medio adecuado.')]

    const markdown = editorBlocksToMarkdown(editor, blocks)
    expect(markdown).toBe('3\\. No será preciso acudir a un medio adecuado.')

    const [reopened] = markdownToEditorBlocks(editor, markdown)
    expect(reopened?.type).toBe('paragraph')
    expect(firstText([reopened])).toBe('3. No será preciso acudir a un medio adecuado.')
  })

  it('keeps a paragraph that is only a number a paragraph', () => {
    const editor = createEditor()

    const markdown = editorBlocksToMarkdown(editor, [paragraph('3.')])
    const [reopened] = markdownToEditorBlocks(editor, markdown)

    expect(markdown).toBe('3\\.')
    expect(reopened?.type).toBe('paragraph')
    expect(firstText([reopened])).toBe('3.')
  })

  it('keeps paragraphs that start with other block markers', () => {
    const editor = createEditor()

    for (const text of ['- guion suelto', '* asterisco', '# almohadilla', '> mayor que']) {
      const markdown = editorBlocksToMarkdown(editor, [paragraph(text)])
      const [reopened] = markdownToEditorBlocks(editor, markdown)

      expect(reopened?.type, `"${text}" should stay a paragraph`).toBe('paragraph')
      expect(firstText([reopened]), `"${text}" should keep its text`).toBe(text)
    }
  })

  it('is stable when the escaped document is saved again', () => {
    const editor = createEditor()
    const blocks = [paragraph('3. No será preciso')]

    const once = editorBlocksToMarkdown(editor, blocks)
    const twice = editorBlocksToMarkdown(editor, markdownToEditorBlocks(editor, once))

    expect(twice).toBe(once)
  })

  it('does not escape real numbered list items', () => {
    const editor = createEditor()
    const blocks = markdownToEditorBlocks(editor, '1. uno\n\n2. dos')

    expect(editorBlocksToMarkdown(editor, blocks)).toBe('1. uno\n\n2. dos')
  })
})

describe('editor schema wiring', () => {
  it('does not keep the autoformat that would number a typed apartado by position', () => {
    const spec = editorSchema.blockSpecs.numberedListItem
    const [extension] = spec.extensions ?? []
    const created = extension as (context: unknown) => {
      inputRules?: Array<{ find: RegExp }>
    }

    const sources = created({ editor: undefined }).inputRules?.map((rule) => rule.find.source) ?? []

    expect(sources).not.toContain(NUMBERED_LIST_AUTOFORMAT_SOURCE)
  })
})
