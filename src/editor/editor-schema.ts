import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { type DefaultReactSuggestionItem } from '@blocknote/react'
import { mathBlockSpec } from './math-block/math-block-spec'
import { imageBlockSpec } from './image-block/image-block-spec'

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: mathBlockSpec(),
    image: imageBlockSpec(),
  },
})

/**
 * Slash menu item with a stable, English `id` used for programmatic filtering
 * (see `hiddenSlashMenuItems`), decoupled from the localized, user-facing `title`.
 */
export type SlashMenuItem = DefaultReactSuggestionItem & { id: string }

/**
 * Slash menu item ids hidden from the menu unless explicitly re-enabled via
 * the `enabledMediaBlocks` prop. These wrap advanced upstream BlockNote media
 * flows that are not part of the documented, supported surface of this
 * package (see README's "Scope note").
 */
export const DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS = ['video', 'audio', 'file'] as const

export type DefaultHiddenSlashMenuItemId = (typeof DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS)[number]

function createSlashMenuItems(editor: typeof editorSchema.BlockNoteEditor): SlashMenuItem[] {
  return [
    // Headings
    {
      id: 'heading-1',
      title: 'Encabezado 1',
      subtext: 'Encabezado de primer nivel',
      group: 'Encabezados',
      aliases: ['h1', 'heading1', 'title', 'encabezado1', 'titulo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 1 } })
      },
    },
    {
      id: 'heading-2',
      title: 'Encabezado 2',
      subtext: 'Encabezado de sección principal',
      group: 'Encabezados',
      aliases: ['h2', 'heading2', 'subtitle', 'encabezado2', 'subtitulo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 2 } })
      },
    },
    {
      id: 'heading-3',
      title: 'Encabezado 3',
      subtext: 'Encabezado de subsección y grupo',
      group: 'Encabezados',
      aliases: ['h3', 'heading3', 'encabezado3'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'heading', props: { level: 3 } })
      },
    },
    // Basic blocks
    {
      id: 'paragraph',
      title: 'Párrafo',
      subtext: 'Texto sin formato',
      group: 'Bloques básicos',
      aliases: ['p', 'paragraph', 'text', 'parrafo', 'texto'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' })
      },
    },
    {
      id: 'bullet-list',
      title: 'Lista con viñetas',
      subtext: 'Crea una lista simple con viñetas',
      group: 'Bloques básicos',
      aliases: ['ul', 'list', 'bulletlist', 'lista', 'vinetas'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bulletListItem' })
      },
    },
    {
      id: 'numbered-list',
      title: 'Lista numerada',
      subtext: 'Crea una lista con numeración',
      group: 'Bloques básicos',
      aliases: ['ol', 'numberedlist', 'listanumerada'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'numberedListItem' })
      },
    },
    {
      id: 'checklist',
      title: 'Lista de tareas',
      subtext: 'Controla tareas con una lista de verificación',
      group: 'Bloques básicos',
      aliases: ['todo', 'checklist', 'tasklist', 'tareas', 'verificacion'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'checkListItem' })
      },
    },
    {
      id: 'blockquote',
      title: 'Cita',
      subtext: 'Resalta una cita',
      group: 'Bloques básicos',
      aliases: ['quote', 'blockquote', 'cita'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'quote' })
      },
    },
    {
      id: 'code-block',
      title: 'Bloque de código',
      subtext: 'Resalta un fragmento de código',
      group: 'Bloques básicos',
      aliases: ['code', 'codeblock', 'pre', 'codigo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'codeBlock' })
      },
    },
    {
      id: 'divider',
      title: 'Separador',
      subtext: 'Divide bloques visualmente',
      group: 'Bloques básicos',
      aliases: ['hr', 'divider', 'line', 'horizontalrule', 'separador', 'linea'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'divider' })
      },
    },
    // Media
    {
      id: 'image',
      title: 'Imagen',
      subtext: 'Imagen a pantalla completa',
      group: 'Multimedia',
      aliases: ['image', 'img', 'picture', 'photo', 'imagen', 'foto'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'image' })
      },
    },
    {
      id: 'video',
      title: 'Vídeo',
      subtext: 'Vídeo redimensionable con leyenda',
      group: 'Multimedia',
      aliases: ['video', 'movie', 'youtube', 'vimeo', 'pelicula'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'video' })
      },
    },
    {
      id: 'audio',
      title: 'Audio',
      subtext: 'Incrusta un audio',
      group: 'Multimedia',
      aliases: ['audio', 'sound', 'music', 'sonido', 'musica'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'audio' })
      },
    },
    {
      id: 'file',
      title: 'Archivo',
      subtext: 'Incrusta un archivo',
      group: 'Multimedia',
      aliases: ['file', 'attachment', 'document', 'archivo', 'documento'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'file' })
      },
    },
    {
      id: 'table',
      title: 'Tabla',
      subtext: 'Crea una tabla',
      group: 'Multimedia',
      aliases: ['table', 'spreadsheet', 'tabla', 'hoja de calculo'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'table',
          content: {
            type: 'tableContent',
            headerRows: 1,
            rows: [{ cells: ['', '', ''] }, { cells: ['', '', ''] }],
          } as never,
        })
      },
    },
    // Math
    {
      id: 'math-formula',
      title: 'Fórmula matemática',
      subtext: 'Inserta una fórmula LaTeX renderizada con KaTeX',
      group: 'Multimedia',
      aliases: ['math', 'latex', 'katex', 'formula', 'equation', 'formula matematica', 'ecuacion'],
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'math' } as never)
      },
    },
  ]
}

export function getEditorSlashMenuItems(editor: typeof editorSchema.BlockNoteEditor): SlashMenuItem[] {
  return createSlashMenuItems(editor)
}

export function filterEditorSlashMenuItems(
  _editor: typeof editorSchema.BlockNoteEditor,
  query: string,
  items: SlashMenuItem[],
): SlashMenuItem[] {
  return filterSuggestionItems(items, query)
}
