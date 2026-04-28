import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import './index.css'
import './draft-to-api-editor/register-draft-to-api-editor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
