import './index.css'
import './register-web-component'

const form = getElement<HTMLFormElement>('editor-test-form')
const formPayload = getElement<HTMLElement>('form-payload')

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const payload = Object.fromEntries(new FormData(form).entries())
  formPayload.textContent = JSON.stringify(payload, null, 2)
})

function getElement<T extends HTMLElement>(id: string) {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing element #${id}`)
  }

  return element as T
}
