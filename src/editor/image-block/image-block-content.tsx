import { type createImageBlockConfig } from '@blocknote/core'
import {
  FileBlockWrapper,
  ImagePreview,
  useUploadLoading,
  type ReactCustomBlockRenderProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'
import { RiImage2Fill } from 'react-icons/ri'

// Mirrors `ResizableFileBlockWrapper`'s own markup and sizing logic (BlockNote core),
// minus the drag-to-resize handles:
// - Without an explicit width, `.bn-visual-media` renders at `width: 100%` of its
//   wrapper (see `@blocknote/core`'s `Block.css`), so the wrapper itself needs
//   `width: fit-content` to keep the image at its natural size instead of stretching
//   to fill the whole block.
// - The extra `.bn-visual-media-wrapper` div is what carries `max-width: 100%` (same
//   stylesheet), capping images that are naturally wider than the editor instead of
//   overflowing it. Skipping it (as an earlier version of this override did) only
//   showed up with images wider than the small test assets used to verify the fix.
export function ImageBlockContent(
  props: Omit<ReactCustomBlockRenderProps<typeof createImageBlockConfig>, 'contentRef'>,
): ReactElement {
  const showLoader = useUploadLoading(props.block.id)
  const showsPreview = Boolean(props.block.props.url) && !showLoader && props.block.props.showPreview

  return (
    <FileBlockWrapper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      buttonIcon={<RiImage2Fill size={24} />}
      style={showsPreview ? { width: 'fit-content' } : undefined}
    >
      <div className="bn-visual-media-wrapper" style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ImagePreview {...(props as any)} />
      </div>
    </FileBlockWrapper>
  )
}
