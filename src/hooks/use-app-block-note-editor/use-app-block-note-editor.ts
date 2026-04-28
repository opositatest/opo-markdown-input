import { useCreateBlockNote } from '@blocknote/react'

import { editorSchema } from '../../editor/editor-schema'

type TUseAppBlockNoteEditorOptions = {
  placeholder?: string
}

export function useAppBlockNoteEditor(
  options: TUseAppBlockNoteEditorOptions,
): ReturnType<typeof useCreateBlockNote> {
  const { placeholder } = options

  return useCreateBlockNote(
    {
      schema: editorSchema,
      placeholders: placeholder
        ? { default: placeholder, emptyDocument: placeholder }
        : undefined,
    },
    [placeholder],
  )
}
