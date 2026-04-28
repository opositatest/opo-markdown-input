export const BODY_INITIAL_MARKDOWN = `# Product update

This editor is ready for internal tools, documentation workflows, and embedded forms.

## Why it works well

- Submits clean Markdown through a regular HTML form
- Supports multiple isolated instances on the same page
- Exposes a tiny JavaScript API for host integrations

> The same package ships as a React component and as a self-contained custom element.

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$`

export const BODY_EDITOR_HEIGHT = '340px'

export const SUMMARY_INITIAL_MARKDOWN =
  'Embeddable Markdown editor with native form behavior and programmatic control.'

export const SUMMARY_EDITOR_HEIGHT = '180px'
export const SUMMARY_EDITOR_WIDTH = '100%'

export const PROGRAMMATIC_SUMMARY_MARKDOWN = `Updated from JavaScript.

- Summary refreshed
- Focus moved to the field`

export const DEMO_BADGES = [
  'Custom Element',
  'React 19',
  'Markdown Output',
  'Form-Associated',
]

export const DEMO_HIGHLIGHTS = [
  'Regular form submit and reset behavior',
  'Live Markdown serialization for host apps',
  'Custom math block support with KaTeX rendering',
  'Programmatic focus and content updates from JavaScript',
]

export const HOST_FORM_CHECKS = [
  'Public <markdown-text-editor> tag for host pages',
  'Multiple editor instances without shared state',
  'Automatic Markdown synchronization',
  'Configurable width and height attributes',
  'Native form submit and reset integration',
  'JavaScript API with focus(), getMarkdown(), and setMarkdown()',
]

export const INITIAL_SUBMITTED_DATA = {
  body: BODY_INITIAL_MARKDOWN,
  summary: SUMMARY_INITIAL_MARKDOWN,
}
