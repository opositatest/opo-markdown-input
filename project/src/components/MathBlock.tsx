import { createReactBlockSpec } from "@blocknote/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { addStyles, EditableMathField, StaticMathField } from "react-mathquill";
import katex from "katex";
import "katex/dist/katex.min.css";

// Initialize MathQuill styles
addStyles();

type MathBlockRenderProps = {
  block: {
    props: {
      latex: string;
    };
  };
  editor: {
    isEditable: boolean;
    updateBlock: (block: unknown, update: { props: { latex: string } }) => void;
  };
};

function MathBlockRender({ block, editor }: MathBlockRenderProps) {
  const [isEditing, setIsEditing] = useState(!block.props.latex);
  const [value, setValue] = useState(block.props.latex);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing && previewRef.current && block.props.latex) {
      try {
        katex.render(block.props.latex, previewRef.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        });
      } catch {
        previewRef.current.textContent = "Invalid LaTeX";
      }
    }
  }, [isEditing, block.props.latex]);

  const save = useCallback(() => {
    editor.updateBlock(block, {
      props: { latex: value },
    });
    if (value.trim()) setIsEditing(false);
  }, [editor, block, value]);

  if (isEditing) {
    return (
      <div className="math-block-editor" style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "4px 10px",
          background: "hsl(var(--muted))",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "hsl(var(--muted-foreground))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span>MathQuill · Fórmula matemática</span>
          <button
            onClick={save}
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              border: "none",
              borderRadius: "4px",
              padding: "2px 10px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Listo
          </button>
        </div>
        <div
          style={{
            padding: "12px",
            background: "hsl(var(--background))",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") {
              save();
            }
          }}
        >
          <EditableMathField
            latex={value}
            onChange={(mathField) => {
              setValue(mathField.latex());
            }}
            config={{
              spaceBehavesLikeTab: true,
              leftRightIntoCmdGoes: "up",
              restrictMismatchedBrackets: true,
              sumStartsWithNEquals: true,
              supSubsRequireOperand: true,
              autoCommands: "pi theta sqrt sum int prod alpha beta gamma delta epsilon zeta eta iota kappa lambda mu nu xi rho sigma tau upsilon phi chi psi omega infty forall exists partial nabla",
              autoOperatorNames: "sin cos tan sec csc cot log ln exp lim min max gcd lcm mod det dim ker arg deg",
            }}
            style={{
              minWidth: "200px",
              fontSize: "18px",
              border: "none",
              padding: "8px 12px",
            }}
          />
        </div>
        {value.trim() && (
          <div style={{
            padding: "8px 12px",
            borderTop: "1px solid hsl(var(--border))",
            background: "hsl(var(--muted))",
            fontSize: "11px",
            fontFamily: "monospace",
            color: "hsl(var(--muted-foreground))",
            overflow: "auto",
          }}>
            <code>{value}</code>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      onClick={() => {
        if (!editor.isEditable) {
          return;
        }

        setIsEditing(true);
      }}
      className="math-block-preview"
      style={{
        padding: "16px",
        textAlign: "center",
        cursor: editor.isEditable ? "pointer" : "default",
        borderRadius: "var(--radius)",
        transition: "background 0.15s",
        minHeight: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        if (!editor.isEditable) {
          return;
        }

        e.currentTarget.style.background = "hsl(var(--muted))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    />
  );
}

export const MathBlock = createReactBlockSpec(
  {
    type: "math",
    propSchema: {
      latex: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => <MathBlockRender {...props} />,
  }
);
