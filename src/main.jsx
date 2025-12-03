import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import env config FIRST to initialize and show warnings early
import './config/env.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/custom-bootstrap.css'
import './styles/academic-department.css'
import './styles/scrollable-table.css'
import './styles/onlyoffice-editor.css'
import './styles/forms-responsive.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

// Note: env.js already exposes window.__ENV_STATUS__ for debugging
// This is just for raw import.meta.env values
if (typeof window !== 'undefined') {
  window.__ENV__ = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_BASE_PATH: import.meta.env.VITE_BASE_PATH,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
