import { Order, OrdersResponse } from "../types/checkout"

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

export const ordersService = {
  // Obtener órdenes por ID de usuario
  getOrdersByUserId: async (userId: string): Promise<OrdersResponse> => {
    try {
      const url = `${API_BASE_URL}/orders/${userId}`
      console.log("🔗 Obteniendo órdenes del usuario:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ✅ AGREGAR TOKEN DE AUTENTICACIÓN
          ...(typeof window !== "undefined" &&
            localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
        },
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        console.error("❌ Error en getOrdersByUserId:", response.status)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Órdenes obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Error fetching orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const url = `${API_BASE_URL}/orders/single/${orderId}`
      console.log("🔗 Obteniendo orden específica:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ✅ AGREGAR TOKEN DE AUTENTICACIÓN
          ...(typeof window !== "undefined" &&
            localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
        },
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        console.error("❌ Error en getOrderById:", response.status)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Orden obtenida:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error fetching order:", error)
      throw error
    }
  },

  // ✅ BONUS: Crear una nueva orden
  createOrder: async (orderData: {
    userId: string
    products: Array<{
      productId: string
      quantity: number
      price: number
    }>
    totalAmount: number
    shippingAddress?: string
  }): Promise<Order> => {
    try {
      const url = `${API_BASE_URL}/orders`
      console.log("🔗 Creando orden:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" &&
            localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error creating order:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Orden creada exitosamente:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error creating order:", error)
      throw error
    }
  },

  // ✅ BONUS: Actualizar estado de orden
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<Order> => {
    try {
      const url = `${API_BASE_URL}/orders/${orderId}/status`
      console.log("🔗 Actualizando estado de orden:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" &&
            localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error updating order status:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para actualizar órdenes.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Estado de orden actualizado:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error updating order status:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener todas las órdenes (para admin)
  getAllOrders: async (): Promise<OrdersResponse> => {
    try {
      const url = `${API_BASE_URL}/orders`
      console.log("🔗 Obteniendo todas las órdenes:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" &&
            localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting all orders:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver todas las órdenes.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Todas las órdenes obtenidas:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Error getting all orders:", error)
      throw error
    }
  },
}
