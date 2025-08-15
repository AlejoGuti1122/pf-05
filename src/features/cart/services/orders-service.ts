/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orderService.ts

import { CreateOrderRequest, GetOrderResponse, Order } from "../types/orders"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class OrderService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Obtener token de autenticación (ajusta según tu método de auth)
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

      console.log(`🔗 [ORDER SERVICE] ${options.method || "GET"} ${endpoint}`)

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      console.log(`📡 [ORDER SERVICE] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      console.log(`✅ [ORDER SERVICE] Response data:`, data)

      return data
    } catch (error) {
      console.error(`❌ [ORDER SERVICE] Error en ${endpoint}:`, error)
      throw error
    }
  }

  // Crear nueva orden
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    console.log("🛒 [ORDER SERVICE] Creando orden:", orderData)

    const response = await this.makeRequest<any>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })

    console.log("📡 [ORDER SERVICE] Respuesta completa:", response)

    // ✅ NUEVO: El backend devuelve directamente la orden, no envuelto en {success, data}
    if (!response || !response.id) {
      throw new Error("Error al crear la orden - respuesta inválida")
    }

    // ✅ NUEVO: Retornar la respuesta directamente (ya es la orden)
    return response
  }

  // Obtener orden por ID
  async getOrder(orderId: string): Promise<Order> {
    console.log("🔍 [ORDER SERVICE] Obteniendo orden:", orderId)

    const response = await this.makeRequest<GetOrderResponse>(
      `/orders/${orderId}`
    )

    if (!response.success || !response.data) {
      throw new Error(response.message || "Error al obtener la orden")
    }

    return response.data
  }

  // Obtener todas las órdenes del usuario
  async getUserOrders(): Promise<Order[]> {
    console.log("📋 [ORDER SERVICE] Obteniendo órdenes del usuario")

    const response = await this.makeRequest<{
      success: boolean
      data: Order[]
    }>("/orders")

    if (!response.success || !response.data) {
      throw new Error("Error al obtener las órdenes")
    }

    return response.data
  }

  // Cancelar orden
  async cancelOrder(orderId: string): Promise<void> {
    console.log("❌ [ORDER SERVICE] Cancelando orden:", orderId)

    await this.makeRequest(`/orders/${orderId}/cancel`, {
      method: "PATCH",
    })
  }

  // Actualizar estado de orden (para admin)
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    console.log("🔄 [ORDER SERVICE] Actualizando estado:", { orderId, status })

    const response = await this.makeRequest<GetOrderResponse>(
      `/orders/${orderId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    )

    if (!response.success || !response.data) {
      throw new Error(response.message || "Error al actualizar el estado")
    }

    return response.data
  }
}

// Exportar instancia singleton
export const orderService = new OrderService()
