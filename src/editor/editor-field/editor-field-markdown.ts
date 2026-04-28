import type { TMarkdownBlock, TMarkdownEditor } from './editor-field.types'

type TMarkdownSegment =
  | { type: 'markdown'; value: string }
  | { type: 'math'; value: string }

export function markdownToEditorBlocks(
  editor: TMarkdownEditor,
  markdown: string,
): TMarkdownBlock[] {
  const segments = splitMarkdownSegments(markdown)
  const blocks = segments.flatMap((segment) => {
    if (segment.type === 'math') {
      return [{ type: 'math', props: { latex: segment.value } }]
    }

    if (!segment.value.trim()) {
      return []
    }

    return editor.tryParseMarkdownToBlocks(segment.value)
  })

  return blocks.length > 0 ? blocks : [{ type: 'paragraph' }]
}

export function editorBlocksToMarkdown(
  editor: TMarkdownEditor,
  blocks: TMarkdownBlock[] = editor.document,
): string {
  const parts: string[] = []
  let markdownBatch: TMarkdownBlock[] = []

  function flushMarkdownBatch(): void {
    if (markdownBatch.length === 0) {
      return
    }

    const markdown = editor.blocksToMarkdownLossy(markdownBatch).trim()
    if (markdown) {
      parts.push(markdown)
    }

    markdownBatch = []
  }

  for (const block of blocks) {
    if (block.type === 'math' && typeof block.props?.latex === 'string' && block.props.latex.trim()) {
      flushMarkdownBatch()
      parts.push(`$$\n${block.props.latex}\n$$`)
      continue
    }

    markdownBatch.push(block)
  }

  flushMarkdownBatch()

  return parts.join('\n\n').trim()
}

function splitMarkdownSegments(markdown: string): TMarkdownSegment[] {
  const normalizedMarkdown = markdown.replace(/\r\n?/g, '\n')
  if (!normalizedMarkdown.trim()) {
    return []
  }

  const lines = normalizedMarkdown.split('\n')
  const segments: TMarkdownSegment[] = []
  let markdownLines: string[] = []
  let mathLines: string[] | null = null

  function flushMarkdown(): void {
    const value = markdownLines.join('\n').trim()
    if (value) {
      segments.push({ type: 'markdown', value })
    }

    markdownLines = []
  }

  for (const line of lines) {
    if (line.trim() === '$$') {
      if (mathLines) {
        segments.push({ type: 'math', value: mathLines.join('\n').trim() })
        mathLines = null
      } else {
        flushMarkdown()
        mathLines = []
      }

      continue
    }

    if (mathLines) {
      mathLines.push(line)
      continue
    }

    markdownLines.push(line)
  }

  if (mathLines) {
    markdownLines.push('$$', ...mathLines)
  }

  flushMarkdown()

  return segments
}
