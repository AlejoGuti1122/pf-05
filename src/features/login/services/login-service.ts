/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts

import { AuthResponse, LoginRequest, RegisterRequest } from "@/features/register/types/register"

class AuthService {
  private baseURL: string

  constructor() {
    this.baseURL = "http://localhost:3001" // ✅ CORREGIR URL
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    return response.json()
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

  // Métodos para manejar tokens
  saveToken(token: string): void {
    try {
      localStorage.setItem("auth_token", token)
    } catch (error) {
      console.error("Error saving token:", error)
    }
  }

  getToken(): string | null {
    try {
      const token = localStorage.getItem("auth_token")
      
      // ✅ VALIDACIÓN SEGURA
      if (!token || token === 'undefined' || token === 'null') {
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
      localStorage.removeItem("auth_token")
    } catch (error) {
      console.error("Error removing token:", error)
    }
  }

  saveUser(user: any): void {
    try {
      localStorage.setItem("user_data", JSON.stringify(user))
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  getUser(): any | null {
    try {
      const userData = localStorage.getItem("user_data")
      
      // ✅ VALIDACIÓN SEGURA - AQUÍ ESTABA EL PROBLEMA
      if (!userData || userData === 'undefined' || userData === 'null') {
        return null
      }
      
      return JSON.parse(userData)
    } catch (error) {
      console.error("Error parsing user data:", error)
      // ✅ Limpiar localStorage corrupto
      this.removeUser()
      this.removeToken()
      return null
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem("user_data")
    } catch (error) {
      console.error("Error removing user:", error)
    }
  }

  logout(): void {
    this.removeToken()
    this.removeUser()
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser()
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