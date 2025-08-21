import { GoogleAuthResponse } from "../types/login-google"

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

export class GoogleAuthService {
  /**
   * Verifica si hay un token válido guardado
   */
  getStoredToken(): string | null {
    return localStorage.getItem("auth_token")
  }

  /**
   * Inicia el flujo de autenticación con Google
   * Redirecciona a la página de Google OAuth
   */
  initiateGoogleAuth(): void {
    const url = `${API_BASE_URL}/auth/google`
    console.log("🔗 Iniciando Google Auth:", url)

    // Redirigir directamente al endpoint del backend
    window.location.href = url
  }

  /**
   * Maneja el callback después de la autenticación con Google
   * @param code - Código de autorización recibido de Google
   */
  async handleGoogleCallback(code: string): Promise<GoogleAuthResponse> {
    try {
      const url = `${API_BASE_URL}/auth/google/callback`
      console.log("🔗 Procesando Google callback:", url)
      console.log("🔑 Authorization code:", code ? "RECEIVED" : "MISSING")

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      console.log("📡 Callback response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Google callback error:", errorData)

        if (response.status === 400) {
          throw new Error("Código de autorización inválido o expirado.")
        }
        if (response.status === 401) {
          throw new Error("Error de autenticación con Google.")
        }
        if (response.status === 500) {
          throw new Error(
            "Error interno del servidor durante la autenticación."
          )
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data: GoogleAuthResponse = await response.json()
      console.log("✅ Google auth successful")

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        console.log("💾 Auth token guardado")

        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken)
          console.log("💾 Refresh token guardado")
        }
      }

      return data
    } catch (error) {
      console.error("❌ Error en Google callback:", error)
      throw error
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getUserProfile(): Promise<GoogleAuthResponse["user"]> {
    try {
      const token = this.getStoredToken()

      if (!token) {
        throw new Error("No hay token de autenticación")
      }

      const url = `${API_BASE_URL}/auth/profile`
      console.log("🔗 Obteniendo perfil de usuario:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Profile response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error obteniendo perfil:", errorData)

        if (response.status === 401) {
          // Token expirado, limpiar storage
          this.logout()
          throw new Error(
            "Sesión expirada. Por favor inicia sesión nuevamente."
          )
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para acceder al perfil.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const userData = await response.json()
      console.log("✅ Perfil de usuario obtenido")
      return userData
    } catch (error) {
      console.error("❌ Error obteniendo perfil:", error)
      throw error
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken()

      // Intentar llamar al endpoint de logout en el backend
      if (token) {
        const url = `${API_BASE_URL}/auth/logout`
        console.log("🔗 Cerrando sesión en backend:", url)

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            console.log("✅ Sesión cerrada en backend")
          } else {
            console.warn(
              "⚠️ Error cerrando sesión en backend:",
              response.status
            )
          }
        } catch (error) {
          console.warn("⚠️ Error de red cerrando sesión:", error)
        }
      }
    } finally {
      // Limpiar localStorage SIEMPRE
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      console.log("🧹 Tokens eliminados del localStorage")
    }
  }

  /**
   * Refresh del token de acceso
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem("refresh_token")

      if (!refreshToken) {
        throw new Error("No hay refresh token disponible")
      }

      const url = `${API_BASE_URL}/auth/refresh`
      console.log("🔗 Refrescando token:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      console.log("📡 Refresh response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error refrescando token:", errorData)

        if (response.status === 401 || response.status === 403) {
          // Refresh token inválido o expirado
          this.logout()
          throw new Error(
            "Sesión expirada. Por favor inicia sesión nuevamente."
          )
        }

        throw new Error(errorData.message || "Error al refrescar token")
      }

      const { token } = await response.json()
      localStorage.setItem("auth_token", token)
      console.log("✅ Token refrescado exitosamente")

      return token
    } catch (error) {
      console.error("❌ Error refreshing token:", error)
      throw error
    }
  }

  /**
   * ✅ BONUS: Verificar si el token actual es válido
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const token = this.getStoredToken()

      if (!token) {
        return false
      }

      const url = `${API_BASE_URL}/auth/verify`
      console.log("🔗 Verificando token:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const isValid = response.ok
      console.log("🔍 Token válido:", isValid)

      if (!isValid) {
        this.logout()
      }

      return isValid
    } catch (error) {
      console.error("❌ Error verificando token:", error)
      return false
    }
  }

  /**
   * ✅ BONUS: Obtener información del token (sin hacer request)
   */
  getTokenInfo(): { hasToken: boolean; hasRefreshToken: boolean } {
    const hasToken = !!this.getStoredToken()
    const hasRefreshToken = !!localStorage.getItem("refresh_token")

    return {
      hasToken,
      hasRefreshToken,
    }
  }
}

export const googleAuthService = new GoogleAuthService()
