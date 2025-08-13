import { GoogleAuthResponse } from "../types/login-google"

const API_BASE_URL = "http://localhost:3001"

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
    // Redirigir directamente al endpoint del backend
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  /**
   * Maneja el callback después de la autenticación con Google
   * @param code - Código de autorización recibido de Google
   */
  async handleGoogleCallback(code: string): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: GoogleAuthResponse = await response.json()

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken)
        }
      }

      return data
    } catch (error) {
      console.error("Error en Google callback:", error)
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

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const userData = await response.json()
      return userData
    } catch (error) {
      console.error("Error obteniendo perfil:", error)
      throw error
    }
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    // Opcional: llamar endpoint de logout en el backend
    // fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
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

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error("Error al refrescar token")
      }

      const { token } = await response.json()
      localStorage.setItem("auth_token", token)

      return token
    } catch (error) {
      console.error("Error refreshing token:", error)
      throw error
    }
  }
}

export const googleAuthService = new GoogleAuthService()
