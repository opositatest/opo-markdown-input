import type * as React from "react";
import type { DraftToApiEditorElement } from "./register-web-component";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "draft-to-api-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<DraftToApiEditorElement>,
        DraftToApiEditorElement
      > & {
        name?: string;
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        readonly?: boolean;
        required?: boolean;
      };
    }
  }
}

export {};
