import { createContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nexus_token')
    if (!token) {
      setLoading(false)
      return
    }
    validateToken()
  }, [])

  const validateToken = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data.user)
      setPermissions(data.data.permissions || [])
      setRoles((data.data.roles || []).map(r => r.slug))
      setIsAuthenticated(true)
    } catch {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_user')
      localStorage.removeItem('nexus_permissions')
      localStorage.removeItem('nexus_roles')
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('nexus_token', data.data.token)
    localStorage.setItem('nexus_user', JSON.stringify(data.data.user))
    localStorage.setItem('nexus_permissions', JSON.stringify(data.data.permissions || []))
    localStorage.setItem('nexus_roles', JSON.stringify((data.data.roles || []).map(r => r.slug)))
    setUser(data.data.user)
    setPermissions(data.data.permissions || [])
    setRoles((data.data.roles || []).map(r => r.slug))
    setIsAuthenticated(true)
    return data.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_permissions')
    localStorage.removeItem('nexus_roles')
    setUser(null)
    setPermissions([])
    setRoles([])
    setIsAuthenticated(false)
  }, [])

  const hasPermission = useCallback((perm) => {
    if (roles.includes('super_admin') || roles.includes('admin')) return true
    if (!permissions.length) return false
    if (permissions.includes(perm)) return true
    const parts = perm.split('.')
    if (parts.length === 2) {
      const prefix = parts[0] + '.'
      if (permissions.some(p => p.startsWith(prefix))) return true
      if (permissions.includes(parts[0])) return true
    }
    if (permissions.includes('admin') || permissions.includes('*')) return true
    return false
  }, [permissions, roles])

  const hasAnyPermission = useCallback((perms) => {
    return perms.some(p => hasPermission(p))
  }, [hasPermission])

  const hasRole = useCallback((role) => {
    return roles.includes(role)
  }, [roles])

  const isAdmin = hasRole('super_admin') || hasRole('admin')

  return (
    <AuthContext.Provider value={{
      user, permissions, roles, isAuthenticated, loading,
      login, logout, hasPermission, hasAnyPermission, hasRole, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
