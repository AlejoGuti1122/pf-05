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
  
  // Acciones - ✅ CAMBIAR TIPADO PARA QUE RETORNE AuthResponse
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (userData: RegisterRequest) => Promise<AuthResponse>
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

  // ✅ FUNCIÓN LOGIN CORREGIDA - AHORA RETORNA EL RESULTADO
  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response: AuthResponse = await authService.login(credentials)
      
      // Actualizar estado local del hook
      setUser(response.user)
      
      console.log("🎯 Hook useAuth - Login exitoso:", response)
      
      // ✅ RETORNAR LA RESPUESTA PARA QUE EL COMPONENTE LA USE
      return response
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ FUNCIÓN REGISTER CORREGIDA - TAMBIÉN RETORNA EL RESULTADO
  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)

    try {
      const response: AuthResponse = await authService.register(userData)
      
      // Actualizar estado local del hook
      setUser(response.user)
      
      // ✅ RETORNAR LA RESPUESTA
      return response
      
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

  // ✅ MEJORAR isAuthenticated PARA QUE USE EL authService
  const isAuthenticated = authService.isAuthenticated()
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