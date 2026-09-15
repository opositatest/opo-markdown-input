/**
 * Markdown has no way of saying "this line looks like a list item, but it is
 * plain text": a paragraph whose text starts with a block marker (`3. `, `- `,
 * `# `, `> `…) is written verbatim by the lossy Markdown exporter and is read
 * back as that other block. A paragraph that said `3. No será preciso…` comes
 * back as a numbered list item, so the number the author typed stops being text
 * and starts being renumbered by the editor.
 *
 * Escaping the marker with a CommonMark backslash escape keeps the block type
 * stable across saves (and for any host that renders the saved Markdown) while
 * rendering exactly the same text.
 *
 * Only the **start of a line** can open a block, and only a **paragraph** needs
 * this treatment: every other block type already has its own syntax. Inline
 * nodes other than text (links, mentions…) cannot open a block either, because
 * their Markdown always starts with their own delimiter.
 */
const LEADING_BLOCK_MARKER_REGEX =
  /^(?:(\d{1,9})([.)])(?=\s|$)|([-*+])(?=\s|$)|(#{1,6})(?=\s|$)|(>)|(`{3,}|~{3,}))/gm

export function escapeLeadingBlockMarker(text: string): string {
  return text.replace(
    LEADING_BLOCK_MARKER_REGEX,
    (match: string, digits?: string, delimiter?: string): string => {
      // Digits are not escapable characters, so `\3\.` is not enough: the
      // delimiter itself has to carry the backslash -> `3\.`
      if (digits !== undefined) {
        return `${digits}\\${delimiter}`
      }

      // `-`, `*`, `+`, `#`, `>`, backticks and tildes are all escapable ASCII
      // punctuation, so prefixing the marker is enough -> `\-`
      return `\\${match}`
    },
  )
}

type TInlineNode = {
  type?: string
  text?: string
}

type TBlockLike = {
  type?: string
  content?: unknown
}

/**
 * Returns a copy of `block` with its leading block marker escaped, or the very
 * same reference when there is nothing to escape. The block returned by the
 * editor is never mutated: the escaped copy is only handed to the Markdown
 * serializer.
 */
export function escapeBlockMarkers<T>(block: T): T {
  const candidate = block as TBlockLike
  if (candidate.type !== 'paragraph' || !Array.isArray(candidate.content)) {
    return block
  }

  const [first, ...rest] = candidate.content as TInlineNode[]
  if (!first || first.type !== 'text' || typeof first.text !== 'string') {
    return block
  }

  const escapedText = escapeLeadingBlockMarker(first.text)
  if (escapedText === first.text) {
    return block
  }

  return { ...(block as object), content: [{ ...first, text: escapedText }, ...rest] } as T
}
