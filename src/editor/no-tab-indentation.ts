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

/**
 * ProseMirror wrapper BlockNote puts around every block. A block sits directly
 * inside the document's `blockGroup` when it is top level, and inside a
 * `blockGroup` owned by another block's container when it is nested.
 */
const BLOCK_CONTAINER_NODE_NAME = 'blockContainer'

const TABLE_CELL_ROLE = 'cell'

/**
 * The only block types whose `Tab` nesting survives a Markdown round trip, so
 * the only ones `Tab` is allowed to nest.
 *
 * `- a` / `  - b` is a nested list in Markdown, and re-parsing it rebuilds the
 * same nesting (there is a round-trip test for that). Nothing else does:
 * nesting a paragraph, or a list under a paragraph, serializes to lines that
 * Markdown reads back as *siblings*, so the nesting the user sees on screen
 * would be silently dropped on the next save.
 */
const NESTABLE_LIST_ITEM_NODE_NAMES = new Set([
  'bulletListItem',
  'checkListItem',
  'numberedListItem',
  'toggleListItem',
])

export const NO_TAB_INDENTATION_EXTENSION_KEY = 'no-tab-indentation'

type TTabDecisionInput = {
  key: string
  shiftKey: boolean
  isInCodeBlock: boolean
  isInTable: boolean
  canMoveToAdjacentTableCell: boolean
  canNestIntoPreviousListBlock: boolean
  isNestedBlock: boolean
}

/**
 * Decides what `Tab` does inside the editor, replacing BlockNote's default
 * "indent (nest) the current block" behaviour, which is not part of this
 * package's supported surface (see the README's "Tab key" section).
 *
 * - `true`: the keydown is swallowed *without* `preventDefault()`, so the
 *   browser moves focus to the next/previous focusable element of the host
 *   page - plain form-field navigation. Nothing gets indented.
 * - `false`: `Tab` keeps its upstream BlockNote meaning.
 *
 * The exceptions, in the order they are checked:
 *
 * 1. **Code blocks**: `Tab` inserts two spaces, `Shift-Tab` leaves the editor.
 * 2. **Tables**: `Tab` / `Shift-Tab` move between cells; at the first/last cell
 *    they leave the editor instead of indenting the table.
 * 3. **The second and later items of a list**: `Tab` nests the item (and
 *    `Shift-Tab` on a nested item lifts it back out), because nesting a list
 *    item is still a list item - the one nesting Markdown can express. The
 *    *first* item of a list cannot nest, so `Tab` there leaves the editor: a
 *    form field must always have a keyboard way out.
 * 4. **Everything else** - paragraphs, headings, quotes, and blocks whose
 *    previous sibling is not a list item - leaves the editor, as nesting them
 *    would be silently lost on save (see `NESTABLE_LIST_ITEM_NODE_NAMES`).
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
  // Checked before the list rule so a list inside a table cell never nests.
  if (input.isInTable) {
    return !input.canMoveToAdjacentTableCell
  }

  if (!input.shiftKey && input.canNestIntoPreviousListBlock) {
    return false
  }

  if (input.shiftKey && input.isNestedBlock) {
    return false
  }

  return true
}

function isInCodeBlock(state: EditorState): boolean {
  return state.selection.$from.parent.type.name === CODE_BLOCK_NODE_NAME
}

function isInTable(state: EditorState): boolean {
  const { $head } = state.selection

  for (let depth = $head.depth; depth > 0; depth -= 1) {
    if ($head.node(depth).type.spec.tableRole === TABLE_CELL_ROLE) {
      return true
    }
  }

  return false
}

/** Dry run (no dispatch) of BlockNote's own table `Tab` shortcut. */
function canMoveToAdjacentTableCell(state: EditorState, direction: Direction): boolean {
  return goToNextCell(direction)(state, undefined)
}

/**
 * Depth of the `blockContainer` the cursor sits in, or `null` when the
 * selection is not inside a block at all (e.g. inside a table cell).
 */
function findBlockContainerDepth(state: EditorState): number | null {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === BLOCK_CONTAINER_NODE_NAME) {
      return depth
    }
  }

  return null
}

/**
 * Whether `Tab` here builds a nested list that survives a Markdown round trip:
 * the cursor is in a list item *and* the block right before it is a list item
 * too, so `Tab` produces a child list instead of indenting an arbitrary block
 * (BlockNote's `nestBlock` sinks a block into its previous sibling whatever the
 * two types are). It also means the first item of a list never nests, which is
 * what keeps `Tab` usable to leave the editor.
 */
function canNestIntoPreviousListBlock(state: EditorState): boolean {
  if (!NESTABLE_LIST_ITEM_NODE_NAMES.has(state.selection.$from.parent.type.name)) {
    return false
  }

  const containerDepth = findBlockContainerDepth(state)
  if (containerDepth === null || containerDepth < 2) {
    return false
  }

  const { $from } = state.selection
  const index = $from.index(containerDepth - 1)
  if (index === 0) {
    return false
  }

  const previousBlock = $from.node(containerDepth - 1).child(index - 1).firstChild

  return previousBlock !== null && NESTABLE_LIST_ITEM_NODE_NAMES.has(previousBlock.type.name)
}

/**
 * Whether the block sits inside another block's group, which is what `Shift-Tab`
 * can undo (BlockNote's `canUnnestBlock`). Directly under the document's own
 * `blockGroup` (depth 1) the block is top level: there is nothing to lift out
 * of, so `Shift-Tab` leaves the editor instead.
 */
function isNestedBlock(state: EditorState): boolean {
  const containerDepth = findBlockContainerDepth(state)

  return containerDepth !== null && containerDepth > 2
}

function handleKeydown(view: EditorView, event: KeyboardEvent): boolean {
  const state = view.state
  const shiftKey = event.shiftKey

  return shouldSwallowTab({
    key: event.key,
    shiftKey,
    isInCodeBlock: isInCodeBlock(state),
    isInTable: isInTable(state),
    canMoveToAdjacentTableCell: canMoveToAdjacentTableCell(state, shiftKey ? -1 : 1),
    canNestIntoPreviousListBlock: canNestIntoPreviousListBlock(state),
    isNestedBlock: isNestedBlock(state),
  })
}

/**
 * Stops `Tab` from indenting arbitrary blocks.
 *
 * Returning `true` from `handleDOMEvents` makes prosemirror-view skip its own
 * `keydown` handling entirely (see `runCustomHandler`), which disarms every
 * Tab shortcut registered by BlockNote/tiptap/ProseMirror in one place. Unlike
 * `handleKeyDown`, prosemirror-view does not call `preventDefault()` for
 * `handleDOMEvents`, so the browser keeps its native focus navigation.
 *
 * Returning `false` hands the keydown back to those shortcuts, which is what
 * lets a list item nest (`nestBlock`) or a nested block be lifted out
 * (`liftListItem`) - see `shouldSwallowTab` for the exact rule.
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
