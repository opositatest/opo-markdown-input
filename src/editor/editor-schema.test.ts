import { describe, it, expect, vi } from 'vitest'
import {
  DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS,
  getEditorSlashMenuItems,
  filterEditorSlashMenuItems,
} from './editor-schema'

vi.mock('@blocknote/core', () => ({
  BlockNoteSchema: {
    create: vi.fn().mockReturnValue({
      BlockNoteEditor: {},
    }),
  },
  defaultBlockSpecs: {},
}))

vi.mock('@blocknote/core/extensions', () => ({
  filterSuggestionItems: vi.fn((_items: unknown[], query: string) => {
    const items = _items as Array<{ title: string; aliases: string[] }>
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.toLowerCase().includes(q)),
    )
  }),
  insertOrUpdateBlockForSlashMenu: vi.fn(),
}))

vi.mock('@blocknote/react', () => ({
  DefaultReactSuggestionItem: {},
}))

vi.mock('./math-block/math-block-spec', () => ({
  mathBlockSpec: vi.fn().mockReturnValue({}),
}))

vi.mock('./image-block/image-block-spec', () => ({
  imageBlockSpec: vi.fn().mockReturnValue({}),
}))

describe('getEditorSlashMenuItems', () => {
  it('returns an array of items', () => {
    const items = getEditorSlashMenuItems({} as never)
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
  })

  it('each item has required fields', () => {
    const items = getEditorSlashMenuItems({} as never)
    for (const item of items) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('subtext')
      expect(item).toHaveProperty('group')
      expect(item).toHaveProperty('aliases')
      expect(item).toHaveProperty('onItemClick')
      expect(typeof item.id).toBe('string')
      expect(typeof item.title).toBe('string')
      expect(typeof item.subtext).toBe('string')
      expect(typeof item.group).toBe('string')
      expect(Array.isArray(item.aliases)).toBe(true)
      expect(typeof item.onItemClick).toBe('function')
    }
  })

  it('has unique, stable English ids independent of the localized title', () => {
    const items = getEditorSlashMenuItems({} as never)
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('heading-1')
    expect(ids).toContain('table')
    expect(ids).toContain('math-formula')
  })

  it('contains expected heading items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Encabezado 1')
    expect(titles).toContain('Encabezado 2')
    expect(titles).toContain('Encabezado 3')
  })

  it('contains expected basic block items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Párrafo')
    expect(titles).toContain('Lista con viñetas')
    expect(titles).toContain('Lista numerada')
    expect(titles).toContain('Lista de tareas')
    expect(titles).toContain('Cita')
    expect(titles).toContain('Bloque de código')
    expect(titles).toContain('Separador')
  })

  it('contains expected media items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Imagen')
    expect(titles).toContain('Vídeo')
    expect(titles).toContain('Audio')
    expect(titles).toContain('Archivo')
    expect(titles).toContain('Tabla')
    expect(titles).toContain('Fórmula matemática')
  })

  it('groups items correctly', () => {
    const items = getEditorSlashMenuItems({} as never)
    const groups = [...new Set(items.map((i) => i.group))]
    expect(groups).toContain('Encabezados')
    expect(groups).toContain('Bloques básicos')
    expect(groups).toContain('Multimedia')
  })
})

describe('DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS', () => {
  it('lists video, audio, and file as hidden-by-default item ids', () => {
    expect(DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS).toEqual(['video', 'audio', 'file'])
  })

  it('only references ids that exist among the slash menu items', () => {
    const ids = getEditorSlashMenuItems({} as never).map((item) => item.id)
    for (const hiddenId of DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS) {
      expect(ids).toContain(hiddenId)
    }
  })
})

describe('table slash menu item', () => {
  it('inserts a table with non-empty row/cell content so ProseMirror accepts it', async () => {
    const { insertOrUpdateBlockForSlashMenu } = await import('@blocknote/core/extensions')

    const items = getEditorSlashMenuItems({} as never)
    const tableItem = items.find((i) => i.id === 'table')
    expect(tableItem).toBeDefined()

    tableItem!.onItemClick!()

    expect(insertOrUpdateBlockForSlashMenu).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        type: 'table',
        content: expect.objectContaining({
          type: 'tableContent',
          headerRows: 1,
          rows: expect.arrayContaining([expect.objectContaining({ cells: expect.any(Array) })]),
        }),
      }),
    )
  })
})

describe('filterEditorSlashMenuItems', () => {
  it('returns all items when query is empty', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, '', items)
    expect(filtered).toEqual(items)
  })

  it('filters items by title', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'encabezado', items)
    expect(filtered.length).toBeGreaterThan(0)
    for (const item of filtered) {
      expect(item.title.toLowerCase()).toContain('encabezado')
    }
  })

  it('filters items by alias', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'h1', items)
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('Encabezado 1')
  })

  it('is case-insensitive', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'ENCABEZADO', items)
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('returns empty array when no match', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'zzzznotfound', items)
    expect(filtered).toEqual([])
  })
})
