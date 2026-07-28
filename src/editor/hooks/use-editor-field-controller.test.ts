import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEditorFieldController } from './use-editor-field-controller'
import { editorBlocksToMarkdown } from '../editor-field/editor-field-markdown'
import type { TMarkdownTextEditorHandle } from '../editor-field/editor-field.types'

const mockEditor = {
  document: [],
  focus: vi.fn(),
  replaceBlocks: vi.fn(),
  tryParseMarkdownToBlocks: vi.fn().mockReturnValue([]),
  blocksToMarkdownLossy: vi.fn().mockReturnValue(''),
}

vi.mock('../../hooks/use-app-block-note-editor/use-app-block-note-editor', () => ({
  useAppBlockNoteEditor: vi.fn(() => mockEditor),
}))

vi.mock('../editor-field/editor-field-markdown', () => ({
  markdownToEditorBlocks: vi.fn().mockReturnValue([]),
  editorBlocksToMarkdown: vi.fn().mockReturnValue(''),
}))

vi.mock('../editor-schema', () => ({
  getEditorSlashMenuItems: vi.fn().mockReturnValue([
    { title: 'Heading 1', group: 'Headings', aliases: ['h1'] },
    { title: 'Paragraph', group: 'Basic blocks', aliases: ['p'] },
  ]),
  filterEditorSlashMenuItems: vi.fn((_editor: unknown, query: string, items: unknown[]) => {
    if (!query) return items
    const q = query.toLowerCase()
    return (items as Array<{ title: string }>).filter((i) => i.title.toLowerCase().includes(q))
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(editorBlocksToMarkdown).mockReturnValue('')
})

describe('useEditorFieldController', () => {
  it('returns editor, handleBlockNoteChange, and handleSuggestionMenuItems', () => {
    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
      }),
    )

    expect(result.current.editor).toBeDefined()
    expect(typeof result.current.handleBlockNoteChange).toBe('function')
    expect(typeof result.current.handleSuggestionMenuItems).toBe('function')
  })

  it('exposes getMarkdown via ref', () => {
    const ref = { current: null } as React.RefObject<TMarkdownTextEditorHandle | null>
    renderHook(() =>
      useEditorFieldController({
        ref,
        defaultValue: 'initial',
      }),
    )

    expect(ref.current).toBeDefined()
    expect(typeof ref.current!.getMarkdown).toBe('function')
    expect(typeof ref.current!.setMarkdown).toBe('function')
    expect(typeof ref.current!.focus).toBe('function')
  })

  it('getMarkdown returns initial value from defaultValue', () => {
    vi.mocked(editorBlocksToMarkdown).mockReturnValue('hello')
    const ref = { current: null } as React.RefObject<TMarkdownTextEditorHandle | null>
    renderHook(() =>
      useEditorFieldController({
        ref,
        defaultValue: 'hello',
      }),
    )

    expect(ref.current!.getMarkdown()).toBe('hello')
  })

  it('getMarkdown returns initial value from value prop', () => {
    vi.mocked(editorBlocksToMarkdown).mockReturnValue('from prop')
    const ref = { current: null } as React.RefObject<TMarkdownTextEditorHandle | null>
    renderHook(() =>
      useEditorFieldController({
        ref,
        value: 'from prop',
      }),
    )

    expect(ref.current!.getMarkdown()).toBe('from prop')
  })

  it('calls onReady on mount', () => {
    const onReady = vi.fn()
    renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
        onReady,
      }),
    )

    expect(onReady).toHaveBeenCalledWith({
      focus: expect.any(Function),
      getMarkdown: expect.any(Function),
      setMarkdown: expect.any(Function),
    })
  })

  it('calls onChange in handleBlockNoteChange when value changed', async () => {
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
        onChange,
      }),
    )

    vi.mocked(editorBlocksToMarkdown).mockReturnValue('changed from editor')

    act(() => {
      result.current.handleBlockNoteChange()
    })

    expect(onChange).toHaveBeenCalledWith('changed from editor')
  })

  it('does not call onChange when value unchanged', () => {
    const onChange = vi.fn()
    vi.mocked(editorBlocksToMarkdown).mockReturnValue('')

    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
        onChange,
      }),
    )

    act(() => {
      result.current.handleBlockNoteChange()
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('filters slash menu items by hiddenSlashMenuItems', async () => {
    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
        hiddenSlashMenuItems: ['Heading 1'],
      }),
    )

    const items = await result.current.handleSuggestionMenuItems('')
    expect(items).toEqual([expect.objectContaining({ title: 'Paragraph' })])
  })

  it('returns all items when hiddenSlashMenuItems is empty', async () => {
    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
        hiddenSlashMenuItems: [],
      }),
    )

    const items = await result.current.handleSuggestionMenuItems('')
    expect(items).toHaveLength(2)
  })

  it('filters items by query via handleSuggestionMenuItems', async () => {
    const { result } = renderHook(() =>
      useEditorFieldController({
        ref: { current: null },
      }),
    )

    const items = await result.current.handleSuggestionMenuItems('heading')
    expect(items).toEqual([expect.objectContaining({ title: 'Heading 1' })])
  })
})
