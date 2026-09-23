import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { PrefsProvider } from './context/PrefsContext'
import axios from "axios";

// Automatically route all default axios calls to the live Render backend
axios.defaults.baseURL = "https://team3-cinema-management.onrender.com";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PrefsProvider>
        <App />
      </PrefsProvider>
    </ThemeProvider>
  </StrictMode>,
)
