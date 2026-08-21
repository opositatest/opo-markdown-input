import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FloatingPortal } from './floating-portal'

function createPositionedElement(): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'bn-container light bn-mantine'
  document.body.appendChild(container)

  const positioned = document.createElement('div')
  positioned.style.position = 'fixed'
  container.appendChild(positioned)

  return positioned
}

function installResizeObserverMock(): {
  observedTargets: Element[]
  trigger: () => void
} {
  const observedTargets: Element[] = []
  let callback: ResizeObserverCallback | null = null

  const callbackObserver: ResizeObserver = {
    observe(target: Element): void {
      observedTargets.push(target)
    },
    unobserve(target: Element): void {
      const index = observedTargets.indexOf(target)
      if (index >= 0) {
        observedTargets.splice(index, 1)
      }
    },
    disconnect(): void {
      observedTargets.length = 0
    },
  }

  class MockResizeObserver implements ResizeObserver {
    constructor(nextCallback: ResizeObserverCallback) {
      callback = nextCallback
    }

    observe(target: Element): void {
      callbackObserver.observe(target)
    }

    unobserve(target: Element): void {
      callbackObserver.unobserve(target)
    }

    disconnect(): void {
      callbackObserver.disconnect()
    }
  }

  vi.stubGlobal('ResizeObserver', MockResizeObserver)

  return {
    observedTargets,
    trigger: () => {
      if (!callback) {
        throw new Error('ResizeObserver was not created')
      }

      callback([], callbackObserver)
    },
  }
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

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

  it('keeps the original positioned element interactive for Floating UI hover tracking', () => {
    const container = document.createElement('div')
    container.className = 'bn-container light bn-mantine'
    document.body.appendChild(container)

    const positioned = document.createElement('div')
    positioned.style.position = 'fixed'
    container.appendChild(positioned)

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    // The positioned element contains only the invisible spacer. Hiding it or
    // disabling pointer events makes Floating UI observe a synthetic
    // mouseleave and close the portalled toolbar.
    expect(positioned.style.visibility).toBe('')
    expect(positioned.style.pointerEvents).toBe('')
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

  it('observes only the portalled content for size changes', () => {
    const resizeObserver = installResizeObserverMock()
    const positioned = createPositionedElement()

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    const portalled = screen.getByText('content')
    expect(resizeObserver.observedTargets).toEqual([portalled])
    expect(resizeObserver.observedTargets).not.toContain(positioned)
  })

  it('does not read the positioned element during a content resize', () => {
    const resizeObserver = installResizeObserverMock()
    const positioned = createPositionedElement()
    const positionRectSpy = vi
      .spyOn(positioned, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(12, 8, 100, 20))

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    const readsAfterMount = positionRectSpy.mock.calls.length
    const portalled = screen.getByText('content')
    vi.spyOn(portalled, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 32))

    act(() => resizeObserver.trigger())

    expect(positionRectSpy).toHaveBeenCalledTimes(readsAfterMount)
    expect(positioned.firstElementChild).toHaveStyle({ width: '120px', height: '32px' })
  })

  it("mirrors floating-ui's position after it mutates the positioned element", async () => {
    const positioned = createPositionedElement()
    let rect = new DOMRect(10, 20, 100, 20)
    vi.spyOn(positioned, 'getBoundingClientRect').mockImplementation(() => rect)

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    const portalled = screen.getByText('content')
    expect(portalled).toHaveStyle({ top: '20px', left: '10px' })

    rect = new DOMRect(30, 40, 100, 20)
    positioned.style.top = '40px'
    positioned.style.left = '30px'

    await waitFor(() => expect(portalled).toHaveStyle({ top: '40px', left: '30px' }))
  })

  it('ignores sub-pixel position jitter', async () => {
    const positioned = createPositionedElement()
    let rect = new DOMRect(10, 20, 100, 20)
    const positionRectSpy = vi
      .spyOn(positioned, 'getBoundingClientRect')
      .mockImplementation(() => rect)

    render(<FloatingPortal>content</FloatingPortal>, { container: positioned })

    const portalled = screen.getByText('content')
    const readsAfterMount = positionRectSpy.mock.calls.length
    rect = new DOMRect(10.4, 20.4, 100, 20)
    positioned.style.transform = 'translate3d(10.4px, 20.4px, 0)'

    await waitFor(() =>
      expect(positionRectSpy.mock.calls.length).toBeGreaterThan(readsAfterMount),
    )
    expect(portalled).toHaveStyle({ top: '20px', left: '10px' })
  })
})
