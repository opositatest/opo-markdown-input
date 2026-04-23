import { BlockNoteView } from '@blocknote/mantine'
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import {
  editorBlocksToMarkdown,
  markdownToEditorBlocks,
  type MarkdownEditor,
} from './editor-field-utils'
import { editorSchema, filterEditorSlashMenuItems } from './editor-schema'

export type EditorFieldHandle = {
  focus(): void
  getMarkdown(): string
  setMarkdown(value: string): void
}

type EditorFieldProps = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  className?: string
  onReady?: (handle: EditorFieldHandle) => void
}

export const EditorField = forwardRef<EditorFieldHandle, EditorFieldProps>(function EditorField(
  {
    value,
    defaultValue,
    onChange,
    disabled = false,
    readonly = false,
    placeholder,
    className,
    onReady,
  },
  ref,
) {
  const currentMarkdownRef = useRef(value ?? defaultValue ?? '')
  const applyingExternalValueRef = useRef(false)

  const editor = useCreateBlockNote(
    {
      schema: editorSchema,
      placeholders: placeholder
        ? { default: placeholder, emptyDocument: placeholder }
        : undefined,
    },
    [placeholder],
  )

  const markdownEditor = editor as unknown as MarkdownEditor

  const syncEditorMarkdown = useCallback(
    (nextMarkdown: string) => {
      applyingExternalValueRef.current = true

      editor.replaceBlocks(editor.document, markdownToEditorBlocks(markdownEditor, nextMarkdown) as never)

      currentMarkdownRef.current = editorBlocksToMarkdown(markdownEditor)
      applyingExternalValueRef.current = false
    },
    [editor, markdownEditor],
  )

  useEffect(() => {
    const nextMarkdown = value ?? currentMarkdownRef.current
    const editorMarkdown = editorBlocksToMarkdown(markdownEditor)

    if (nextMarkdown === editorMarkdown) {
      currentMarkdownRef.current = editorMarkdown
      return
    }

    syncEditorMarkdown(nextMarkdown)
  }, [editor, markdownEditor, syncEditorMarkdown, value])

  const handleRef = useRef<EditorFieldHandle>({
    focus: () => {},
    getMarkdown: () => currentMarkdownRef.current,
    setMarkdown: () => {},
  })

  handleRef.current = {
    focus: () => {
      editor.focus()
    },
    getMarkdown: () => currentMarkdownRef.current,
    setMarkdown: (nextMarkdown: string) => {
      currentMarkdownRef.current = nextMarkdown
      syncEditorMarkdown(nextMarkdown)
    },
  }

  useImperativeHandle(ref, () => handleRef.current, [])

  useEffect(() => {
    onReady?.(handleRef.current)
  }, [editor, onReady])

  return (
    <div
      className={className}
      data-disabled={disabled ? 'true' : undefined}
      data-readonly={readonly ? 'true' : undefined}
    >
      <BlockNoteView
        editor={editor}
        theme="light"
        className="draft-editor-field"
        editable={!disabled && !readonly}
        formattingToolbar={false}
        linkToolbar={false}
        slashMenu={false}
        sideMenu={false}
        filePanel={false}
        tableHandles={false}
        emojiPicker={false}
        onChange={() => {
          if (applyingExternalValueRef.current) {
            return
          }

          const nextMarkdown = editorBlocksToMarkdown(markdownEditor)
          if (nextMarkdown === currentMarkdownRef.current) {
            return
          }

          currentMarkdownRef.current = nextMarkdown
          onChange?.(nextMarkdown)
        }}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterEditorSlashMenuItems(editor as never, query)}
        />
      </BlockNoteView>
    </div>
  )
})
