import type { TMarkdownBlock, TMarkdownEditor } from './editor-field.types'

type TMarkdownSegment =
  | { type: 'markdown'; value: string }
  | { type: 'math'; value: string }
  | { type: 'image'; value: string }

// Markdown (CommonMark) has no syntax for image width, so BlockNote's own
// Markdown export/import roundtrip silently drops `previewWidth` set by the
// resize handles. To keep a resized image's width across save/reload, image
// blocks with a `previewWidth` are serialized as a standalone raw `<img>` tag
// (valid inline HTML in Markdown) instead of going through
// `blocksToMarkdownLossy`/`tryParseMarkdownToBlocks`, mirroring how `math`
// blocks bypass them for LaTeX fidelity below.
const RESIZED_IMAGE_LINE_REGEX = /^<img\s+[^>]*\bwidth="\d+(?:\.\d+)?"[^>]*\/?>$/i
const IMAGE_ATTR_REGEX = /(\w+)="([^"]*)"/g

export function markdownToEditorBlocks(
  editor: TMarkdownEditor,
  markdown: string,
): TMarkdownBlock[] {
  const segments = splitMarkdownSegments(markdown)
  const blocks = segments.flatMap((segment) => {
    if (segment.type === 'math') {
      return [{ type: 'math', props: { latex: segment.value } }]
    }

    if (segment.type === 'image') {
      const block = parseResizedImageLine(segment.value)
      return block ? [block] : []
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
      parts.push(`$$\n${block.props.latex.trim()}\n$$`)
      continue
    }

    if (isResizedImageBlock(block)) {
      flushMarkdownBatch()
      parts.push(serializeResizedImageBlock(block))
      continue
    }

    markdownBatch.push(block)
  }

  flushMarkdownBatch()

  return parts.join('\n\n').trim()
}

function isResizedImageBlock(block: TMarkdownBlock): boolean {
  const previewWidth = block.props?.previewWidth
  return (
    block.type === 'image' &&
    typeof previewWidth === 'number' &&
    Number.isFinite(previewWidth) &&
    previewWidth > 0 &&
    block.props?.showPreview !== false
  )
}

function serializeResizedImageBlock(block: TMarkdownBlock): string {
  const { url = '', name = '', previewWidth } = block.props ?? {}
  const attrs = [`src="${escapeImageAttr(url)}"`]
  if (name) {
    attrs.push(`alt="${escapeImageAttr(name)}"`)
  }
  attrs.push(`width="${previewWidth}"`)

  return `<img ${attrs.join(' ')}>`
}

function parseResizedImageLine(line: string): TMarkdownBlock | null {
  const attrs: Record<string, string> = {}
  for (const match of line.matchAll(IMAGE_ATTR_REGEX)) {
    attrs[match[1]] = unescapeImageAttr(match[2])
  }

  const url = attrs.src
  const previewWidth = Number(attrs.width)
  if (!url || !Number.isFinite(previewWidth) || previewWidth <= 0) {
    return null
  }

  return {
    type: 'image',
    props: {
      url,
      name: attrs.alt ?? '',
      previewWidth,
      showPreview: true,
    },
  }
}

function escapeImageAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function unescapeImageAttr(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
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
    const trimmedLine = line.trim()

    if (trimmedLine === '$$') {
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

    if (RESIZED_IMAGE_LINE_REGEX.test(trimmedLine)) {
      flushMarkdown()
      segments.push({ type: 'image', value: trimmedLine })
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
