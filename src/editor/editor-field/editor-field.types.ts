export type TMarkdownTextEditorHandle = {
  focus(): void
  getMarkdown(): string
  setMarkdown(value: string): void
}

export type TMarkdownTextEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  width?: string
  height?: string
  className?: string
  hiddenSlashMenuItems?: string[]
  enabledMediaBlocks?: string[]
  formattingToolbar?: boolean
  onReady?: (handle: TMarkdownTextEditorHandle) => void
}

/**
 * Minimal shape of the inline content the Markdown serializer has to look at
 * (see `escapeBlockMarkers`). Extra fields are allowed on purpose: the editor
 * owns the real inline content shape, this module only reads `type` and `text`.
 */
export type TMarkdownInlineNode = {
  type?: string
  text?: string
  [key: string]: unknown
}

export type TMarkdownBlock = {
  type?: string
  props?: {
    latex?: string
    url?: string
    name?: string
  }
  content?: TMarkdownInlineNode[]
}

export type TMarkdownEditor = {
  document: TMarkdownBlock[]
  tryParseMarkdownToBlocks(markdown: string): TMarkdownBlock[]
  blocksToMarkdownLossy(blocks?: TMarkdownBlock[]): string
}
