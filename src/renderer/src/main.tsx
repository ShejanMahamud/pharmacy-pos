import './assets/app.css'

import { createRoot } from 'react-dom/client'
import App from './App'

// Add error boundary
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Application Error</h1>
      <p>${event.error?.message || 'Unknown error'}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${event.error?.stack || ''}</pre>
    </div>
  `
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason)
})

console.log('Starting application initialization...')
console.log('window.api available:', !!window.api)
console.log('window.electron available:', !!window.electron)

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
  throw new Error('Failed to find root element')
}

// Wait for window.api to be available before rendering
const initApp = () => {
  if (!window.api) {
    console.error('window.api is not available! Preload script failed.')
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Initialization Error</h1>
        <p>The application API is not available. This usually means the preload script failed to load.</p>
        <p>Please restart the application. If the problem persists, reinstall the application.</p>
      </div>
    `
    return
  }

  console.log('Rendering React app...')
  try {
    createRoot(rootElement).render(<App />)
    console.log('React app rendered successfully')
  } catch (error) {
    console.error('Failed to render app:', error)
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Render Error</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `
  }
}

// Initialize app immediately if API is ready, otherwise wait
if (window.api) {
  initApp()
} else {
  console.log('Waiting for window.api...')
  // Give it a few attempts
  let attempts = 0
  const checkInterval = setInterval(() => {
    attempts++
    console.log(`Checking for window.api (attempt ${attempts})...`)
    if (window.api) {
      console.log('window.api is now available!')
      clearInterval(checkInterval)
      initApp()
    } else if (attempts >= 10) {
      clearInterval(checkInterval)
      console.error('Timeout waiting for window.api')
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: red;">Initialization Timeout</h1>
          <p>The application failed to initialize within 5 seconds.</p>
          <p>Please restart the application.</p>
        </div>
      `
    }
  }, 500)
}
