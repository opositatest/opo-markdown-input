import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MarkdownTextEditorElement } from './markdown-text-editor-element'
import { MARKDOWN_TEXT_EDITOR_TAG_NAME } from './markdown-text-editor.constants'

vi.mock('../editor/editor-field/editor-field', () => ({
  MarkdownTextEditor: ({ onReady, onChange }: { onReady?: (h: unknown) => void; onChange?: (v: string) => void }) => {
    const handle = { focus: vi.fn(), getMarkdown: vi.fn().mockReturnValue(''), setMarkdown: vi.fn() }
    onReady?.(handle)
    return (
      <div data-testid="mock-editor">
        <button data-testid="mock-change" onClick={() => onChange?.('new value')}>
          change
        </button>
      </div>
    )
  },
}))

function createElement(attrs?: Record<string, string>): MarkdownTextEditorElement {
  const el = document.createElement(MARKDOWN_TEXT_EDITOR_TAG_NAME) as MarkdownTextEditorElement
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
  }
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  if (!customElements.get(MARKDOWN_TEXT_EDITOR_TAG_NAME)) {
    customElements.define(MARKDOWN_TEXT_EDITOR_TAG_NAME, MarkdownTextEditorElement)
  }
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MarkdownTextEditorElement', () => {
  describe('DOM structure', () => {
    it('creates a hidden input when ElementInternals is not available', () => {
      const el = createElement()
      const hiddenInput = el.querySelector('input[type="hidden"]')
      expect(hiddenInput).not.toBeNull()
      expect(hiddenInput?.getAttribute('aria-hidden')).toBe('true')
    })

    it('creates a react container div', () => {
      const el = createElement()
      const container = el.querySelector('[class*="markdown-text-editor__mount"]')
      expect(container).not.toBeNull()
    })
  })

  describe('value', () => {
    it('returns empty string by default', () => {
      const el = createElement()
      expect(el.value).toBe('')
    })

    it('reads initial value from value attribute', () => {
      const el = createElement({ value: 'hello' })
      expect(el.value).toBe('hello')
    })

    it('sets value via property', () => {
      const el = createElement()
      el.value = 'test'
      expect(el.value).toBe('test')
    })

    it('updates hidden input value', () => {
      const el = createElement()
      el.value = 'test'
      const hiddenInput = el.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hiddenInput.value).toBe('test')
    })
  })

  describe('attribute reflection', () => {
    it('reflects name attribute', () => {
      const el = createElement()
      el.name = 'field-name'
      expect(el.getAttribute('name')).toBe('field-name')
    })

    it('reflects disabled attribute', () => {
      const el = createElement()
      el.disabled = true
      expect(el.hasAttribute('disabled')).toBe(true)
      el.disabled = false
      expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('reflects readonly attribute', () => {
      const el = createElement()
      el.readOnly = true
      expect(el.hasAttribute('readonly')).toBe(true)
    })

    it('reflects required attribute', () => {
      const el = createElement()
      el.required = true
      expect(el.hasAttribute('required')).toBe(true)
    })

    it('reflects placeholder attribute', () => {
      const el = createElement()
      el.placeholder = 'Type here'
      expect(el.getAttribute('placeholder')).toBe('Type here')
    })

    it('reflects width and height attributes', () => {
      const el = createElement()
      el.width = '100%'
      el.height = '400px'
      expect(el.getAttribute('width')).toBe('100%')
      expect(el.getAttribute('height')).toBe('400px')
    })

    it('defaults formattingToolbar to true when attribute is absent', () => {
      const el = createElement()
      expect(el.formattingToolbar).toBe(true)
      expect(el.hasAttribute('formatting-toolbar')).toBe(false)
    })

    it('reads formattingToolbar as false when attribute is "false"', () => {
      const el = createElement({ 'formatting-toolbar': 'false' })
      expect(el.formattingToolbar).toBe(false)
    })

    it('removes formatting-toolbar attribute when set to true', () => {
      const el = createElement({ 'formatting-toolbar': 'false' })
      el.formattingToolbar = true
      expect(el.hasAttribute('formatting-toolbar')).toBe(false)
      expect(el.formattingToolbar).toBe(true)
    })

    it('sets formatting-toolbar attribute to "false" when set to false', () => {
      const el = createElement()
      el.formattingToolbar = false
      expect(el.getAttribute('formatting-toolbar')).toBe('false')
      expect(el.formattingToolbar).toBe(false)
    })
  })

  describe('attributeChangedCallback', () => {
    it('updates value when value attribute changes', () => {
      const el = createElement({ value: 'initial' })
      el.setAttribute('value', 'updated')
      expect(el.value).toBe('updated')
    })

    it('parses hidden-slash-menu-items from JSON', () => {
      const el = createElement()
      el.setAttribute('hidden-slash-menu-items', '["heading","divider"]')
      expect(el.hiddenSlashMenuItems).toEqual(['heading', 'divider'])
    })

    it('returns empty array for invalid JSON', () => {
      const el = createElement()
      el.setAttribute('hidden-slash-menu-items', 'not-json')
      expect(el.hiddenSlashMenuItems).toEqual([])
    })

    it('returns empty array for non-array JSON', () => {
      const el = createElement()
      el.setAttribute('hidden-slash-menu-items', '{"foo":"bar"}')
      expect(el.hiddenSlashMenuItems).toEqual([])
    })

    it('updates formattingToolbar when formatting-toolbar attribute changes', () => {
      const el = createElement()
      expect(el.formattingToolbar).toBe(true)
      el.setAttribute('formatting-toolbar', 'false')
      expect(el.formattingToolbar).toBe(false)
      el.removeAttribute('formatting-toolbar')
      expect(el.formattingToolbar).toBe(true)
    })
  })

  describe('getMarkdown / setMarkdown', () => {
    it('getMarkdown returns current value', () => {
      const el = createElement({ value: 'hello' })
      expect(el.getMarkdown()).toBe('hello')
    })

    it('setMarkdown updates value', () => {
      const el = createElement()
      el.setMarkdown('new content')
      expect(el.value).toBe('new content')
    })
  })

  describe('validation', () => {
    it('sets aria-invalid when required and empty', () => {
      const el = createElement({ required: '' })
      expect(el.getAttribute('aria-invalid')).toBe('true')
    })

    it('removes aria-invalid when value is provided', () => {
      const el = createElement({ required: '', value: 'something' })
      expect(el.getAttribute('aria-invalid')).toBeNull()
    })

    it('does not set aria-invalid when required but disabled', () => {
      const el = createElement({ required: '', disabled: '' })
      expect(el.getAttribute('aria-invalid')).toBeNull()
    })
  })

  describe('form interaction', () => {
    it('syncs hidden input name from name attribute', () => {
      const el = createElement({ name: 'editor-field' })
      const hiddenInput = el.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hiddenInput.name).toBe('editor-field')
    })

    it('resets to default value on form reset', async () => {
      const form = document.createElement('form')
      const el = createElement({ value: 'default' })
      form.appendChild(el)
      document.body.appendChild(form)

      el.value = 'modified'
      expect(el.value).toBe('modified')

      form.dispatchEvent(new Event('reset'))
      await vi.waitFor(() => {
        expect(el.value).toBe('default')
      })
    })
  })

  describe('events', () => {
    it('dispatches change event on focus out when value changed', () => {
      const el = createElement({ value: 'initial' })
      const handler = vi.fn()
      el.addEventListener('change', handler)

      el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      el.value = 'modified'
      el.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }))

      expect(handler).toHaveBeenCalled()
    })

    it('does not dispatch change event when value unchanged', () => {
      const el = createElement({ value: 'same' })
      const handler = vi.fn()
      el.addEventListener('change', handler)

      el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      el.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }))

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('disconnectedCallback', () => {
    it('cleans up on disconnect', () => {
      const el = createElement({ value: 'test' })
      expect(el.value).toBe('test')

      el.remove()
      // Should not throw
      expect(el.value).toBe('test')
    })
  })
})
