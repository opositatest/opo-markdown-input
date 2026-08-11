import { describe, it, expect, vi } from 'vitest'
import type { TMarkdownEditor } from './editor-field.types'
import { markdownToEditorBlocks, editorBlocksToMarkdown } from './editor-field-markdown'

function createMockEditor(overrides?: Partial<TMarkdownEditor>): TMarkdownEditor {
  return {
    document: [],
    tryParseMarkdownToBlocks: vi.fn().mockReturnValue([]),
    blocksToMarkdownLossy: vi.fn().mockReturnValue(''),
    ...overrides,
  }
}

describe('markdownToEditorBlocks', () => {
  it('returns empty paragraph for empty input', () => {
    const editor = createMockEditor()
    const result = markdownToEditorBlocks(editor, '')
    expect(result).toEqual([{ type: 'paragraph' }])
  })

  it('returns empty paragraph for whitespace-only input', () => {
    const editor = createMockEditor()
    const result = markdownToEditorBlocks(editor, '   \n  \n  ')
    expect(result).toEqual([{ type: 'paragraph' }])
  })

  it('delegates plain markdown to editor.tryParseMarkdownToBlocks', () => {
    const mockBlocks = [{ type: 'paragraph' }]
    const editor = createMockEditor({
      tryParseMarkdownToBlocks: vi.fn().mockReturnValue(mockBlocks),
    })

    const result = markdownToEditorBlocks(editor, 'Hello world')
    expect(result).toEqual(mockBlocks)
    expect(editor.tryParseMarkdownToBlocks).toHaveBeenCalledWith('Hello world')
  })

  it('parses math blocks with $$ delimiters', () => {
    const editor = createMockEditor()
    const markdown = '$$\nE = mc^2\n$$'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([{ type: 'math', props: { latex: 'E = mc^2' } }])
    expect(editor.tryParseMarkdownToBlocks).not.toHaveBeenCalled()
  })

  it('parses mixed markdown and math blocks', () => {
    const paragraphBlocks = [{ type: 'paragraph' }]
    const editor = createMockEditor({
      tryParseMarkdownToBlocks: vi.fn().mockReturnValue(paragraphBlocks),
    })

    const markdown = 'Some text\n\n$$\nx^2\n$$\n\nMore text'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      { type: 'paragraph' },
      { type: 'math', props: { latex: 'x^2' } },
      { type: 'paragraph' },
    ])
  })

  it('normalizes \\r\\n to \\n', () => {
    const editor = createMockEditor()
    const markdown = 'Line 1\r\n$$\na + b\r\n$$'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([{ type: 'math', props: { latex: 'a + b' } }])
  })

  it('handles unclosed math delimiter by treating it as markdown', () => {
    const mockBlocks = [{ type: 'paragraph' }]
    const editor = createMockEditor({
      tryParseMarkdownToBlocks: vi.fn().mockReturnValue(mockBlocks),
    })

    const markdown = '$$\nunclosed math'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(editor.tryParseMarkdownToBlocks).toHaveBeenCalled()
    expect(result).toEqual(mockBlocks)
  })

  it('handles math block with multiline content', () => {
    const editor = createMockEditor()
    const markdown = '$$\n\\frac{1}{2}\n\\int_0^1 x\\,dx\n$$'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      { type: 'math', props: { latex: '\\frac{1}{2}\n\\int_0^1 x\\,dx' } },
    ])
  })

  it('trims whitespace inside math delimiters', () => {
    const editor = createMockEditor()
    const markdown = '$$\n  E = mc^2  \n$$'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([{ type: 'math', props: { latex: 'E = mc^2' } }])
  })

  it('handles multiple math blocks', () => {
    const editor = createMockEditor()
    const markdown = '$$\na\n$$\n\n$$\nb\n$$'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      { type: 'math', props: { latex: 'a' } },
      { type: 'math', props: { latex: 'b' } },
    ])
  })

  it('parses a legacy resized image line into a plain image block, ignoring the width', () => {
    const editor = createMockEditor()
    const markdown = '<img src="https://example.com/cat.png" alt="A cat" width="320">'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      {
        type: 'image',
        props: { url: 'https://example.com/cat.png', name: 'A cat' },
      },
    ])
    expect(editor.tryParseMarkdownToBlocks).not.toHaveBeenCalled()
  })

  it('parses a legacy resized image line without alt text', () => {
    const editor = createMockEditor()
    const markdown = '<img src="https://example.com/cat.png" width="200">'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      {
        type: 'image',
        props: { url: 'https://example.com/cat.png', name: '' },
      },
    ])
  })

  it('unescapes attribute entities in legacy resized image lines', () => {
    const editor = createMockEditor()
    const markdown = '<img src="https://example.com/cat.png?a=1&amp;b=2" alt="&quot;Cat&quot; &amp; friends" width="150">'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      {
        type: 'image',
        props: {
          url: 'https://example.com/cat.png?a=1&b=2',
          name: '"Cat" & friends',
        },
      },
    ])
  })

  it('parses mixed markdown, legacy resized image and math blocks', () => {
    const paragraphBlocks = [{ type: 'paragraph' }]
    const editor = createMockEditor({
      tryParseMarkdownToBlocks: vi.fn().mockReturnValue(paragraphBlocks),
    })

    const markdown = 'Some text\n\n<img src="https://example.com/cat.png" width="320">\n\n$$\nx^2\n$$\n\nMore text'
    const result = markdownToEditorBlocks(editor, markdown)

    expect(result).toEqual([
      { type: 'paragraph' },
      { type: 'image', props: { url: 'https://example.com/cat.png', name: '' } },
      { type: 'math', props: { latex: 'x^2' } },
      { type: 'paragraph' },
    ])
  })
})

