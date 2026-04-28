import { MARKDOWN_TEXT_EDITOR_TAG_NAME } from './markdown-text-editor.constants'
import { MarkdownTextEditorElement } from './markdown-text-editor-element'

export function registerMarkdownTextEditor(): void {
  if (!customElements.get(MARKDOWN_TEXT_EDITOR_TAG_NAME)) {
    customElements.define(MARKDOWN_TEXT_EDITOR_TAG_NAME, MarkdownTextEditorElement)
  }
}

registerMarkdownTextEditor()
