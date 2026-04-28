import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { getDefaultReactSlashMenuItems, type DefaultReactSuggestionItem } from '@blocknote/react'
import { mathBlockSpec } from './math-block/math-block-spec'

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: mathBlockSpec(),
  },
})

function getMathSlashMenuItem(editor: typeof editorSchema.BlockNoteEditor): DefaultReactSuggestionItem {
  return {
    title: 'Formula matematica',
    onItemClick: () => {
      insertOrUpdateBlockForSlashMenu(editor, { type: 'math' } as never)
    },
    aliases: ['math', 'latex', 'katex', 'formula', 'ecuacion'],
    group: 'Media',
    subtext: 'Inserta una formula LaTeX renderizada con KaTeX',
  }
}

export function filterEditorSlashMenuItems(
  editor: typeof editorSchema.BlockNoteEditor,
  query: string,
): DefaultReactSuggestionItem[] {
  return filterSuggestionItems(
    [...getDefaultReactSlashMenuItems(editor), getMathSlashMenuItem(editor)],
    query,
  )
}
