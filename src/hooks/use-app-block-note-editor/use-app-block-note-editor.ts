import { useCreateBlockNote } from '@blocknote/react'

import { editorSchema } from '../../editor/editor-schema'

type TUseAppBlockNoteEditorOptions = {
  placeholder?: string
}

async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export function useAppBlockNoteEditor(
  options: TUseAppBlockNoteEditorOptions,
): ReturnType<typeof useCreateBlockNote> {
  const { placeholder } = options

  return useCreateBlockNote(
    {
      schema: editorSchema,
      uploadFile,
      placeholders: placeholder
        ? { default: placeholder, emptyDocument: placeholder }
        : undefined,
    },
    [placeholder],
  )
}
