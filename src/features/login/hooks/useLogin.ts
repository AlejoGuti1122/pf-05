// hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react'
import { User, LoginRequest, AuthResponse } from '../types/login'
import { RegisterRequest } from '../../register/types/register'
import { authService } from '../services/login-service'


interface UseAuthReturn {
  // Estados
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  error: string | null
  
  // Acciones
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializar usuario desde localStorage
  useEffect(() => {
    const savedUser = authService.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response: AuthResponse = await authService.login(credentials)
      
      // Guardar token y usuario
      authService.saveToken(response.token)
      authService.saveUser(response.user)
      
      // Actualizar estado
      setUser(response.user)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: RegisterRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response: AuthResponse = await authService.register(userData)
      
      // Guardar token y usuario
      authService.saveToken(response.token)
      authService.saveUser(response.user)
      
      // Actualizar estado
      setUser(response.user)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Estados derivados
  const isAuthenticated = !!user
  const isAdmin = user?.isAdmin || user?.isSuperAdmin || false

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}

export default useAuth