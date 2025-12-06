import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/custom-bootstrap.css'
import './styles/academic-department.css'
import './styles/scrollable-table.css'
import './styles/onlyoffice-editor.css'
import './styles/forms-responsive.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
