// hooks/useRegister.ts - Versión sin auto-login
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
      console.log("🔧 Hook userData keys:", Object.keys(userData))
      console.log("🔧 Hook userData:", JSON.stringify(userData, null, 2))

      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
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
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`
          )
        }

        const result: RegisterResponse = await response.json()
        setSuccess(true)

        // ❌ NO GUARDAR TOKEN AUTOMÁTICAMENTE
        // localStorage.setItem("token", result.token)
        // localStorage.setItem("user", JSON.stringify(result.user))

        console.log("✅ Registro exitoso, pero sin auto-login")
        return result
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