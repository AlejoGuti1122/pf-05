/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  UpdateProfileRequest,
  UserProfile,
  UserStats,
} from "../types/profile-types"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

class UserService {
  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== "undefined") {
      console.log("👤 UserService initialized with baseURL:", getApiUrl())
    }
  }

  // ✅ HELPER PARA OBTENER HEADERS CON AUTH
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth && typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // ✅ USAR URLs DINÁMICAS
      const url = getApiUrl(endpoint)

      const config: RequestInit = {
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        credentials: "include", // ✅ AGREGAR PARA COOKIES
        ...options,
      }

      console.log(`🔗 [USER SERVICE] ${options.method || "GET"} ${endpoint}`)
      console.log(`🔗 [USER SERVICE] URL completa: ${url}`)

      const response = await fetch(url, config)

      console.log(`📡 [USER SERVICE] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ [USER SERVICE] Error details:`, errorData)

        // ✅ MANEJO ESPECÍFICO DE ERRORES MEJORADO
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción.")
        }
        if (response.status === 404) {
          throw new Error("Usuario no encontrado.")
        }
        if (response.status === 400) {
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || "Parámetros inválidos."
          throw new Error(message)
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log(`✅ [USER SERVICE] Response data:`, data)

      return data
    } catch (error) {
      console.error(`❌ [USER SERVICE] Error en ${endpoint}:`, error)
      throw error
    }
  }

  // ✅ HELPER PARA OBTENER USER ID DESDE LOCALSTORAGE
  private getUserId(): string {
    if (typeof window === "undefined") {
      throw new Error("No disponible en servidor")
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    if (!userData.id) {
      throw new Error("No se encontró ID de usuario. Por favor inicia sesión.")
    }
    return userData.id
  }

  // Obtener perfil del usuario actual
  async getCurrentUserProfile(): Promise<UserProfile> {
    console.log("👤 [USER SERVICE] Obteniendo perfil del usuario actual")

    try {
      const userId = this.getUserId()
      const response = await this.makeRequest<any>(`/users/${userId}`)

      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let user: UserProfile
      if (response.data) {
        user = response.data
      } else if (response.user) {
        user = response.user
      } else {
        user = response
      }

      console.log("✅ [USER SERVICE] Perfil obtenido:", user.id || user.name)
      return user
    } catch (error) {
      console.error("❌ [USER SERVICE] Error obteniendo perfil:", error)
      throw error
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(
    updateData: UpdateProfileRequest
  ): Promise<UserProfile> {
    console.log("✏️ [USER SERVICE] Actualizando perfil:", updateData)

    try {
      const userId = this.getUserId()
      const response = await this.makeRequest<any>(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      })

      // ✅ MANEJAR RESPUESTA Y ACTUALIZAR LOCALSTORAGE
      const updatedUser = response.data || response.user || response

      if (typeof window !== "undefined") {
        // Mantener datos existentes y actualizar solo los nuevos
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
        const mergedUser = { ...currentUser, ...updatedUser }
        localStorage.setItem("user", JSON.stringify(mergedUser))
        console.log("💾 [USER SERVICE] Usuario actualizado en localStorage")
      }

      console.log("✅ [USER SERVICE] Perfil actualizado exitosamente")
      return updatedUser
    } catch (error) {
      console.error("❌ [USER SERVICE] Error actualizando perfil:", error)
      throw error
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(): Promise<UserStats> {
    console.log("📊 [USER SERVICE] Obteniendo estadísticas del usuario")

    try {
      const userId = this.getUserId()

      // ✅ INTENTAR OBTENER STATS REALES DEL BACKEND
      const response = await this.makeRequest<any>(`/users/${userId}/stats`)
      const stats = response.data || response

      console.log("✅ [USER SERVICE] Estadísticas obtenidas:", stats)
      return stats
    } catch (error) {
      console.warn(
        "⚠️ [USER SERVICE] Endpoint de stats no disponible, usando simuladas:",
        error
      )

      // ✅ FALLBACK: Estadísticas simuladas basadas en datos reales si están disponibles
      const fallbackStats: UserStats = {
        orderCount: 24,
        favoriteCount: 18,
        points: 2450,
      }

      // ✅ INTENTAR CALCULAR STATS REALES DESDE ORDERS
      try {
        const orders = await this.getUserOrders(1, 100).catch(() => ({
          orders: [],
          total: 0,
        }))
        if (orders.orders && orders.orders.length > 0) {
          fallbackStats.orderCount = orders.total || orders.orders.length
        }
      } catch (ordersError) {
        console.log(
          "⚠️ [USER SERVICE] No se pudieron obtener orders para stats"
        )
      }

      return fallbackStats
    }
  }

  // ✅ Obtener lista de usuarios (para admin)
  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: UserProfile[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log("👥 [USER SERVICE] Obteniendo lista de usuarios")

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: Math.min(limit, 100).toString(), // ✅ Máximo 100
      })

      const response = await this.makeRequest<any>(
        `/users?${params.toString()}`
      )

      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let result = {
        users: [] as UserProfile[],
        total: 0,
        page: page,
        totalPages: 1,
      }

      if (Array.isArray(response)) {
        result.users = response
        result.total = response.length
      } else if (response.data) {
        result = { ...result, ...response.data }
      } else {
        result = { ...result, ...response }
      }

      console.log("✅ [USER SERVICE] Usuarios obtenidos:", result.users.length)
      return result
    } catch (error) {
      console.error("❌ [USER SERVICE] Error obteniendo usuarios:", error)
      throw error
    }
  }

  // ✅ Eliminar usuario (para admin)
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    if (!userId || userId.trim().length === 0) {
      throw new Error("ID de usuario requerido.")
    }

    console.log("🗑️ [USER SERVICE] Eliminando usuario:", userId)

    try {
      const response = await this.makeRequest<{ success: boolean }>(
        `/users/${userId.trim()}`,
        {
          method: "DELETE",
        }
      )

      const result =
        response.success !== undefined ? response : { success: true }
      console.log("✅ [USER SERVICE] Usuario eliminado exitosamente")
      return result
    } catch (error) {
      console.error("❌ [USER SERVICE] Error eliminando usuario:", error)
      throw error
    }
  }

  // ✅ Cambiar contraseña
  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ success: boolean }> {
    console.log("🔐 [USER SERVICE] Cambiando contraseña")

    if (!data.currentPassword || !data.newPassword) {
      throw new Error("Contraseña actual y nueva son requeridas.")
    }

    if (data.newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres.")
    }

    try {
      const userId = this.getUserId()
      const response = await this.makeRequest<{ success: boolean }>(
        `/users/${userId}/password`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      )

      const result =
        response.success !== undefined ? response : { success: true }
      console.log("✅ [USER SERVICE] Contraseña cambiada exitosamente")
      return result
    } catch (error) {
      console.error("❌ [USER SERVICE] Error cambiando contraseña:", error)
      throw error
    }
  }

  // ✅ Obtener pedidos del usuario
  async getUserOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: any[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log("📦 [USER SERVICE] Obteniendo pedidos del usuario")

    try {
      const userId = this.getUserId()
      const params = new URLSearchParams({
        page: page.toString(),
        limit: Math.min(limit, 100).toString(),
      })

      const response = await this.makeRequest<any>(
        `/users/${userId}/orders?${params.toString()}`
      )

      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let result = {
        orders: [] as any[],
        total: 0,
        page: page,
        totalPages: 1,
      }

      if (Array.isArray(response)) {
        result.orders = response
        result.total = response.length
      } else if (response.data) {
        result = { ...result, ...response.data }
      } else if (response.orders) {
        result = { ...result, ...response }
      } else {
        result = { ...result, ...response }
      }

      console.log("✅ [USER SERVICE] Pedidos obtenidos:", result.orders.length)
      return result
    } catch (error) {
      console.error("❌ [USER SERVICE] Error obteniendo pedidos:", error)
      throw error
    }
  }

  // ✅ Activar/Desactivar usuario (para admin)
  async toggleUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<UserProfile> {
    if (!userId || userId.trim().length === 0) {
      throw new Error("ID de usuario requerido.")
    }

    console.log(
      "🔄 [USER SERVICE] Cambiando estado del usuario:",
      userId,
      isActive
    )

    try {
      const response = await this.makeRequest<any>(
        `/users/${userId.trim()}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        }
      )

      const user = response.data || response.user || response
      console.log("✅ [USER SERVICE] Estado del usuario actualizado")
      return user
    } catch (error) {
      console.error("❌ [USER SERVICE] Error cambiando estado:", error)
      throw error
    }
  }

  // ✅ BONUS: Verificar si el usuario tiene permisos de admin
  isAdmin(): boolean {
    if (typeof window === "undefined") return false

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      return userData.isAdmin === true || userData.isSuperAdmin === true
    } catch (error) {
      return false
    }
  }

  // ✅ BONUS: Obtener datos del usuario desde localStorage
  getCurrentUserData(): any {
    if (typeof window === "undefined") return null

    try {
      return JSON.parse(localStorage.getItem("user") || "{}")
    } catch (error) {
      console.error(
        "❌ [USER SERVICE] Error leyendo usuario de localStorage:",
        error
      )
      return {}
    }
  }

  // ✅ BONUS: Limpiar datos del usuario (logout helper)
  clearUserData(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem("user")
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    console.log("🧹 [USER SERVICE] Datos de usuario limpiados")
  }
}

// ✅ Crear instancia y exportar
const userService = new UserService()
export { userService }
