import {
  CreatePaymentPreferenceRequest,
  CreatePaymentPreferenceResponse,
  PaymentFailureRequest,
  PaymentSuccessRequest,
  PaymentResponse,
} from "../types/payments"

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken")

  // ✅ AGREGADO: Log para verificar el token
  console.log("🔑 Token encontrado:", !!token)
  console.log("🔗 Using API:", API_BASE_URL) // Debug API URL
  if (token) {
    console.log("🔑 Token (primeros 20 chars):", token.substring(0, 20) + "...")
  }

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const paymentsService = {
  // ✅ CORREGIDO: Cambiar orderId por cartId
  createPaymentPreference: async (
    cartId: string,
    additionalData?: Partial<CreatePaymentPreferenceRequest>
  ): Promise<CreatePaymentPreferenceResponse> => {
    try {
      console.log("🚀 [PAYMENT] Iniciando creación de preferencia de pago")
      console.log("🛒 [PAYMENT] CartID:", cartId)

      const endpoint = `${API_BASE_URL}/payments/checkout/${cartId}`
      console.log("🔗 [PAYMENT] Endpoint:", endpoint)

      // ✅ CORREGIDO: Solo mandar additionalData, no cartId en el body
      const requestData = {
        ...additionalData, // Solo datos adicionales, no el cartId
      }

      console.log("📦 [PAYMENT] Request data:", requestData)

      // Obtener headers con logs
      const headers = getAuthHeaders()
      console.log("🔑 [PAYMENT] Headers preparados:", {
        ...headers,
        Authorization: headers.Authorization
          ? headers.Authorization.substring(0, 30) + "..."
          : "No auth",
      })

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      console.log("📡 [PAYMENT] Response status:", response.status)
      console.log("📡 [PAYMENT] Response ok:", response.ok)

      // ✅ MEJORADO: Leer respuesta completa para debugging
      let responseData
      try {
        const responseText = await response.text()
        console.log("📄 [PAYMENT] Response raw text:", responseText)

        responseData = responseText ? JSON.parse(responseText) : {}
        console.log("📄 [PAYMENT] Response parsed:", responseData)
      } catch (parseError) {
        console.error("❌ [PAYMENT] Error parsing response:", parseError)
        responseData = { error: "Invalid JSON response" }
      }

      if (!response.ok) {
        console.error("❌ [PAYMENT] HTTP Error Details:")
        console.error("   Status:", response.status)
        console.error("   Status Text:", response.statusText)
        console.error("   Response Data:", responseData)

        // ✅ MEJORADO: Manejo específico de errores
        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para crear pagos.")
        }
        if (response.status === 404) {
          throw new Error("Carrito no encontrado.")
        }

        const errorMessage =
          responseData.message ||
          responseData.error ||
          `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      console.log("✅ [PAYMENT] Preferencia creada exitosamente!")
      console.log("✅ [PAYMENT] Respuesta final:", responseData)

      // ✅ VALIDACIÓN: Verificar campos esperados (con ambas variantes)
      if (!responseData.initPoint && !responseData.init_point) {
        console.warn(
          "⚠️ [PAYMENT] Advertencia: No se encontró 'initPoint' ni 'init_point' en la respuesta"
        )
      }
      if (!responseData.preferenceId && !responseData.preference_id) {
        console.warn(
          "⚠️ [PAYMENT] Advertencia: No se encontró 'preferenceId' ni 'preference_id' en la respuesta"
        )
      }

      // ✅ NUEVO: Agregar campo 'ok' si no existe (basado en status 201)
      if (!responseData.ok) {
        responseData.ok = true // Status 201 = éxito
      }

      return responseData
    } catch (error: unknown) {
      console.error("💥 [PAYMENT] Error completo:", error)

      if (error instanceof Error) {
        console.error("💥 [PAYMENT] Error message:", error.message)
        console.error("💥 [PAYMENT] Error stack:", error.stack)
      } else {
        console.error("💥 [PAYMENT] Error desconocido:", String(error))
      }

      throw error
    }
  },

  // Confirmar pago exitoso (webhook/callback)
  confirmPaymentSuccess: async (
    paymentData: PaymentSuccessRequest
  ): Promise<PaymentResponse> => {
    try {
      const url = `${API_BASE_URL}/payments/success`
      console.log("🔗 Confirming payment success:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error confirming payment success:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment success confirmed:", result)
      return result
    } catch (error) {
      console.error("❌ Error confirming payment success:", error)
      throw error
    }
  },

  // Confirmar pago fallido (webhook/callback)
  confirmPaymentFailure: async (
    paymentData: PaymentFailureRequest
  ): Promise<PaymentResponse> => {
    try {
      const url = `${API_BASE_URL}/payments/failure`
      console.log("🔗 Confirming payment failure:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error confirming payment failure:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment failure confirmed:", result)
      return result
    } catch (error) {
      console.error("❌ Error confirming payment failure:", error)
      throw error
    }
  },

  // Crear pago pendiente (el endpoint original)
  createPendingPayment: async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const url = `${API_BASE_URL}/payments/pending`
      console.log("🔗 Creating pending payment:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: "",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error creating pending payment:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Pending payment created:", result)
      return result
    } catch (error) {
      console.error("❌ Error creating pending payment:", error)
      throw error
    }
  },

  // ✅ BONUS: Verificar estado de pago
  checkPaymentStatus: async (paymentId: string): Promise<PaymentResponse> => {
    try {
      const url = `${API_BASE_URL}/payments/status/${paymentId}`
      console.log("🔗 Checking payment status:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error checking payment status:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 404) {
          throw new Error("Pago no encontrado.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment status retrieved:", result)
      return result
    } catch (error) {
      console.error("❌ Error checking payment status:", error)
      throw error
    }
  },

  // ✅ BONUS: Obtener historial de pagos
  getPaymentHistory: async (userId: string): Promise<PaymentResponse[]> => {
    try {
      const url = `${API_BASE_URL}/payments/history/${userId}`
      console.log("🔗 Getting payment history:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error getting payment history:", errorData)

        if (response.status === 401) {
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos para ver este historial.")
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      console.log("✅ Payment history retrieved:", result.length || 0)
      return result
    } catch (error) {
      console.error("❌ Error getting payment history:", error)
      throw error
    }
  },
}
