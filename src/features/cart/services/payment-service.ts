import {
  CreatePaymentPreferenceRequest,
  CreatePaymentPreferenceResponse,
  PaymentFailureRequest,
  PaymentSuccessRequest,
  PaymentResponse,
} from "../types/payments"

const API_BASE_URL = "http://localhost:3001"

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken")

  // ✅ AGREGADO: Log para verificar el token
  console.log("🔑 Token encontrado:", !!token)
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
      console.log(
        "🔗 Confirming payment success:",
        `${API_BASE_URL}/payments/success`
      )

      const response = await fetch(`${API_BASE_URL}/payments/success`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error confirming payment success:", error)
      throw error
    }
  },

  // Confirmar pago fallido (webhook/callback)
  confirmPaymentFailure: async (
    paymentData: PaymentFailureRequest
  ): Promise<PaymentResponse> => {
    try {
      console.log(
        "🔗 Confirming payment failure:",
        `${API_BASE_URL}/payments/failure`
      )

      const response = await fetch(`${API_BASE_URL}/payments/failure`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error confirming payment failure:", error)
      throw error
    }
  },

  // Crear pago pendiente (el endpoint original)
  createPendingPayment: async (): Promise<{ ok: boolean; message: string }> => {
    try {
      console.log(
        "🔗 Creating pending payment:",
        `${API_BASE_URL}/payments/pending`
      )

      const response = await fetch(`${API_BASE_URL}/payments/pending`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: "",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error creating pending payment:", error)
      throw error
    }
  },
}
