import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppClearFormattingButton } from './app-clear-formatting-button'

type TToolbarButtonProps = {
  icon?: ReactNode
  label: string
  mainTooltip?: string
  onClick?: () => void
  secondaryTooltip?: string
}

const mocks = vi.hoisted(() => ({
  editor: {
    focus: vi.fn(),
    getSelectedText: vi.fn(),
    getSelection: vi.fn(),
    isEditable: true,
    pmSchema: { marks: {} as Record<string, object> },
    schema: { styleSchema: {} as Record<string, object> },
    transact: vi.fn(),
    updateBlock: vi.fn(),
  },
  transaction: {
    removeMark: vi.fn(),
    selection: { from: 2, to: 12 },
  },
}))

vi.mock('@blocknote/react', () => ({
  useBlockNoteEditor: () => mocks.editor,
  useComponentsContext: () => ({
    FormattingToolbar: {
      Button: ({ icon, label, mainTooltip, onClick, secondaryTooltip }: TToolbarButtonProps) => (
        <button
          type="button"
          aria-label={label}
          data-main-tooltip={mainTooltip}
          data-secondary-tooltip={secondaryTooltip}
          onClick={onClick}
        >
          {icon}
        </button>
      ),
    },
  }),
  useEditorState: ({
    selector,
  }: {
    selector: (context: { editor: typeof mocks.editor }) => boolean
  }) => selector({ editor: mocks.editor }),
}))

vi.mock('../../editor/editor-schema', () => ({
  editorSchema: {},
}))

describe('AppClearFormattingButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.editor.isEditable = true
    mocks.editor.getSelectedText.mockReturnValue('Selected text')
    mocks.editor.schema.styleSchema = {
      bold: {},
      italic: {},
      textColor: {},
    }
    mocks.editor.pmSchema.marks = {
      bold: { name: 'bold' },
      italic: { name: 'italic' },
      link: { name: 'link' },
      textColor: { name: 'textColor' },
    }
    mocks.editor.getSelection.mockReturnValue({
      blocks: [
        { id: 'heading', type: 'heading', content: [{ type: 'text', text: 'Title' }] },
        { id: 'image', type: 'image', content: undefined },
      ],
    })
    mocks.editor.transact.mockImplementation((callback: (transaction: typeof mocks.transaction) => void) => {
      callback(mocks.transaction)
    })
  })

  it('clears styles and links, and converts text blocks to paragraphs', () => {
    render(<AppClearFormattingButton />)

    fireEvent.click(screen.getByRole('button', { name: 'Quitar formato' }))

    expect(mocks.editor.focus).toHaveBeenCalledOnce()
    expect(mocks.editor.transact).toHaveBeenCalledOnce()
    expect(mocks.transaction.removeMark).toHaveBeenCalledTimes(4)
    expect(mocks.transaction.removeMark).toHaveBeenCalledWith(2, 12, { name: 'link' })
    expect(mocks.editor.updateBlock).toHaveBeenCalledOnce()
    expect(mocks.editor.updateBlock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'heading' }),
      {
        type: 'paragraph',
        props: {
          backgroundColor: 'default',
          textAlignment: 'left',
          textColor: 'default',
        },
      },
    )
  })

  it('teaches the plain-paste shortcut in the tooltip', () => {
    render(<AppClearFormattingButton />)

    expect(screen.getByRole('button', { name: 'Quitar formato' })).toHaveAttribute(
      'data-secondary-tooltip',
      'Pegar sin formato: Ctrl/⌘ + Shift + V',
    )
  })

  it('does not render without a text selection', () => {
    mocks.editor.getSelectedText.mockReturnValue('')

    render(<AppClearFormattingButton />)

    expect(screen.queryByRole('button', { name: 'Quitar formato' })).toBeNull()
  })

  it('does not render when the editor is read-only', () => {
    mocks.editor.isEditable = false

    render(<AppClearFormattingButton />)

    expect(screen.queryByRole('button', { name: 'Quitar formato' })).toBeNull()
  })
})
