import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { type DefaultReactSuggestionItem } from '@blocknote/react'
import { mathBlockSpec } from './math-block/math-block-spec'

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: mathBlockSpec(),
  },
})

function createSlashMenuItems(editor: typeof editorSchema.BlockNoteEditor): DefaultReactSuggestionItem[] {
  return [
    // Headings
    {
      title: 'Heading 1',
      subtext: 'Top-level heading',
      group: 'Headings',
      aliases: ['h1', 'heading1', 'title'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 1 } })
      },
    },
    {
      title: 'Heading 2',
      subtext: 'Key section heading',
      group: 'Headings',
      aliases: ['h2', 'heading2', 'subtitle'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 2 } })
      },
    },
    {
      title: 'Heading 3',
      subtext: 'Subsection and group heading',
      group: 'Headings',
      aliases: ['h3', 'heading3'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 3 } })
      },
    },
    // Basic blocks
    {
      title: 'Paragraph',
      subtext: 'Plain text',
      group: 'Basic blocks',
      aliases: ['p', 'paragraph', 'text'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' })
      },
    },
    {
      title: 'Bullet List',
      subtext: 'Create a simple bullet list',
      group: 'Basic blocks',
      aliases: ['ul', 'list', 'bulletlist'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bulletListItem' })
      },
    },
    {
      title: 'Numbered List',
      subtext: 'Create a list with numbering',
      group: 'Basic blocks',
      aliases: ['ol', 'numberedlist'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'numberedListItem' })
      },
    },
    {
      title: 'Checklist',
      subtext: 'Track tasks with a checklist',
      group: 'Basic blocks',
      aliases: ['todo', 'checklist', 'tasklist'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'checkListItem' })
      },
    },
    {
      title: 'Blockquote',
      subtext: 'Capture a quote',
      group: 'Basic blocks',
      aliases: ['quote', 'blockquote'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' })
        // BlockNote doesn't have a native blockquote block, use paragraph with styling
      },
    },
    {
      title: 'Code Block',
      subtext: 'Capture a code snippet',
      group: 'Basic blocks',
      aliases: ['code', 'codeblock', 'pre'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'codeBlock' })
      },
    },
    {
      title: 'Divider',
      subtext: 'Visually divide blocks',
      group: 'Basic blocks',
      aliases: ['hr', 'divider', 'line', 'horizontalrule'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'horizontalRule' })
      },
    },
    // Media
    {
      title: 'Image',
      subtext: 'Fullscreen image',
      group: 'Media',
      aliases: ['image', 'img', 'picture', 'photo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'image' })
      },
    },
    {
      title: 'Video',
      subtext: 'Resizable video with caption',
      group: 'Media',
      aliases: ['video', 'movie', 'youtube', 'vimeo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'video' })
      },
    },
    {
      title: 'Audio',
      subtext: 'Embed audio',
      group: 'Media',
      aliases: ['audio', 'sound', 'music'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'audio' })
      },
    },
    {
      title: 'File',
      subtext: 'Embed a file',
      group: 'Media',
      aliases: ['file', 'attachment', 'document'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'file' })
      },
    },
    {
      title: 'Table',
      subtext: 'Create a table',
      group: 'Media',
      aliases: ['table', 'spreadsheet'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'table' })
      },
    },
    // Math
    {
      title: 'Formula matematica',
      subtext: 'Inserta una formula LaTeX renderizada con KaTeX',
      group: 'Media',
      aliases: ['math', 'latex', 'katex', 'formula', 'ecuacion'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'math' } as never)
      },
    },
  ]
}

export function getEditorSlashMenuItems(
  editor: typeof editorSchema.BlockNoteEditor,
): DefaultReactSuggestionItem[] {
  return createSlashMenuItems(editor)
}

export function filterEditorSlashMenuItems(
  editor: typeof editorSchema.BlockNoteEditor,
  query: string,
  items: DefaultReactSuggestionItem[],
): DefaultReactSuggestionItem[] {
  return filterSuggestionItems(items, query)
}
