// hooks/useAuth.ts - VERSIÓN SIMPLIFICADA
import { useState, useCallback, useEffect } from "react"
import { User, LoginRequest, AuthResponse } from "../types/login"
import { RegisterRequest } from "../../register/types/register"
import { authService } from "../services/login-service"

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (userData: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  clearError: () => void
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ INICIALIZACIÓN SIMPLIFICADA
  useEffect(() => {
    const initializeAuth = () => {
      console.log("🔄 useAuth - Inicializando...")

      try {
        const savedUser = authService.getUser()
        const isAuth = authService.isAuthenticated()

        console.log("🔍 useAuth - savedUser:", savedUser)
        console.log("🔍 useAuth - isAuthenticated:", isAuth)

        if (savedUser && isAuth) {
          setUser(savedUser)
          console.log("✅ useAuth - Usuario configurado:", {
            email: savedUser.email,
            isAdmin: savedUser.isAdmin,
            isSuperAdmin: savedUser.isSuperAdmin,
          })
        } else {
          setUser(null)
          console.log("❌ useAuth - No hay usuario válido")
        }
      } catch (err) {
        console.error("❌ useAuth - Error en inicialización:", err)
        setUser(null)
        setError("Error al inicializar autenticación")
      } finally {
        setLoading(false)
        console.log("✅ useAuth - Inicialización completada")
      }
    }

    initializeAuth()
  }, [])

  // ✅ LOGIN
  const login = useCallback(
    async (credentials: LoginRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)

      try {
        console.log("🔄 useAuth - Iniciando login...")
        const response: AuthResponse = await authService.login(credentials)

        console.log("🎯 useAuth - Login exitoso")
        console.log("🎯 useAuth - Usuario recibido:", response.user)

        // Actualizar estado
        setUser(response.user)

        return response
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al iniciar sesión"
        console.error("❌ useAuth - Error en login:", errorMessage)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ✅ REGISTER
  const register = useCallback(
    async (userData: RegisterRequest): Promise<AuthResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response: AuthResponse = await authService.register(userData)
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

  // ✅ LOGOUT
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      console.log("🔄 useAuth - Iniciando logout...")
      await authService.logout()
      setUser(null)
      setError(null)
      console.log("✅ useAuth - Logout completado")
      window.location.href = "/"
    } catch (error) {
      console.error("❌ useAuth - Error en logout:", error)
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

  // ✅ CALCULAR ESTADOS
  const isAuthenticated = !!user && authService.isAuthenticated()
  const isAdmin = user?.isAdmin === true || user?.isSuperAdmin === true

  // ✅ DEBUG LOG CUANDO CAMBIE EL ESTADO
  useEffect(() => {
    if (!loading) {
      console.log("🎯 useAuth - Estado actual:", {
        hasUser: !!user,
        userEmail: user?.email,
        userIsAdmin: user?.isAdmin,
        userIsSuperAdmin: user?.isSuperAdmin,
        calculatedIsAuthenticated: isAuthenticated,
        calculatedIsAdmin: isAdmin,
        loading,
      })
    }
  }, [user, isAuthenticated, isAdmin, loading])

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
