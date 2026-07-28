import { describe, it, expect, vi } from 'vitest'
import { getEditorSlashMenuItems, filterEditorSlashMenuItems } from './editor-schema'

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

describe('getEditorSlashMenuItems', () => {
  it('returns an array of items', () => {
    const items = getEditorSlashMenuItems({} as never)
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
  })

  it('each item has required fields', () => {
    const items = getEditorSlashMenuItems({} as never)
    for (const item of items) {
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('subtext')
      expect(item).toHaveProperty('group')
      expect(item).toHaveProperty('aliases')
      expect(item).toHaveProperty('onItemClick')
      expect(typeof item.title).toBe('string')
      expect(typeof item.subtext).toBe('string')
      expect(typeof item.group).toBe('string')
      expect(Array.isArray(item.aliases)).toBe(true)
      expect(typeof item.onItemClick).toBe('function')
    }
  })

  it('contains expected heading items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Heading 1')
    expect(titles).toContain('Heading 2')
    expect(titles).toContain('Heading 3')
  })

  it('contains expected basic block items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Paragraph')
    expect(titles).toContain('Bullet List')
    expect(titles).toContain('Numbered List')
    expect(titles).toContain('Checklist')
    expect(titles).toContain('Blockquote')
    expect(titles).toContain('Code Block')
    expect(titles).toContain('Divider')
  })

  it('contains expected media items', () => {
    const items = getEditorSlashMenuItems({} as never)
    const titles = items.map((i) => i.title)
    expect(titles).toContain('Image')
    expect(titles).toContain('Video')
    expect(titles).toContain('Audio')
    expect(titles).toContain('File')
    expect(titles).toContain('Table')
    expect(titles).toContain('Math Formula')
  })

  it('groups items correctly', () => {
    const items = getEditorSlashMenuItems({} as never)
    const groups = [...new Set(items.map((i) => i.group))]
    expect(groups).toContain('Headings')
    expect(groups).toContain('Basic blocks')
    expect(groups).toContain('Media')
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
    const filtered = filterEditorSlashMenuItems({} as never, 'heading', items)
    expect(filtered.length).toBeGreaterThan(0)
    for (const item of filtered) {
      expect(item.title.toLowerCase()).toContain('heading')
    }
  })

  it('filters items by alias', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'h1', items)
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('Heading 1')
  })

  it('is case-insensitive', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'HEADING', items)
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('returns empty array when no match', () => {
    const items = getEditorSlashMenuItems({} as never)
    const filtered = filterEditorSlashMenuItems({} as never, 'zzzznotfound', items)
    expect(filtered).toEqual([])
  })
})
