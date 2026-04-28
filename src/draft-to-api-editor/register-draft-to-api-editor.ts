import { DRAFT_TO_API_EDITOR_TAG_NAME } from './draft-to-api-editor.constants'
import { DraftToApiEditorElement } from './draft-to-api-editor-element'

export function registerDraftToApiEditor(): void {
  if (!customElements.get(DRAFT_TO_API_EDITOR_TAG_NAME)) {
    customElements.define(DRAFT_TO_API_EDITOR_TAG_NAME, DraftToApiEditorElement)
  }
}

registerDraftToApiEditor()
