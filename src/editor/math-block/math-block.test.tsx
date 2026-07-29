import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MathBlock } from './math-block'

vi.mock('katex', () => ({
  default: {
    render: vi.fn(),
  },
}))

vi.mock('katex/dist/katex.min.css', () => ({}))

import katex from 'katex'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MathBlock', () => {
  describe('editing mode', () => {
    it('starts in editing mode when latex is empty', () => {
      render(<MathBlock latex="" isEditable={true} updateLatex={vi.fn()} />)
      expect(screen.getByPlaceholderText('Escribe la formula en LaTeX')).toBeDefined()
    })

    it('enters editing mode on preview click when editable', () => {
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={vi.fn()} />,
      )
      const preview = container.querySelector('.math-block-preview')!
      fireEvent.click(preview)
      expect(screen.getByRole('textbox')).toBeDefined()
    })

    it('renders textarea with latex value after entering edit mode', () => {
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={vi.fn()} />,
      )
      fireEvent.click(container.querySelector('.math-block-preview')!)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('x^2')
    })

    it('shows done button in editing mode', () => {
      render(<MathBlock latex="" isEditable={true} updateLatex={vi.fn()} />)
      expect(screen.getByText('Listo')).toBeDefined()
    })

    it('calls updateLatex and exits editing on done button click', () => {
      const updateLatex = vi.fn()
      render(<MathBlock latex="" isEditable={true} updateLatex={updateLatex} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'E = mc^2' } })
      fireEvent.click(screen.getByText('Listo'))

      expect(updateLatex).toHaveBeenCalledWith('E = mc^2')
    })

    it('trims trailing newline from textarea value before saving', () => {
      const updateLatex = vi.fn()
      render(<MathBlock latex="" isEditable={true} updateLatex={updateLatex} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'E = mc^2\n' } })
      fireEvent.click(screen.getByText('Listo'))

      expect(updateLatex).toHaveBeenCalledWith('E = mc^2')
    })

    it('does not exit editing when value is empty after save', () => {
      const updateLatex = vi.fn()
      render(<MathBlock latex="" isEditable={true} updateLatex={updateLatex} />)

      fireEvent.click(screen.getByText('Listo'))

      expect(updateLatex).toHaveBeenCalledWith('')
      expect(screen.getByRole('textbox')).toBeDefined()
    })

    it('shows source preview when value is non-empty', () => {
      const { container } = render(
        <MathBlock latex="" isEditable={true} updateLatex={vi.fn()} />,
      )
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'x^2' } })
      const code = container.querySelector('code')
      expect(code?.textContent).toBe('x^2')
    })
  })

  describe('keyboard handling', () => {
    it('saves and exits on Enter (without Shift)', () => {
      const updateLatex = vi.fn()
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={updateLatex} />,
      )
      fireEvent.click(container.querySelector('.math-block-preview')!)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter' })

      expect(updateLatex).toHaveBeenCalledWith('x^2')
    })

    it('saves on Escape', () => {
      const updateLatex = vi.fn()
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={updateLatex} />,
      )
      fireEvent.click(container.querySelector('.math-block-preview')!)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Escape' })

      expect(updateLatex).toHaveBeenCalledWith('x^2')
    })

    it('allows Shift+Enter for new line', () => {
      const updateLatex = vi.fn()
      render(<MathBlock latex="" isEditable={true} updateLatex={updateLatex} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      expect(updateLatex).not.toHaveBeenCalled()
    })
  })

  describe('preview mode', () => {
    it('renders preview div when latex is provided and not editing', () => {
      const { container } = render(
        <MathBlock latex="E = mc^2" isEditable={false} updateLatex={vi.fn()} />,
      )
      expect(container.querySelector('.math-block-preview')).not.toBeNull()
    })

    it('calls katex.render in preview mode', () => {
      render(<MathBlock latex="x^2" isEditable={false} updateLatex={vi.fn()} />)
      expect(katex.render).toHaveBeenCalled()
    })

    it('does not render textarea in preview mode', () => {
      render(<MathBlock latex="x^2" isEditable={false} updateLatex={vi.fn()} />)
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('does not enter editing mode on click when not editable', () => {
      const { container } = render(
        <MathBlock latex="x^2" isEditable={false} updateLatex={vi.fn()} />,
      )
      const preview = container.querySelector('.math-block-preview')!
      fireEvent.click(preview)
      expect(screen.queryByRole('textbox')).toBeNull()
    })
  })

  describe('hover state', () => {
    it('applies hover style on mouse enter when editable', () => {
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={vi.fn()} />,
      )
      const preview = container.querySelector('.math-block-preview')!
      fireEvent.mouseEnter(preview)
      expect(preview.getAttribute('style')).toContain('background')
    })

    it('removes hover style on mouse leave', () => {
      const { container } = render(
        <MathBlock latex="x^2" isEditable={true} updateLatex={vi.fn()} />,
      )
      const preview = container.querySelector('.math-block-preview')!
      fireEvent.mouseEnter(preview)
      fireEvent.mouseLeave(preview)
      expect(preview.getAttribute('style')).toContain('transparent')
    })
  })
})
