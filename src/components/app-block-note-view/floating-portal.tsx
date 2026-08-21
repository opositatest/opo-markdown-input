import { useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const FLOATING_SYNC_EPSILON_PX = 0.5

/**
 * BlockNote's floating toolbars (formatting toolbar, link toolbar, and the
 * popovers they open, e.g. "Editar enlace") render inline wherever their
 * controller sits in the React tree - never in a portal. Even with a
 * `strategy: 'fixed'` floating-ui option (see `FLOATING_UI_OPTIONS` in
 * `app-block-note-view.tsx`), a host ancestor with `transform`, `filter`,
 * `backdrop-filter`, `perspective`, `will-change`, or `contain` creates its
 * own containing block, which traps the `position: fixed` element inside
 * it - so the toolbar can still end up painted underneath a sibling that
 * comes later in the DOM, no matter how high its z-index is. This is not
 * hypothetical: it reproduces with nothing more exotic than a card using
 * `backdrop-filter` around the editor.
 *
 * `FloatingPortal` escapes this for good by moving the *real* DOM node to
 * `document.body`, outside of any ancestor's influence:
 * - It leaves a same-sized, invisible spacer where floating-ui's own
 *   positioned element expects its content, so floating-ui keeps measuring
 *   the real size for its `flip`/`shift` middleware.
 * - It mirrors that positioned ancestor's on-screen coordinates onto a
 *   `position: fixed` copy of the DOM subtree rendered via `createPortal`
 *   into `document.body`. This is a portal, not a clone: the React
 *   component tree (state, context, effects) is untouched, only the actual
 *   DOM node moves - so nested state (e.g. the "Editar enlace" popover's
 *   own open/closed state) keeps working normally.
 */
export function FloatingPortal({ children }: { children: ReactNode }): ReactElement {
  const spacerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    const spacer = spacerRef.current
    const content = contentRef.current
    const positioned = spacer?.parentElement

    if (!spacer || !content || !positioned) {
      return
    }

    // Mantine/BlockNote's CSS variables (colors, spacing, radii - what the
    // portalled buttons' inline `var(--mantine-*)`/`var(--bn-*)` styles
    // resolve against) are defined on the `.bn-container` element, not on
    // `:root`. Moving the real content out to `document.body` would drop
    // that inherited context, so we mirror the same class/attribute onto
    // the portal's own container to redefine those variables there too.
    const themedAncestor = positioned.closest('.bn-container')
    if (themedAncestor) {
      content.className = themedAncestor.className
      const colorScheme = themedAncestor.getAttribute('data-mantine-color-scheme')
      if (colorScheme) {
        content.setAttribute('data-mantine-color-scheme', colorScheme)
      }
    }

    const lastPosition = { top: Number.NaN, left: Number.NaN }
    const syncPosition = (): void => {
      const box = positioned.getBoundingClientRect()

      if (
        Math.abs(box.top - lastPosition.top) < FLOATING_SYNC_EPSILON_PX &&
        Math.abs(box.left - lastPosition.left) < FLOATING_SYNC_EPSILON_PX
      ) {
        return
      }

      lastPosition.top = box.top
      lastPosition.left = box.left
      setPosition({ top: box.top, left: box.left })
    }

    const lastSpacerSize = { width: Number.NaN, height: Number.NaN }
    const syncSpacerSize = (): void => {
      const box = content.getBoundingClientRect()

      if (
        Math.abs(box.width - lastSpacerSize.width) < FLOATING_SYNC_EPSILON_PX &&
        Math.abs(box.height - lastSpacerSize.height) < FLOATING_SYNC_EPSILON_PX
      ) {
        return
      }

      lastSpacerSize.width = box.width
      lastSpacerSize.height = box.height
      spacer.style.width = `${box.width}px`
      spacer.style.height = `${box.height}px`
    }

    syncSpacerSize()
    syncPosition()

    // Keep floating-ui's own element measurable (for `flip`/`shift`) while
    // hiding it - the real, interactive content now lives in the portal.
    positioned.style.visibility = 'hidden'
    positioned.style.pointerEvents = 'none'

    // Only the portalled content determines the spacer's size. Observing
    // `positioned` here would create a feedback loop because changing the
    // spacer resizes that element; floating-ui already observes and
    // repositions it through `autoUpdate`.
    const resizeObserver = new ResizeObserver(syncSpacerSize)
    resizeObserver.observe(content)

    // A style mutation means floating-ui has finished writing its position,
    // so this avoids reading an intermediate position during a resize.
    const mutationObserver = new MutationObserver(syncPosition)
    mutationObserver.observe(positioned, { attributes: true, attributeFilter: ['style'] })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      positioned.style.visibility = ''
      positioned.style.pointerEvents = ''
    }
  }, [])

  return (
    <>
      <div ref={spacerRef} />
      {createPortal(
        <div
          ref={contentRef}
          style={{
            position: 'fixed',
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            visibility: position ? 'visible' : 'hidden',
            zIndex: 100000,
          }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}
