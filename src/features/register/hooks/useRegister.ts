// hooks/useRegister.ts
import { useState, useCallback } from "react"

interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string  
  phone: number
  country: string
  address: string
  city: string
  // age: number  ← QUITAR - Backend no lo acepta
}

interface RegisterResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: number
    country: string
    address: string
    city: string
    // age: number   ← QUITAR de respuesta también
    isAdmin: boolean
    isSuperAdmin: boolean
  }
}

interface UseRegisterReturn {
  register: (userData: RegisterRequest) => Promise<RegisterResponse>
  loading: boolean
  error: string | null
  success: boolean
  clearStatus: () => void
}

const useRegister = (): UseRegisterReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = useCallback(
    async (userData: RegisterRequest): Promise<RegisterResponse> => {
      console.log("🔧 Hook userData:", JSON.stringify(userData, null, 2))

      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        // ✅ URL correcta según Swagger
        const response = await fetch(
          "http://localhost:3001/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        )

        if (!response.ok) {
          // Si falla, mostrar info útil para debugging
          console.error(`❌ Error ${response.status}: ${response.statusText}`)
          
          // Intentar obtener mensaje de error del servidor
          const errorData = await response.json().catch(() => ({
            message: `Error ${response.status}: ${response.statusText}`
          }))
          
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result: RegisterResponse = await response.json()
        setSuccess(true)

        // Guardar token en localStorage
        localStorage.setItem("auth_token", result.token)
        localStorage.setItem("user_data", JSON.stringify(result.user))

        console.log("✅ Register exitoso:", result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al registrar usuario"
        console.error("❌ Register error:", errorMessage)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearStatus = useCallback(() => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }, [])

  return {
    register,
    loading,
    error,
    success,
    clearStatus,
  }
}

export default useRegister