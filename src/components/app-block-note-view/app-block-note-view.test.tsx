import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AppBlockNoteView } from './app-block-note-view'

/**
 * BlockNote's formatting/link toolbars - and the popovers they open, like
 * "Editar enlace" - don't render in a portal, so with the default `absolute`
 * floating-ui strategy any ancestor with `overflow: hidden` clips them, and
 * they can end up visually underneath a sibling that paints later in the
 * same stacking context (see `app-block-note-view.tsx`). `strategy: 'fixed'`
 * escapes both problems. These tests assert that option actually reaches
 * both controllers, without needing to mount a real BlockNote editor.
 */

vi.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-block-note-view">{children}</div>
  ),
}))

vi.mock('@blocknote/mantine/style.css', () => ({}))
vi.mock('./app-block-note-view.css', () => ({}))

vi.mock('@blocknote/react', () => ({
  FormattingToolbarController: (props: unknown) => (
    <div data-testid="mock-formatting-toolbar-controller" data-props={JSON.stringify(props)} />
  ),
  LinkToolbarController: (props: unknown) => (
    <div data-testid="mock-link-toolbar-controller" data-props={JSON.stringify(props)} />
  ),
}))

vi.mock('./app-formatting-toolbar', () => ({
  AppFormattingToolbar: () => null,
}))

describe('AppBlockNoteView', () => {
  it('positions the formatting toolbar with a fixed floating-ui strategy', () => {
    const { getByTestId } = render(<AppBlockNoteView editor={{} as never} />)

    const props = JSON.parse(getByTestId('mock-formatting-toolbar-controller').dataset.props!)
    expect(props.floatingUIOptions.useFloatingOptions.strategy).toBe('fixed')
  })

  it('positions the link toolbar with a fixed floating-ui strategy', () => {
    const { getByTestId } = render(<AppBlockNoteView editor={{} as never} />)

    const props = JSON.parse(getByTestId('mock-link-toolbar-controller').dataset.props!)
    expect(props.floatingUIOptions.useFloatingOptions.strategy).toBe('fixed')
  })

  it('does not render either controller when disabled', () => {
    const { queryByTestId } = render(
      <AppBlockNoteView editor={{} as never} formattingToolbar={false} linkToolbar={false} />,
    )

    expect(queryByTestId('mock-formatting-toolbar-controller')).toBeNull()
    expect(queryByTestId('mock-link-toolbar-controller')).toBeNull()
  })
})
