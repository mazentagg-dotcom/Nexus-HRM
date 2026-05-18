import { Component } from 'react'
import { I18nContext } from '../i18n'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const isDev = import.meta.env?.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export default class ErrorBoundary extends Component {
  static contextType = I18nContext
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Page crash:', error?.message || error)
    console.error('[ErrorBoundary] Stack:', error?.stack)
    console.error('[ErrorBoundary] Component stack:', info?.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const t = this.context?.t || (key => key)
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Unknown error'

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('somethingWentWrong')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
            {t('pageEncounteredError')}
          </p>
          {isDev && (
            <pre className="mt-2 max-w-lg rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-400 overflow-auto max-h-32 text-left">
              {errorMsg}
            </pre>
          )}
          <div className="flex gap-3 mt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t('tryAgain')}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('goHome')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
