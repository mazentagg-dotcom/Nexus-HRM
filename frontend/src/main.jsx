import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { StoreProvider } from './store'
import { I18nProvider } from './i18n'
import { ToastProvider } from './components/feedback/Toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <I18nProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </I18nProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>,
)
