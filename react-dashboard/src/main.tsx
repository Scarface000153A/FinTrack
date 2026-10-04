import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Dashboard } from './components/ui/dashboard-4'

const rootElement = document.getElementById('react-dashboard-root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>,
  )
}