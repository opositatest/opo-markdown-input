export type TEditorFieldHandle = {
  focus(): void
  getMarkdown(): string
  setMarkdown(value: string): void
}

export type TEditorFieldProps = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  className?: string
  onReady?: (handle: TEditorFieldHandle) => void
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
