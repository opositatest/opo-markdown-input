import { describe, it, expect } from 'vitest'
import css from './markdown-text-editor.css?raw'

/**
 * `.markdown-text-editor__field` is the outer bordered/rounded wrapper around
 * `AppBlockNoteView` (see `src/editor/editor-field/editor-field.tsx`).
 *
 * BlockNote's link toolbar and its "Editar enlace" popover are rendered as
 * DOM siblings of `.bn-editor` (both live inside `.bn-container`), and
 * neither uses a portal (see `@blocknote/react`'s `GenericPopover` and
 * `@blocknote/mantine`'s `Popover`, which hardcodes `withinPortal={false}`).
 * If the outer field wrapper clips overflow, any popover whose floating
 * position falls outside that box gets visually cut off.
 */
function extractRuleBlock(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))
  if (!match) {
    throw new Error(`Could not find CSS rule for selector "${selector}"`)
  }
  return match[1]
}

describe('markdown-text-editor.css field wrapper', () => {
  it('does not clip its floating children (link toolbar / edit-link popover)', () => {
    const fieldRule = extractRuleBlock(css, '.markdown-text-editor__field')

    expect(fieldRule).not.toMatch(/overflow\s*:\s*hidden/)
  })

  it('still clips the editable content against the rounded corners', () => {
    const editorRule = extractRuleBlock(css, '.markdown-text-editor__field .bn-editor')

    expect(editorRule).toMatch(/overflow\s*:\s*hidden/)
    expect(editorRule).toMatch(/border-radius\s*:/)
  })
})
