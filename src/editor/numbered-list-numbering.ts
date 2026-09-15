import { defaultBlockSpecs } from '@blocknote/core'

/**
 * Source of BlockNote's own autoformat rule for numbered lists: typing a number,
 * a dot and a space at the end of a paragraph replaces the paragraph with a
 * numbered list item.
 */
export const NUMBERED_LIST_AUTOFORMAT_SOURCE = '^\\s?(\\d+)\\.\\s$'

type TInputRule = {
  find: RegExp
  replace: (props: unknown) => unknown
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
 * `defaultBlockSpecs.numberedListItem`, minus its "1. " autoformat rule.
 *
 * The editor numbers list items by position, so a typed number cannot be kept:
 * typing `3. ` after item 1 used to create an item the editor displayed as `2.`
 * (the number the author wrote was thrown away, and Markdown cannot express
 * "1, 3" either, since only the first item of a list carries a number).
 * Leaving the number as text is the only way to keep it, and that is what the
 * content of this package needs: apartados that are cited elsewhere by number.
 *
 * Everything else in the spec (Enter handling, `Mod-Shift-7`, the numbering
 * decoration plugin) is left untouched, so numbered lists are still available
 * on purpose, from the slash menu, the block selector or `Mod-Shift-7`, and
 * documents loaded from Markdown keep their lists.
 */
export function createNumberedListItemSpecWithoutAutoformat(
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
          inputRules: created.inputRules?.filter(
            (rule) => rule.find.source !== NUMBERED_LIST_AUTOFORMAT_SOURCE,
          ),
        }
      }
    }),
  }
}
