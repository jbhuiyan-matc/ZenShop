import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

/**
 * Application Entry Point
 * 
 * Mounts the React application to the DOM.
 * Wraps the App component with:
 * - React.StrictMode: For highlighting potential problems in the application.
 * - BrowserRouter: To enable client-side routing via react-router-dom.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
