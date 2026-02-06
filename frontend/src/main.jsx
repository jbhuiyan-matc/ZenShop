import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import App from './App.jsx'
import './index.css'

/**
 * Application Entry Point
 * 
 * Mounts the React application to the DOM.
 * Wraps the App component with:
 * - React.StrictMode: For highlighting potential problems in the application.
 * - BrowserRouter: To enable client-side routing via react-router-dom.
 * - AppProvider: Global state management via React Context.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
