import { defaultBlockSpecs } from '@blocknote/core'

/**
 * Source of BlockNote's own autoformat rule for numbered lists: typing a
 * number, a dot and a space at the end of a paragraph replaces the paragraph
 * with a numbered list item.
 */
export const NUMBERED_LIST_AUTOFORMAT_SOURCE = '^\\s?(\\d+)\\.\\s$'

type TNumberedSibling = {
  id?: string
  type?: string
  // The index signature keeps the real `Block` union (whose props have no
  // `start`) structurally assignable, so a real editor can be passed in.
  props?: { start?: number; [key: string]: unknown }
}

type TNumberingEditor = {
  document: TNumberedSibling[]
  getTextCursorPosition(): {
    block?: TNumberedSibling
    parentBlock?: TNumberedSibling & { children?: TNumberedSibling[] }
  }
}

/**
 * Number a new numbered list item created at `position` would be displayed
 * with, mirroring BlockNote's own numbering (see `NumberedListIndexingDecorationPlugin`):
 * the first item of a run starts at its own `start` (default 1) and every
 * following sibling continues the run, one by one.
 *
 * `position` is the index the new item would have inside `siblings`.
 */
export function resolveUpcomingNumberedIndex(
  siblings: readonly TNumberedSibling[],
  position: number,
): number {
  let runStart = position
  for (let index = position - 1; index >= 0; index -= 1) {
    if (siblings[index]?.type !== 'numberedListItem') {
      break
    }

    runStart = index
  }

  if (runStart === position) {
    return 1
  }

  const runStartNumber = siblings[runStart]?.props?.start ?? 1
  return runStartNumber + (position - runStart)
}

/**
 * Same as {@link resolveUpcomingNumberedIndex}, resolved from the block that
 * currently holds the text cursor.
 */
export function getUpcomingNumberedIndex(editor: TNumberingEditor): number {
  const position = editor.getTextCursorPosition()
  const block = position?.block
  if (!block) {
    return 1
  }

  const siblings = position.parentBlock?.children ?? editor.document
  const blockIndex = siblings.findIndex((sibling) => sibling.id === block.id)
  if (blockIndex < 0) {
    return 1
  }

  return resolveUpcomingNumberedIndex(siblings, blockIndex)
}

type TInputRuleReplace = (props: {
  match: RegExpMatchArray
  range: { from: number; to: number }
  editor: TNumberingEditor
}) => unknown

type TInputRule = {
  find: RegExp
  replace: TInputRuleReplace
}

type TExtensionLike = {
  key: string
  inputRules?: TInputRule[]
  keyboardShortcuts?: Record<string, unknown>
  prosemirrorPlugins?: unknown[]
}

type TExtensionFactoryLike = (context: unknown) => TExtensionLike

type TBlockSpecLike = {
  extensions?: Array<TExtensionFactoryLike | TExtensionLike>
}

/**
 * Replacement for the autoformat rule that keeps the number the author typed.
 *
 * BlockNote always numbers list items by position, so typing `3. ` after item 1
 * used to create an item that the editor immediately displayed as `2.`: the
 * number the author wrote was silently replaced by an automatic one, and the
 * saved Markdown (which has no way of expressing "1, 3") could not keep it
 * either.
 *
 * The autoformat is therefore only applied when the typed number is the one the
 * editor would display anyway, which makes the conversion invisible in every
 * case except the one the author cares about. Anything else stays as literal
 * text, so the number is exactly the one that was written and it survives the
 * Markdown round trip (see `escapeBlockMarkers`).
 */
function createNumberPreservingReplace(): TInputRuleReplace {
  return ({ match, editor }) => {
    const typedNumber = Number.parseInt(match[1], 10)
    const position = editor.getTextCursorPosition()

    // Mirrors upstream: headings never turn into list items.
    if (position?.block?.type === 'heading') {
      return undefined
    }

    if (typedNumber !== getUpcomingNumberedIndex(editor)) {
      return undefined
    }

    return {
      type: 'numberedListItem',
      props: { start: typedNumber === 1 ? undefined : typedNumber },
    }
  }
}

function isNumberedListAutoformatRule(rule: TInputRule): boolean {
  return rule.find.source === NUMBERED_LIST_AUTOFORMAT_SOURCE
}

/**
 * `defaultBlockSpecs.numberedListItem`, with its "1. " autoformat rule swapped
 * for one that does not overwrite a number the author typed on purpose. Every
 * other part of the spec (Enter handling, `Mod-Shift-7`, the numbering
 * decoration plugin) is left untouched.
 */
export function createNumberPreservingNumberedListItemSpec(
  baseSpec: TBlockSpecLike = defaultBlockSpecs.numberedListItem as unknown as TBlockSpecLike,
): unknown {
  const extensions = baseSpec?.extensions ?? []

  return {
    ...baseSpec,
    extensions: extensions.map((extension) => {
      if (typeof extension !== 'function') {
        return extension
      }

      return (context: unknown): TExtensionLike => {
        const created = extension(context)
        return {
          ...created,
          inputRules: created.inputRules?.map((rule) =>
            isNumberedListAutoformatRule(rule)
              ? { ...rule, replace: createNumberPreservingReplace() }
              : rule,
          ),
        }
      }
    }),
  }
}
