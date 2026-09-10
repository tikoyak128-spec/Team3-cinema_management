import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { PrefsProvider } from './context/PrefsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PrefsProvider>
        <App />
      </PrefsProvider>
    </ThemeProvider>
  </StrictMode>,
)