describe('editorBlocksToMarkdown', () => {
  it('returns empty string for empty blocks', () => {
    const editor = createMockEditor()
    const result = editorBlocksToMarkdown(editor, [])
    expect(result).toBe('')
  })

  it('uses editor.document when blocks not provided', () => {
    const doc = [{ type: 'paragraph' }]
    const editor = createMockEditor({ document: doc })
    editorBlocksToMarkdown(editor)
    expect(editor.blocksToMarkdownLossy).toHaveBeenCalledWith(doc)
  })

  it('converts non-math blocks via editor.blocksToMarkdownLossy', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Hello world'),
    })

    const blocks = [{ type: 'paragraph' }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Hello world')
  })

  it('formats math blocks with $$ delimiters', () => {
    const editor = createMockEditor()
    const blocks = [{ type: 'math', props: { latex: 'E = mc^2' } }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('$$\nE = mc^2\n$$')
  })

  it('mixes math and non-math blocks correctly', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Some text'),
    })

    const blocks = [
      { type: 'paragraph' },
      { type: 'math', props: { latex: 'x^2' } },
      { type: 'paragraph' },
    ]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Some text\n\n$$\nx^2\n$$\n\nSome text')
  })

  it('skips math blocks with empty latex', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Text'),
    })

    const blocks = [
      { type: 'math', props: { latex: '' } },
      { type: 'paragraph' },
    ]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Text')
  })

  it('skips math blocks with whitespace-only latex', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Text'),
    })

    const blocks = [
      { type: 'math', props: { latex: '   ' } },
      { type: 'paragraph' },
    ]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Text')
  })

  it('skips math blocks without props', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Text'),
    })

    const blocks = [{ type: 'math' }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Text')
  })

  it('trims trailing newline in latex so delimiters stay adjacent to content', () => {
    const editor = createMockEditor()
    const blocks = [{ type: 'math', props: { latex: 'x=\\frac{-b}{2a}\n' } }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('$$\nx=\\frac{-b}{2a}\n$$')
  })

  it('trims surrounding whitespace in latex before serializing', () => {
    const editor = createMockEditor()
    const blocks = [{ type: 'math', props: { latex: '  E = mc^2  \n\n' } }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('$$\nE = mc^2\n$$')
  })

  it('delegates any image block to editor.blocksToMarkdownLossy', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('![A cat](https://example.com/cat.png)'),
    })
    const blocks = [{ type: 'image', props: { url: 'https://example.com/cat.png', name: 'A cat' } }]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('![A cat](https://example.com/cat.png)')
  })

  it('mixes image, regular markdown and math blocks', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('Some text'),
    })

    const blocks = [
      { type: 'paragraph' },
      { type: 'image', props: { url: 'https://example.com/cat.png' } },
      { type: 'math', props: { latex: 'x^2' } },
    ]
    const result = editorBlocksToMarkdown(editor, blocks)

    expect(result).toBe('Some text\n\n$$\nx^2\n$$')
  })

  it('drops a manually fixed width when re-exporting a document loaded from legacy content', () => {
    const editor = createMockEditor({
      blocksToMarkdownLossy: vi.fn().mockReturnValue('![A cat](https://example.com/cat.png)'),
    })
    const legacyMarkdown = '<img src="https://example.com/cat.png" alt="A cat" width="320">'

    const blocks = markdownToEditorBlocks(editor, legacyMarkdown)
    const reexportedMarkdown = editorBlocksToMarkdown(editor, blocks)

    expect(reexportedMarkdown).toBe('![A cat](https://example.com/cat.png)')
    expect(editor.blocksToMarkdownLossy).toHaveBeenCalledWith(blocks)
  })
})
