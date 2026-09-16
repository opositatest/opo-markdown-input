import { describe, it, expect, vi } from 'vitest'

import { literalTextPasteHandler } from './paste-handler'

describe('literalTextPasteHandler', () => {
  it('turns off both Markdown guesses of the default handler', () => {
    const defaultPasteHandler = vi.fn().mockReturnValue(true)

    literalTextPasteHandler({ defaultPasteHandler })

    expect(defaultPasteHandler).toHaveBeenCalledWith({
      prioritizeMarkdownOverHTML: false,
      plainTextAsMarkdown: false,
    })
  })

  it('returns whatever the default handler returns', () => {
    expect(literalTextPasteHandler({ defaultPasteHandler: () => true })).toBe(true)
    expect(literalTextPasteHandler({ defaultPasteHandler: () => undefined })).toBeUndefined()
  })
})
