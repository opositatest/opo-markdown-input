import { useBlockNoteEditor, useComponentsContext, useEditorState } from '@blocknote/react'
import type { ReactElement } from 'react'
import { RiFormatClear } from 'react-icons/ri'

import { editorSchema } from '../../editor/editor-schema'

const DEFAULT_PARAGRAPH_PROPS = {
  backgroundColor: 'default',
  textAlignment: 'left',
  textColor: 'default',
} as const

export function AppClearFormattingButton(): ReactElement | null {
  const editor = useBlockNoteEditor(editorSchema)
  const Components = useComponentsContext()!
  const hasTextSelection = useEditorState({
    editor,
    selector: ({ editor }) => editor.isEditable && editor.getSelectedText().length > 0,
  })

  function handleClearFormatting(): void {
    const selection = editor.getSelection()
    if (!selection) {
      return
    }

    editor.focus()
    editor.transact((transaction) => {
      const { from, to } = transaction.selection

      for (const styleName of Object.keys(editor.schema.styleSchema)) {
        const mark = editor.pmSchema.marks[styleName]
        if (mark) {
          transaction.removeMark(from, to, mark)
        }
      }

      const linkMark = editor.pmSchema.marks.link
      if (linkMark) {
        transaction.removeMark(from, to, linkMark)
      }

      for (const block of selection.blocks) {
        if (Array.isArray(block.content)) {
          editor.updateBlock(block, {
            type: 'paragraph',
            props: DEFAULT_PARAGRAPH_PROPS,
          })
        }
      }
    })
  }

  if (!hasTextSelection) {
    return null
  }

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      data-test="clearFormatting"
      label="Quitar formato"
      mainTooltip="Quitar formato"
      secondaryTooltip="Pegar sin formato: Ctrl/⌘ + Shift + V"
      icon={<RiFormatClear />}
      onClick={handleClearFormatting}
    />
  )
}
