import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FloatingPortal } from './floating-portal'

/**
 * BlockNote renders its floating toolbars/popovers inline, wherever their
 * controller sits in the React tree - never in a portal. A host ancestor
 * with `backdrop-filter` (or `transform`/`filter`/`perspective`/
 * `will-change`) creates its own containing block, which traps a merely
 * `position: fixed` element inside it, so the popover can end up painted
 * underneath a later sibling no matter its z-index (see `app-block-note-
 * view.tsx` and `floating-portal.tsx` for the full write-up). `FloatingPortal`
 * escapes this by moving the real DOM node to `document.body`.
 */
describe('FloatingPortal', () => {
  it("moves its content out to document.body, escaping the positioned ancestor's subtree", () => {
    // Mimic the DOM BlockNote builds: `.bn-container` > (some wrapper) >
    // the `position: fixed` element floating-ui renders, which is where
    // `FloatingPortal`'s children actually land.
    const container = document.createElement('div')
    container.className = 'bn-container light bn-mantine'
    container.setAttribute('data-mantine-color-scheme', 'light')
    document.body.appendChild(container)

    const positioned = document.createElement('div')
    positioned.style.position = 'fixed'
    container.appendChild(positioned)

    render(<FloatingPortal>Editar enlace</FloatingPortal>, { container: positioned })

    expect(document.body.textContent).toContain('Editar enlace')
    // The real content must not be a descendant of the positioned element
    // BlockNote controls - that's the whole point, it's what a host
    // ancestor's `overflow`/stacking context would otherwise trap.
    expect(positioned.textContent).not.toContain('Editar enlace')
  })

  it('hides the original positioned element without collapsing its measured size', () => {
    const container = document.createElement('div')
    container.className = 'bn-container light bn-mantine'
    document.body.appendChild(container)

    const positioned = document.createElement('div')
    positioned.style.position = 'fixed'
    container.appendChild(positioned)

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    // `visibility: hidden` (not `display: none`) keeps floating-ui able to
    // measure the element for its `flip`/`shift` middleware, while making
    // sure it neither shows nor intercepts clicks in its original spot.
    expect(positioned.style.visibility).toBe('hidden')
    expect(positioned.style.pointerEvents).toBe('none')
  })

  it("mirrors the nearest .bn-container's theme class and color scheme onto the portalled content", () => {
    // Mantine/BlockNote's CSS variables (colors, spacing, radii) are
    // defined on `.bn-container`, not on `:root` - moving the real content
    // to `document.body` without carrying that class along would silently
    // drop every themed style (see `floating-portal.tsx`).
    const container = document.createElement('div')
    container.className = 'bn-container light bn-mantine markdown-editor-field'
    container.setAttribute('data-mantine-color-scheme', 'light')
    document.body.appendChild(container)

    const positioned = document.createElement('div')
    positioned.style.position = 'fixed'
    container.appendChild(positioned)

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    const portalled = [...document.body.children].find(
      (el) => el !== container && el.textContent?.includes('content'),
    )

    expect(portalled?.className).toBe(container.className)
    expect(portalled?.getAttribute('data-mantine-color-scheme')).toBe('light')
  })
})
