/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts - VERSIÓN CON URLs DINÁMICAS PARA NEXT.JS

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/features/register/types/register"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class AuthService {
  private baseURL: string

  constructor() {
    // ✅ CORREGIDO: Usar configuración dinámica en lugar de hardcoded
    this.baseURL = getApiUrl() // Esto dará la URL correcta según el entorno

    // ✅ SOLO LOG EN CLIENTE (Next.js best practice)
    if (typeof window !== "undefined") {
      console.log("🌐 AuthService initialized with baseURL:", this.baseURL)
      console.log("🔧 Environment:", process.env.NODE_ENV)
    }
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

  // ✅ MÉTODO HELPER PARA FETCH CON MEJOR MANEJO DE ERRORES
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    // ✅ USAR getApiUrl PARA CADA REQUEST (URLs dinámicas)
    const fullUrl = getApiUrl(endpoint)

    if (typeof window !== "undefined") {
      console.log("📤 Making request to:", fullUrl)
      console.log("📤 Request options:", options)
    }

    try {
      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // Para cookies si las usas
        ...options,
      })

      if (typeof window !== "undefined") {
        console.log("📥 Response status:", response.status)
        console.log("📥 Response ok:", response.ok)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (typeof window !== "undefined") {
          console.log("❌ Error response:", errorData)
        }

        // Manejar errores específicos
        if (response.status === 401) {
          throw new Error("Credenciales inválidas")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde")
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()

      if (typeof window !== "undefined") {
        console.log("✅ Response data:", data)
      }

      return data
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error("❌ Request failed:", error)
      }
      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("📤 DATOS QUE ESTOY ENVIANDO:", credentials)
    console.log("📤 URL COMPLETA:", getApiUrl("/auth/signin")) // ← URLs dinámicas

    const data = await this.makeRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

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
    console.log("📤 REGISTRANDO CON:", userData)
    console.log("📤 URL REGISTER:", getApiUrl("/auth/register")) // ← URLs dinámicas

    const data = await this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    console.log("✅ REGISTER RESPONSE:", data)

    // ✅ APLICAR LA MISMA LÓGICA QUE EN LOGIN
    const token =
      data.access_Token || data.accessToken || data.token || data.access_token
    let user = data.user || null

    if (!user && token) {
      user = this.decodeJWT(token)
    }

    if (!token) {
      throw new Error("No se recibió token de autenticación")
    }

    if (!user) {
      throw new Error("No se recibieron datos del usuario")
    }

    this.saveToken(token)
    this.saveUser(user)

    return { token, user }
  }

  // ✅ FUNCIÓN LOGOUT CON URLs DINÁMICAS
  async logout(): Promise<void> {
    const token = this.getToken()

    if (token) {
      try {
        console.log("🔄 Cerrando sesión en el backend...")

        await this.makeRequest("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("✅ Sesión cerrada correctamente en el backend")
      } catch (error) {
        console.warn("⚠️ Error cerrando sesión en backend:", error)
        // No lanzar error aquí, seguir con la limpieza local
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

  // ✅ MÉTODOS DE STORAGE (mejorados)
  saveToken(token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
        console.log("✅ Token guardado en localStorage")
      }
    } catch (error) {
      console.error("Error saving token:", error)
    }
  }

  getToken(): string | null {
    try {
      if (typeof window === "undefined") return null

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("authToken") // Limpiar también authToken si existe
      }
    } catch (error) {
      console.error("Error removing token:", error)
    }
  }

  saveUser(user: any): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user))
        console.log("✅ Usuario guardado en localStorage:", {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        })
      }
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  getUser(): any | null {
    try {
      if (typeof window === "undefined") return null

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
      }
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
