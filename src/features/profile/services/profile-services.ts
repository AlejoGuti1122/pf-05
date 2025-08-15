/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  UpdateProfileRequest,
  UserProfile,
  UserStats,
} from "../types/profile-types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class UserService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token")

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      console.log(`🔗 [USER SERVICE] ${options.method || "GET"} ${endpoint}`)

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      console.log(`📡 [USER SERVICE] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
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

  // Obtener perfil del usuario actual
  async getCurrentUserProfile(): Promise<UserProfile> {
    console.log("👤 [USER SERVICE] Obteniendo perfil del usuario actual")

    // Obtener el ID del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    if (!userData.id) {
      throw new Error("No se encontró ID de usuario")
    }

    const response = await this.makeRequest<any>(`/users/${userData.id}`)

    // El backend puede devolver directamente el usuario o envuelto
    if (response.data) {
      return response.data
    }
    return response
  }

  // Actualizar perfil del usuario
  async updateUserProfile(
    updateData: UpdateProfileRequest
  ): Promise<UserProfile> {
    console.log("✏️ [USER SERVICE] Actualizando perfil:", updateData)

    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    if (!userData.id) {
      throw new Error("No se encontró ID de usuario")
    }

    const response = await this.makeRequest<any>(`/users/${userData.id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })

    // Actualizar localStorage con los nuevos datos
    const updatedUser = response.data || response
    localStorage.setItem("user", JSON.stringify(updatedUser))

    return updatedUser
  }

  // Obtener estadísticas del usuario (simuladas por ahora)
  async getUserStats(): Promise<UserStats> {
    // TODO: Cuando tengas endpoints para esto, reemplazar
    return {
      orderCount: 24,
      favoriteCount: 18,
      points: 2450,
    }
  }
}

export const userService = new UserService()
