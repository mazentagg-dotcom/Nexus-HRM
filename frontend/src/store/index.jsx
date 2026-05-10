import { createContext, useState, useContext, useCallback, useEffect } from 'react'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('nexus_sidebar_collapsed') === 'true'
  })

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('nexus_theme', theme)
  }, [theme])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      localStorage.setItem('nexus_sidebar_collapsed', String(!prev))
      return !prev
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return (
    <StoreContext.Provider value={{ sidebarCollapsed, toggleSidebar, theme, toggleTheme }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
