/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orders-service.ts

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken")

  console.log("🔑 Token encontrado:", !!token) // Debug
  console.log(
    "🔑 Token (primeros 20 chars):",
    token ? token.substring(0, 20) + "..." : "No token"
  ) // Debug
  console.log("🔗 Using API:", API_BASE_URL) // Debug

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const ordersService = {
  // Obtener órdenes por ID de usuario - ENDPOINT /orders/{id}
  getOrdersByUserId: async (userId: string) => {
    try {
      const url = `${API_BASE_URL}/orders/${userId}`
      console.log("🔗 Calling orders API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Orders response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting user orders:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver estas órdenes.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const orders = await response.json()
      console.log("✅ User orders retrieved:", orders.length || 0)
      return orders
    } catch (error) {
      console.error("❌ Error fetching user orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string) => {
    try {
      const url = `${API_BASE_URL}/orders/single/${orderId}`
      console.log("🔗 Calling single order API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(), // ✅ AGREGADO: Headers de autenticación
        credentials: "include",
      })

      console.log("📡 Single order response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting single order:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver esta orden.")
        }
        if (response.status === 404) {
          throw new Error("Orden no encontrada.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const order = await response.json()
      console.log("✅ Single order retrieved:", order.id)
      return order
    } catch (error) {
      console.error("❌ Error fetching order:", error)
      throw error
    }
  },

  // Crear nueva orden (corregido con autenticación)
  createOrder: async (orderData: any) => {
    try {
      const url = `${API_BASE_URL}/orders`
      console.log("🔗 Calling create order API:", url)
      console.log("📦 Order data:", orderData)

      const headers = getAuthHeaders()
      console.log("🔑 Headers being sent:", headers) // Debug

      const response = await fetch(url, {
        method: "POST",
        headers: headers, // ✅ CORREGIDO: Usar headers de autenticación
        credentials: "include", // ✅ AGREGADO: Credenciales
        body: JSON.stringify(orderData),
      })

      console.log("📡 Create order response status:", response.status)

      if (!response.ok) {
        // ✅ MEJORADO: Obtener detalles del error
        let errorDetails
        try {
          errorDetails = await response.json()
        } catch {
          errorDetails = { message: "Error de conexión" }
        }

        console.error("❌ Create order error details:", errorDetails)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para crear órdenes.")
        }
        if (response.status === 400) {
          throw new Error(errorDetails.message || "Datos de orden inválidos.")
        }

        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorDetails.message || "Unknown error"
          }`
        )
      }

      const result = await response.json()
      console.log("✅ Order created successfully:", result.id)
      return result
    } catch (error) {
      console.error("❌ Error creating order:", error)
      throw error
    }
  },

  // ✅ BONUS: Cancelar orden
  cancelOrder: async (orderId: string) => {
    try {
      const url = `${API_BASE_URL}/orders/${orderId}/cancel`
      console.log("🔗 Calling cancel order API:", url)

      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error canceling order:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para cancelar esta orden.")
        }
        if (response.status === 404) {
          throw new Error("Orden no encontrada.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Order canceled successfully:", result.id)
      return result
    } catch (error) {
      console.error("❌ Error canceling order:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener historial de órdenes con paginación
  getOrdersHistory: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      const url = `${API_BASE_URL}/orders/${userId}/history?${params.toString()}`
      console.log("🔗 Calling orders history API:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting orders history:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Orders history retrieved:", result.orders?.length || 0)
      return result
    } catch (error) {
      console.error("❌ Error fetching orders history:", error)
      throw error
    }
  },
}
