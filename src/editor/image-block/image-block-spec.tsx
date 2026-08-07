import { createImageBlockConfig, imageParse } from '@blocknote/core'
import { createReactBlockSpec, ImageToExternalHTML } from '@blocknote/react'
import { ImageBlockContent } from './image-block-content'

// BlockNote's default `image` block always wraps its preview in
// `ResizableFileBlockWrapper`, which adds drag handles to fix a manual pixel width
// (`previewWidth`). Images in this editor are always responsive (they adapt to the
// available width), so this overrides the block to render with `ImageBlockContent`
// instead — same sizing behaviour, minus the resize handles. The `video` block uses
// the shared `ResizableFileBlockWrapper` untouched, so it keeps its resize handles.
//
// `meta.fileBlockAccept` must be kept in sync with `@blocknote/core`'s own
// `createImageBlockSpec` (`blocks/Image/block.ts`): `@blocknote/react` reads it to set
// the `data-file-block` attribute on the block's DOM node
// (`schema/ReactBlockSpec.tsx`), which is what BlockNote's own CSS keys off of to cap
// the image at `max-width: 100%` of the editor. Without it, an image wider than the
// editor overflows instead of being capped.
export const imageBlockSpec = createReactBlockSpec(createImageBlockConfig, (config) => ({
  render: ImageBlockContent,
  parse: imageParse(config),
  toExternalHTML: ImageToExternalHTML,
  meta: {
    fileBlockAccept: ['image/*'],
  },
}))
