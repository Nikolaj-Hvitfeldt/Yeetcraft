import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

/**
 * Frontend entry point.
 * 
 * Architecture notes:
 * - Plain React (no framework wrappers)
 * - API-driven data fetching (no SSR)
 * - TypeScript for type safety
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
