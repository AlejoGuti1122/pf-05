/* eslint-disable @typescript-eslint/no-explicit-any */
// services/cartService.ts

import {
  CartResponse,
  AddItemToCartRequest,
  CartItemResponse,
  UpdateItemQuantityRequest,
  MergeCartRequest,
} from "../types/cart"

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

class CartService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {

    
    // Obtener token del localStorage (ajusta según tu implementación)
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken")

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Agregar token si existe
      ...options.headers,
    }
    

    const fullUrl = `${API_BASE_URL}${url}`
    console.log("🔗 Calling API:", fullUrl) // Debug
    console.log("🔗 Using API Base:", API_BASE_URL) // Debug API URL
    console.log("🔑 Using token:", !!token) // Debug (sin mostrar el token completo)

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: "include", // Para cookies si las usas
      })

      console.log("📡 Response status:", response.status) // Debug
      console.log("📡 Response ok:", response.ok) // Debug

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Error de conexión",
        }))
        console.error("❌ API Error:", error) // Debug

        // ✅ MEJORADO: Manejo específico de errores
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para acceder al carrito.")
        }
        if (response.status === 404) {
          throw new Error("Carrito o item no encontrado.")
        }

        throw new Error(error.message || "Error en la petición")
      }

      // ✅ NUEVO: Manejar respuestas DELETE correctamente
      if (options.method === "DELETE" && response.ok) {
        console.log("✅ DELETE exitoso - respuesta vacía esperada")
        return { success: true, message: "Deleted successfully" }
      }

      // ✅ NUEVO: Verificar si hay contenido antes de parsear JSON
      const contentLength = response.headers.get("content-length")
      const contentType = response.headers.get("content-type")

      // Si no hay contenido o no es JSON, no parsear
      if (contentLength === "0" || !contentType?.includes("application/json")) {
        console.log("✅ Respuesta sin contenido JSON")
        return response.ok ? { success: true } : null
      }

      // ✅ NUEVO: Verificar que hay texto antes de parsear
      const text = await response.text()
      console.log("📋 Response text:", `"${text}"`) // Debug

      if (!text || text.trim().length === 0) {
        console.log("✅ Respuesta vacía pero exitosa")
        return response.ok ? { success: true } : null
      }

      // Solo parsear si hay contenido real
      const data = JSON.parse(text)
      console.log("📦 API Response data:", data) // Debug
      return data
    } catch (error) {
      console.error("❌ Fetch error:", error) // Debug
      throw error
    }
  }

  // GET /cart - Obtener carrito vigente (actualizado endpoint)
  async getCurrentCart(): Promise<CartResponse> {
    const response = await this.fetchWithAuth("/cart")
    console.log("🛒 Respuesta del carrito:", response) // Debug
    return response
  }

  // GET /cart - Obtener carrito (alias de /cart/me)
  async getCart(): Promise<CartResponse> {
    return this.fetchWithAuth("/cart")
  }

  // POST /cart/items - Agregar item al carrito
  async addItem(data: AddItemToCartRequest): Promise<CartItemResponse> {
    console.log("➕ Agregando item:", data) // Debug
    const response = await this.fetchWithAuth("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    })
    console.log("✅ Respuesta agregar item:", response) // Debug
    return response
  }

  // PATCH /cart/items/{itemId} - Actualizar cantidad
  async updateItemQuantity(
    itemId: string,
    data: UpdateItemQuantityRequest
  ): Promise<CartItemResponse> {
    console.log("🔄 Actualizando cantidad:", { itemId, data }) // Debug
    return this.fetchWithAuth(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // DELETE /cart/items/{itemId} - Eliminar item
  async removeItem(itemId: string): Promise<{ success: boolean }> {
    console.log("🗑️ Eliminando item:", itemId) // Debug
    const response = await this.fetchWithAuth(`/cart/items/${itemId}`, {
      method: "DELETE",
    })
    console.log("✅ Item eliminado:", response) // Debug
    return response
  }

  // DELETE /cart - Vaciar carrito
  async clearCart(): Promise<{ success: boolean }> {
    console.log("🧹 Vaciando carrito...") // Debug
    const response = await this.fetchWithAuth("/cart", {
      method: "DELETE",
    })
    console.log("✅ Carrito vaciado:", response) // Debug
    return response
  }

  // POST /cart - Clear carrito (invitado)
  async clearGuestCart(): Promise<{ success: boolean }> {
    return this.fetchWithAuth("/cart", {
      method: "POST",
    })
  }

  // POST /cart/refresh - Revalidar carrito
  async refreshCart(): Promise<CartResponse> {
    return this.fetchWithAuth("/cart/refresh", {
      method: "POST",
    })
  }

  // POST /cart/merge - Fusionar carritos
  async mergeCarts(data: MergeCartRequest = {}): Promise<CartResponse> {
    return this.fetchWithAuth("/cart/merge", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // ✅ CORREGIDO: POST /cart/checkout - Validar y preparar payload para checkout
  async validateCartForCheckout(): Promise<{
    success: boolean
    valid: boolean
    errors?: string[]
    items?: any[]
    status?: string
    summary?: any
  }> {
    console.log("🔍 Validando carrito para checkout...") // Debug
    const response = await this.fetchWithAuth("/cart/checkout", {
      method: "POST",
    })
    console.log("✅ Respuesta validación checkout:", response) // Debug
    return response
  }

  // ✅ BONUS: Obtener resumen del carrito
  async getCartSummary(): Promise<{
    totalItems: number
    totalAmount: number
    currency: string
    hasItems: boolean
  }> {
    console.log("📊 Obteniendo resumen del carrito...") // Debug
    const response = await this.fetchWithAuth("/cart/summary")
    console.log("✅ Resumen del carrito:", response) // Debug
    return response
  }

  // ✅ BONUS: Aplicar cupón de descuento
  async applyCoupon(couponCode: string): Promise<CartResponse> {
    console.log("🎫 Aplicando cupón:", couponCode) // Debug
    const response = await this.fetchWithAuth("/cart/coupon", {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    })
    console.log("✅ Cupón aplicado:", response) // Debug
    return response
  }

  // ✅ BONUS: Remover cupón
  async removeCoupon(): Promise<CartResponse> {
    console.log("🗑️ Removiendo cupón...") // Debug
    const response = await this.fetchWithAuth("/cart/coupon", {
      method: "DELETE",
    })
    console.log("✅ Cupón removido:", response) // Debug
    return response
  }

  // ✅ BONUS: Verificar disponibilidad de stock
  async checkStockAvailability(): Promise<{
    available: boolean
    unavailableItems: Array<{
      itemId: string
      productId: string
      requestedQuantity: number
      availableStock: number
    }>
  }> {
    console.log("📦 Verificando disponibilidad de stock...") // Debug
    const response = await this.fetchWithAuth("/cart/stock-check")
    console.log("✅ Verificación de stock:", response) // Debug
    return response
  }
}

export const cartService = new CartService()
