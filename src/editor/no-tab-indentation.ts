// `@tiptap/pm` is intentionally not declared in `package.json`: it is imported
// here (only `Plugin` and the table helpers) so that these modules resolve to
// the exact same copy BlockNote uses. Declaring our own version range can end
// up nesting a second copy, and a `Plugin` created by a different copy of
// `prosemirror-state` is not recognised by the editor's state, which would
// silently drop the plugin. Both builds bundle it, so consumers never need it.
import type { ExtensionFactoryInstance } from '@blocknote/core'
import { Plugin, type EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { goToNextCell, type Direction } from '@tiptap/pm/tables'

/**
 * BlockNote block type, which is also the name of the ProseMirror node that
 * holds a code block's text content.
 */
const CODE_BLOCK_NODE_NAME = 'codeBlock'

export const NO_TAB_INDENTATION_EXTENSION_KEY = 'no-tab-indentation'

type TTabDecisionInput = {
  key: string
  shiftKey: boolean
  isInCodeBlock: boolean
  canMoveToAdjacentTableCell: boolean
}

/**
 * Decides what `Tab` does inside the editor, replacing BlockNote's default
 * "indent (nest) the current block" behaviour, which is not part of this
 * package's supported surface (see the README's "Tab key" section).
 *
 * - `true`: the keydown is swallowed *without* `preventDefault()`, so the
 *   browser moves focus to the next/previous focusable element of the host
 *   page - plain form-field navigation. Nothing gets indented.
 * - `false`: `Tab` keeps its upstream BlockNote meaning (inserting two spaces
 *   inside a code block, moving between table cells).
 */
export function shouldSwallowTab(input: TTabDecisionInput): boolean {
  if (input.key !== 'Tab') {
    return false
  }

  // Code blocks are the one place where Tab still indents a line. `Shift-Tab`
  // is not handled by BlockNote there, so it falls through to "leave the editor".
  if (!input.shiftKey && input.isInCodeBlock) {
    return false
  }

  // Tables keep navigating between cells; when there is no neighbouring cell
  // (first/last one), Tab leaves the editor instead of indenting the table.
  return !input.canMoveToAdjacentTableCell
}

function isInCodeBlock(state: EditorState): boolean {
  return state.selection.$from.parent.type.name === CODE_BLOCK_NODE_NAME
}

/** Dry run (no dispatch) of BlockNote's own table `Tab` shortcut. */
function canMoveToAdjacentTableCell(state: EditorState, direction: Direction): boolean {
  return goToNextCell(direction)(state, undefined)
}

function handleKeydown(view: EditorView, event: KeyboardEvent): boolean {
  return shouldSwallowTab({
    key: event.key,
    shiftKey: event.shiftKey,
    isInCodeBlock: isInCodeBlock(view.state),
    canMoveToAdjacentTableCell: canMoveToAdjacentTableCell(
      view.state,
      event.shiftKey ? -1 : 1,
    ),
  })
}

/**
 * Stops `Tab` from indenting blocks.
 *
 * Returning `true` from `handleDOMEvents` makes prosemirror-view skip its own
 * `keydown` handling entirely (see `runCustomHandler`), which disarms every
 * Tab shortcut registered by BlockNote/tiptap/ProseMirror in one place. Unlike
 * `handleKeyDown`, prosemirror-view does not call `preventDefault()` for
 * `handleDOMEvents`, so the browser keeps its native focus navigation.
 */
export const noTabIndentationExtension: ExtensionFactoryInstance = () => ({
  key: NO_TAB_INDENTATION_EXTENSION_KEY,
  prosemirrorPlugins: [
    new Plugin({
      props: {
        handleDOMEvents: {
          keydown: handleKeydown,
        },
      },
    }),
  ],
})
