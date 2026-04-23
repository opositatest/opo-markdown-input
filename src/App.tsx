import { useRef, useState, type FormEvent } from 'react'
import type { DraftToApiEditorElement } from './register-web-component'
import './App.css'

function App() {
  const bodyRef = useRef<DraftToApiEditorElement | null>(null)
  const summaryRef = useRef<DraftToApiEditorElement | null>(null)
  const [submittedData, setSubmittedData] = useState<Record<string, FormDataEntryValue>>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setSubmittedData(Object.fromEntries(formData.entries()))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">React 19 + Vite 8</p>
          <h1>Draft to API Editor</h1>
          <p className="lede">
            El root ahora actua como host real del web component y prueba submit, reset,
            multiples instancias y cambios programaticos.
          </p>
        </div>
      </header>

      <main className="app-main">
        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="panel">
            <div className="panel-heading">
              <h2>Formulario host</h2>
              <p>
                Cada <code>{'<draft-to-api-editor>'}</code> sincroniza su propio valor Markdown
                mediante un <code>input type="hidden"</code> independiente.
              </p>
            </div>

            <label className="field-group">
              <span>Body</span>
              <draft-to-api-editor
                ref={(element) => {
                  bodyRef.current = element
                }}
                name="body"
                value={"Texto inicial del body\n\n$$\nx^2 + y^2 = z^2\n$$"}
                placeholder="Escribe el body..."
              />
            </label>

            <label className="field-group">
              <span>Summary</span>
              <draft-to-api-editor
                ref={(element) => {
                  summaryRef.current = element
                }}
                name="summary"
                value="Resumen inicial"
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
                onClick={() => {
                  summaryRef.current?.setMarkdown('Resumen actualizado desde JavaScript')
                  summaryRef.current?.focus()
                }}
              >
                Cambio programatico
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  bodyRef.current?.focus()
                }}
              >
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
            <ul>
              <li>Etiqueta publica `draft-to-api-editor`</li>
              <li>Multiples instancias sin estado compartido</li>
              <li>Sincronizacion automatica a Markdown</li>
              <li>Submit y reset de formulario</li>
              <li>API JS con `focus`, `getMarkdown` y `setMarkdown`</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
