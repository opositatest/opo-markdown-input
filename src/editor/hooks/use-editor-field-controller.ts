import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, type ForwardedRef } from 'react'

import { useAppBlockNoteEditor } from '../../hooks/use-app-block-note-editor/use-app-block-note-editor'
import { editorBlocksToMarkdown, markdownToEditorBlocks } from '../editor-field/editor-field-markdown'
import type {
  TMarkdownTextEditorHandle,
  TMarkdownTextEditorProps,
  TMarkdownEditor,
} from '../editor-field/editor-field.types'
import { filterEditorSlashMenuItems, getEditorSlashMenuItems } from '../editor-schema'

type TUseEditorFieldControllerArgs = Pick<
  TMarkdownTextEditorProps,
  'defaultValue' | 'onChange' | 'onReady' | 'placeholder' | 'value'
> & {
  ref: ForwardedRef<TMarkdownTextEditorHandle>
}

type TUseEditorFieldControllerResult = {
  editor: ReturnType<typeof useAppBlockNoteEditor>
  handleBlockNoteChange(): void
  handleSuggestionMenuItems(query: string): Promise<ReturnType<typeof filterEditorSlashMenuItems>>
}

export function useEditorFieldController(
  args: TUseEditorFieldControllerArgs,
): TUseEditorFieldControllerResult {
  const { defaultValue, onChange, onReady, placeholder, ref, value } = args
  const currentMarkdownRef = useRef(value ?? defaultValue ?? '')
  const applyingExternalValueRef = useRef(false)
  const editor = useAppBlockNoteEditor({ placeholder })
  const markdownEditor = editor as unknown as TMarkdownEditor

  const syncEditorMarkdown = useCallback(
    (nextMarkdown: string): void => {
      applyingExternalValueRef.current = true
      editor.replaceBlocks(editor.document, markdownToEditorBlocks(markdownEditor, nextMarkdown) as never)
      currentMarkdownRef.current = editorBlocksToMarkdown(markdownEditor)
      applyingExternalValueRef.current = false
    },
    [editor, markdownEditor],
  )

  const focusEditor = useCallback((): void => {
    editor.focus()
  }, [editor])

  const getMarkdown = useCallback((): string => {
    return currentMarkdownRef.current
  }, [])

  const setMarkdown = useCallback(
    (nextMarkdown: string): void => {
      currentMarkdownRef.current = nextMarkdown
      syncEditorMarkdown(nextMarkdown)
    },
    [syncEditorMarkdown],
  )

  useImperativeHandle(
    ref,
    (): TMarkdownTextEditorHandle => ({
      focus: focusEditor,
      getMarkdown,
      setMarkdown,
    }),
    [focusEditor, getMarkdown, setMarkdown],
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

  useEffect(() => {
    if (!onReady) {
      return
    }

    onReady({
      focus: focusEditor,
      getMarkdown,
      setMarkdown,
    })
  }, [editor, focusEditor, getMarkdown, onReady, setMarkdown])

  const handleBlockNoteChange = useCallback((): void => {
    if (applyingExternalValueRef.current) {
      return
    }

    const nextMarkdown = editorBlocksToMarkdown(markdownEditor)
    if (nextMarkdown === currentMarkdownRef.current) {
      return
    }

    currentMarkdownRef.current = nextMarkdown
    onChange?.(nextMarkdown)
  }, [markdownEditor, onChange])

  const slashMenuItems = useMemo(
    () => getEditorSlashMenuItems(editor as never),
    [editor],
  )

  const handleSuggestionMenuItems = useCallback(
    async (query: string): Promise<ReturnType<typeof filterEditorSlashMenuItems>> => {
      return filterEditorSlashMenuItems(editor as never, query, slashMenuItems)
    },
    [editor, slashMenuItems],
  )

  return {
    editor,
    handleBlockNoteChange,
    handleSuggestionMenuItems,
  }
}
