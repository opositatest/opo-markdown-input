import { useRef, useState, type FormEvent, type ReactElement } from 'react'

import type { DraftToApiEditorElement } from '../draft-to-api-editor/draft-to-api-editor-element'
import {
  BODY_INITIAL_MARKDOWN,
  HOST_FORM_CHECKS,
  SUMMARY_INITIAL_MARKDOWN,
} from './app.constants'

type TSubmittedData = Record<string, FormDataEntryValue>

export function App(): ReactElement {
  const bodyRef = useRef<DraftToApiEditorElement | null>(null)
  const summaryRef = useRef<DraftToApiEditorElement | null>(null)
  const [submittedData, setSubmittedData] = useState<TSubmittedData>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setSubmittedData(Object.fromEntries(formData.entries()))
  }

  function handleBodyRef(element: DraftToApiEditorElement | null): void {
    bodyRef.current = element
  }

  function handleSummaryRef(element: DraftToApiEditorElement | null): void {
    summaryRef.current = element
  }

  function handleProgrammaticSummaryUpdate(): void {
    summaryRef.current?.setMarkdown('Resumen actualizado desde JavaScript')
    summaryRef.current?.focus()
  }

  function handleBodyFocus(): void {
    bodyRef.current?.focus()
  }

  return (
    <div className="test-page">
      <header className="test-header">
        <div>
          <p className="eyebrow">React 19 + Vite 8</p>
          <h1>Draft to API Editor</h1>
          <p className="lede">
            El host prueba submit, reset, multiples instancias y cambios programaticos del
            custom element.
          </p>
        </div>
      </header>

      <main className="test-layout">
        <form className="html-form simple-form" onSubmit={handleSubmit}>
          <section className="panel test-panel">
            <div className="panel-heading">
              <h2>Formulario host</h2>
              <p>
                Cada <code>{'<draft-to-api-editor>'}</code> sincroniza su valor Markdown con el
                formulario usando `ElementInternals` o un `input type="hidden"` de fallback.
              </p>
            </div>

            <label className="field-group">
              <span>Body</span>
              <draft-to-api-editor
                ref={handleBodyRef}
                name="body"
                value={BODY_INITIAL_MARKDOWN}
                placeholder="Escribe el body..."
              />
            </label>

            <label className="field-group">
              <span>Summary</span>
              <draft-to-api-editor
                ref={handleSummaryRef}
                name="summary"
                value={SUMMARY_INITIAL_MARKDOWN}
                placeholder="Escribe el resumen..."
              />
            </label>

            <div className="action-row">
              <button type="submit">Submit del formulario</button>
              <button type="reset" className="secondary-button">
                Reset del formulario
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleProgrammaticSummaryUpdate}
              >
                Cambio programatico
              </button>
              <button type="button" className="secondary-button" onClick={handleBodyFocus}>
                Focus body
              </button>
            </div>
          </section>
        </form>

        <aside className="sidebar">
          <section className="panel compact-panel">
            <h2>Resultado del submit</h2>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </section>

          <section className="panel compact-panel">
            <h2>Checks del plan</h2>
            <ul className="result-list">
              {HOST_FORM_CHECKS.map((item) => {
                return <li key={item}>{item}</li>
              })}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  )
}
