// hooks/useAuth.ts
import { useState, useCallback, useEffect } from "react"
import { User, LoginRequest, AuthResponse } from "../types/login"
import { RegisterRequest } from "../../register/types/register"
import { authService } from "../services/login-service"

interface UseAuthReturn {
  // Estados
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  error: string | null

  // Acciones
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (userData: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void> // ✅ CAMBIAR A ASYNC
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

  // ✅ FUNCIÓN LOGIN
  const login = useCallback(
    async (credentials: LoginRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response: AuthResponse = await authService.login(credentials)

        // Actualizar estado local del hook
        setUser(response.user)

        console.log("🎯 Hook useAuth - Login exitoso:", response)

        return response
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al iniciar sesión"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ✅ FUNCIÓN REGISTER
  const register = useCallback(
    async (userData: RegisterRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response: AuthResponse = await authService.register(userData)

        // Actualizar estado local del hook
        setUser(response.user)

        return response
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al registrar usuario"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ✅ FUNCIÓN LOGOUT ACTUALIZADA - ASYNC CON REDIRECCIÓN
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      console.log("🔄 Iniciando logout...")

      // ✅ Llamar al service async
      await authService.logout()

      // ✅ Limpiar estado del hook
      setUser(null)
      setError(null)

      console.log("✅ Logout completado")

      // ✅ Redirigir al login
      window.location.href = "/"
    } catch (error) {
      console.error("❌ Error durante logout:", error)

      // ✅ Aún así limpiar estado local si hay error
      setUser(null)
      setError(null)
      window.location.href = "/"
    } finally {
      setLoading(false)
    }
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
