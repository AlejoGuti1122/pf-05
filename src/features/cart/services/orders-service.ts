/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orders-service.ts
const API_BASE_URL = "http://localhost:3001"

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken")

  console.log("🔑 Token encontrado:", !!token) // Debug
  console.log(
    "🔑 Token (primeros 20 chars):",
    token ? token.substring(0, 20) + "..." : "No token"
  ) // Debug

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const ordersService = {
  // Obtener órdenes por ID de usuario - ENDPOINT /orders/{id}
  getOrdersByUserId: async (userId: string) => {
    try {
      console.log("🔗 Calling orders API:", `${API_BASE_URL}/orders/${userId}`)

      const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      console.log("📡 Orders response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const orders = await response.json()
      return orders
    } catch (error) {
      console.error("Error fetching user orders:", error)
      throw error
    }
  },

  // Obtener una orden específica
  getOrderById: async (orderId: string) => {
    try {
      console.log(
        "🔗 Calling single order API:",
        `${API_BASE_URL}/orders/single/${orderId}`
      )

      const response = await fetch(`${API_BASE_URL}/orders/single/${orderId}`, {
        method: "GET",
        headers: getAuthHeaders(), // ✅ AGREGADO: Headers de autenticación
        credentials: "include",
      })

      console.log("📡 Single order response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const order = await response.json()
      return order
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  },

  // Crear nueva orden (corregido con autenticación)
  createOrder: async (orderData: any) => {
    try {
      console.log("🔗 Calling create order API:", `${API_BASE_URL}/orders`)
      console.log("📦 Order data:", orderData)

      const headers = getAuthHeaders()
      console.log("🔑 Headers being sent:", headers) // Debug

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(), // ✅ CORREGIDO: Usar headers de autenticación
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
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorDetails.message || "Unknown error"
          }`
        )
      }

      const result = await response.json()
      console.log("✅ Order created successfully:", result)
      return result
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },
}
