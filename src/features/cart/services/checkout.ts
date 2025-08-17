import { Order, OrdersResponse } from "../types/checkout"

const API_BASE_URL = "http://localhost:3001"

export const ordersService = {
  // Obtener órdenes por ID de usuario
  getOrdersByUserId: async (userId: string): Promise<OrdersResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Agrega aquí headers de autenticación si los necesitas
          // 'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/single/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  },
}
