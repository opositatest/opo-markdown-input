import { forwardRef, type ReactElement } from 'react'

import { AppBlockNoteSuggestionMenu } from '../../components/app-block-note-suggestion-menu/app-block-note-suggestion-menu'
import { AppBlockNoteView } from '../../components/app-block-note-view/app-block-note-view'
import { useEditorFieldController } from '../hooks/use-editor-field-controller'
import type { TMarkdownTextEditorHandle, TMarkdownTextEditorProps } from './editor-field.types'

export const MarkdownTextEditor = forwardRef<TMarkdownTextEditorHandle, TMarkdownTextEditorProps>(function MarkdownTextEditor(
  {
    className,
    defaultValue,
    disabled = false,
    onChange,
    onReady,
    placeholder,
    readonly = false,
    value,
  },
  ref,
): ReactElement {
  const { editor, handleBlockNoteChange, handleSuggestionMenuItems } = useEditorFieldController({
    defaultValue,
    onChange,
    onReady,
    placeholder,
    ref,
    value,
  })

  return (
    <div
      className={className}
      data-disabled={disabled ? 'true' : undefined}
      data-readonly={readonly ? 'true' : undefined}
    >
      <AppBlockNoteView
        editor={editor}
        className="markdown-editor-field"
        editable={!disabled && !readonly}
        onChange={handleBlockNoteChange}
      >
        <AppBlockNoteSuggestionMenu
          triggerCharacter="/"
          getItems={handleSuggestionMenuItems}
        />
      </AppBlockNoteView>
    </div>
  )
})
