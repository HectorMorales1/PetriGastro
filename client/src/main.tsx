import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  console.error('React render error:', err)
  const pre = document.createElement('pre')
  pre.style.cssText = 'color: red; padding: 20px;'
  pre.textContent = `Error: ${err.message}`
  document.body.appendChild(pre)
}
