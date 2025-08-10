/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts - VERSIÓN ACTUALIZADA CON LOGOUT

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/features/register/types/register"

class AuthService {
  private baseURL: string

  constructor() {
    this.baseURL = "http://localhost:3001"
  }

  // ✅ NUEVA FUNCIÓN PARA DECODIFICAR JWT
  private decodeJWT(token: string): any | null {
    try {
      // Un JWT tiene 3 partes separadas por puntos
      const parts = token.split(".")
      if (parts.length !== 3) {
        console.error("❌ Token JWT inválido")
        return null
      }

      // Decodificar la segunda parte (payload)
      const payload = parts[1]
      // Añadir padding si es necesario
      const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4)
      const decoded = atob(paddedPayload)
      const user = JSON.parse(decoded)

      console.log("✅ Usuario decodificado del JWT:", user)
      return user
    } catch (error) {
      console.error("❌ Error decodificando JWT:", error)
      return null
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("🔍 RESPUESTA COMPLETA DEL BACKEND:", data)
    console.log("🔍 CLAVES DISPONIBLES:", Object.keys(data))

    // ✅ PROBAR DIFERENTES NOMBRES DE TOKEN
    const token =
      data.access_Token || data.accessToken || data.token || data.access_token
    console.log("🔍 TOKEN EXTRAÍDO:", token)

    let user = data.user || null

    // ✅ SI NO VIENE USER, LO DECODIFICAMOS DEL TOKEN
    if (!user && token) {
      user = this.decodeJWT(token)
      console.log("🔍 USER DECODIFICADO DEL JWT:", user)
    }

    // Guardamos el token inmediatamente si existe
    if (token) {
      this.saveToken(token)
      console.log("✅ Token guardado en localStorage")
    } else {
      console.error("❌ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA")
      console.log("Estructura de data:", JSON.stringify(data, null, 2))
    }

    // Guardamos el usuario si existe
    if (user) {
      this.saveUser(user)
      console.log("✅ Usuario guardado en localStorage")
    }

    const result = { token, user }
    console.log("🎯 RESULTADO FINAL DEL LOGIN:", result)
    return result
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    return response.json()
  }

  // ✅ NUEVA FUNCIÓN LOGOUT CON LLAMADA AL BACKEND
  async logout(): Promise<void> {
    const token = this.getToken()

    // ✅ Intentar cerrar sesión en el backend si hay token
    if (token) {
      try {
        console.log("🔄 Cerrando sesión en el backend...")

        const response = await fetch(`${this.baseURL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          console.log("✅ Sesión cerrada correctamente en el backend")
        } else {
          console.warn("⚠️ Error cerrando sesión en backend:", response.status)
        }
      } catch (error) {
        console.error("❌ Error en logout del servidor:", error)
        // Continuar con logout local aunque falle el servidor
      }
    }

    // ✅ Limpiar datos locales SIEMPRE (aunque falle el backend)
    this.removeToken()
    this.removeUser()
    console.log("🧹 Datos locales limpiados")
  }

  // ✅ MÉTODO MEJORADO PARA VERIFICAR SI ESTÁ AUTENTICADO
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()

    if (!token || !user) {
      console.log("❌ No hay token o usuario")
      return false
    }

    // Verificar que el token no haya expirado
    try {
      const decodedToken = this.decodeJWT(token)
      if (!decodedToken) {
        console.log("❌ No se pudo decodificar el token")
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000)
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log("❌ Token expirado")
        this.removeToken() // ✅ Solo limpiar localmente si está expirado
        this.removeUser()
        return false
      }

      console.log("✅ Usuario autenticado correctamente")
      return true
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error)
      return false
    }
  }

  // Métodos para manejar tokens (sin cambios)
  saveToken(token: string): void {
    try {
      localStorage.setItem("token", token)
    } catch (error) {
      console.error("Error saving token:", error)
    }
  }

  getToken(): string | null {
    try {
      const token = localStorage.getItem("token")

      if (!token || token === "undefined" || token === "null") {
        return null
      }

      return token
    } catch (error) {
      console.error("Error getting token:", error)
      return null
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem("token")
    } catch (error) {
      console.error("Error removing token:", error)
    }
  }

  saveUser(user: any): void {
    try {
      localStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  getUser(): any | null {
    try {
      const userData = localStorage.getItem("user")

      if (!userData || userData === "undefined" || userData === "null") {
        return null
      }

      return JSON.parse(userData)
    } catch (error) {
      console.error("Error parsing user data:", error)
      this.removeUser()
      this.removeToken()
      return null
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error removing user:", error)
    }
  }

  isAdmin(): boolean {
    try {
      const user = this.getUser()
      return user?.isAdmin || user?.isSuperAdmin || false
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }
}

export const authService = new AuthService()
