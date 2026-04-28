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
  className?: string
  onReady?: (handle: TMarkdownTextEditorHandle) => void
}

export type TMarkdownBlock = {
  type?: string
  props?: {
    latex?: string
  }
}

export type TMarkdownEditor = {
  document: TMarkdownBlock[]
  tryParseMarkdownToBlocks(markdown: string): TMarkdownBlock[]
  blocksToMarkdownLossy(blocks?: TMarkdownBlock[]): string
}
