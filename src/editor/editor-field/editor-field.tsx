import { forwardRef, type CSSProperties, type ReactElement } from 'react'

import { AppBlockNoteSuggestionMenu } from '../../components/app-block-note-suggestion-menu/app-block-note-suggestion-menu'
import { AppBlockNoteView } from '../../components/app-block-note-view/app-block-note-view'
import { useEditorFieldController } from '../hooks/use-editor-field-controller'
import type { TMarkdownTextEditorHandle, TMarkdownTextEditorProps } from './editor-field.types'

type TMarkdownTextEditorStyle = CSSProperties & {
  '--markdown-text-editor-height'?: string
}

function getEditorStyle(width?: string, height?: string): TMarkdownTextEditorStyle | undefined {
  const style: TMarkdownTextEditorStyle = {}

  if (width) {
    style.width = width
  }

  if (height) {
    style.height = height
    style['--markdown-text-editor-height'] = height
  }

  if (!width && !height) {
    return undefined
  }

  return style
}

export const MarkdownTextEditor = forwardRef<TMarkdownTextEditorHandle, TMarkdownTextEditorProps>(function MarkdownTextEditor(
  {
    className,
    defaultValue,
    disabled = false,
    height,
    onChange,
    onReady,
    placeholder,
    readonly = false,
    value,
    width,
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
  const style = getEditorStyle(width, height)

  return (
    <div
      className={className}
      data-disabled={disabled ? 'true' : undefined}
      data-has-custom-height={height ? 'true' : undefined}
      data-readonly={readonly ? 'true' : undefined}
      style={style}
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
