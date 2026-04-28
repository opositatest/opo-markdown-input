import './index.css'
import './markdown-text-editor/register-markdown-text-editor'

const form = getElement<HTMLFormElement>('editor-test-form')
const formPayload = getElement<HTMLElement>('form-payload')

function handleFormSubmit(event: SubmitEvent): void {
  event.preventDefault()

  const payload = Object.fromEntries(new FormData(form).entries())
  formPayload.textContent = JSON.stringify(payload, null, 2)
}

form.addEventListener('submit', handleFormSubmit)

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing element #${id}`)
  }

  return element as T
}
