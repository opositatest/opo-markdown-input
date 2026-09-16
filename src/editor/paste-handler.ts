type TDefaultPasteOptions = {
  prioritizeMarkdownOverHTML?: boolean
  plainTextAsMarkdown?: boolean
}

type TPasteHandlerContext = {
  defaultPasteHandler: (options?: TDefaultPasteOptions) => boolean | undefined
}

/**
 * Paste handler for editors whose content is read back verbatim.
 *
 * BlockNote parses `text/plain` from the clipboard as Markdown by default, and
 * prefers that guess over the `text/html` flavour when the pasted text "looks
 * like Markdown". Copying a legal text is exactly that case: its plain text is
 * full of lines starting with `1. `, so pasting it (or pasting without
 * formatting, `Ctrl/⌘+Shift+V`) turned the apartados into an auto-numbered list,
 * which then renumbered them: `1.`, `3.` came back as `1.`, `2.`
 * (the "the numbered apartados no longer match" report).
 *
 * With this handler the clipboard is taken at face value: `text/html` when the
 * source provides it, plain text otherwise, and never guessed as Markdown.
 * Explicit Markdown (`text/markdown`, the editor's own `pasteMarkdown()`) keeps
 * working, and inline formatting from the HTML flavour is still applied.
 */
export function literalTextPasteHandler({
  defaultPasteHandler,
}: TPasteHandlerContext): boolean | undefined {
  return defaultPasteHandler({
    prioritizeMarkdownOverHTML: false,
    plainTextAsMarkdown: false,
  })
}
