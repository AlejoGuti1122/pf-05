/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts - VERSIÓN CORREGIDA

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/features/register/types/register"

class AuthService {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"
  }

  // ✅ FUNCIÓN PARA DECODIFICAR JWT
  private decodeJWT(token: string): any | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        console.error("❌ Token JWT inválido")
        return null
      }

      const payload = parts[1]
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
    console.log("📤 DATOS QUE ESTOY ENVIANDO:", credentials) // <- NUEVO
    console.log("📤 URL COMPLETA:", `${this.baseURL}/auth/signin`) // <- NUEVO

    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    console.log("📥 STATUS RESPONSE:", response.status) // <- NUEVO

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("❌ ERROR DATA:", errorData) // <- NUEVO
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("🔍 RESPUESTA COMPLETA DEL BACKEND:", data)

    // ✅ BUSCAR TOKEN EN EL ORDEN CORRECTO (access_Token es el que viene de tu API)
    const token =
      data.access_Token || data.accessToken || data.token || data.access_token
    console.log("🔍 TOKEN EXTRAÍDO:", token ? "TOKEN_FOUND" : "NO_TOKEN")

    let user = data.user || null
    console.log("🔍 USER DESDE RESPONSE:", user)

    // ✅ SI NO VIENE USER, LO DECODIFICAMOS DEL TOKEN
    if (!user && token) {
      user = this.decodeJWT(token)
      console.log("🔍 USER DECODIFICADO DEL JWT:", user)
    }

    // ✅ VALIDAR QUE TENEMOS LOS DATOS NECESARIOS
    if (!token) {
      console.error("❌ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA")
      throw new Error("No se recibió token de autenticación")
    }

    if (!user) {
      console.error("❌ NO SE ENCONTRÓ USER EN LA RESPUESTA")
      throw new Error("No se recibieron datos del usuario")
    }

    // ✅ GUARDAR TOKEN Y USER
    this.saveToken(token)
    this.saveUser(user)

    console.log("✅ Token y usuario guardados correctamente")
    console.log("🎯 Usuario final:", {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })

    // ✅ RETORNAR EN EL FORMATO QUE ESPERA TU HOOK
    const result: AuthResponse = {
      token,
      user,
    }

    return result
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log("📤 REGISTRANDO CON:", userData) // <- NUEVO
    console.log("📤 URL REGISTER:", `${this.baseURL}/auth/register`) // <- NUEVO

    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    console.log("📥 REGISTER STATUS:", response.status) // <- NUEVO

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("❌ REGISTER ERROR:", errorData) // <- NUEVO
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ REGISTER RESPONSE:", data) // <- NUEVO

    // ✅ APLICAR LA MISMA LÓGICA QUE EN LOGIN
    const token =
      data.access_Token || data.accessToken || data.token || data.access_token
    let user = data.user || null

    if (!user && token) {
      user = this.decodeJWT(token)
    }

    if (token) this.saveToken(token)
    if (user) this.saveUser(user)

    return { token, user }
  }

  // ✅ FUNCIÓN LOGOUT
  async logout(): Promise<void> {
    const token = this.getToken()

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
      }
    }

    // ✅ Limpiar datos locales SIEMPRE
    this.removeToken()
    this.removeUser()
    console.log("🧹 Datos locales limpiados")
  }

  // ✅ MÉTODO MEJORADO PARA VERIFICAR AUTENTICACIÓN
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()

    console.log("🔍 isAuthenticated check:", {
      hasToken: !!token,
      hasUser: !!user,
      userIsAdmin: user?.isAdmin,
    })

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
        this.removeToken()
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

  // ✅ MÉTODOS DE STORAGE
  saveToken(token: string): void {
    try {
      localStorage.setItem("token", token)
      console.log("✅ Token guardado en localStorage")
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
      console.log("✅ Usuario guardado en localStorage:", {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      })
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  getUser(): any | null {
    try {
      const userData = localStorage.getItem("user")

      if (!userData || userData === "undefined" || userData === "null") {
        console.log("❌ No hay datos de usuario en localStorage")
        return null
      }

      const user = JSON.parse(userData)
      console.log("✅ Usuario recuperado de localStorage:", {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      })

      return user
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

  // ✅ MÉTODO AUXILIAR PARA VERIFICAR SI ES ADMIN
  isAdmin(): boolean {
    try {
      const user = this.getUser()
      const isAdminResult =
        user?.isAdmin === true || user?.isSuperAdmin === true
      console.log("🔍 isAdmin check:", {
        user: user,
        isAdmin: user?.isAdmin,
        isSuperAdmin: user?.isSuperAdmin,
        result: isAdminResult,
      })
      return isAdminResult
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }
}

export const authService = new AuthService()
