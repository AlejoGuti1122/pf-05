// services/productServiceClean.ts
import { authService } from "@/features/login/services/login-service"
import { CreateProductClean, CreateProductResponseClean } from "../types/productClean"

class ProductServiceClean {
  private baseURL = "http://localhost:3001"

  // Headers con autenticación
  private getHeaders(): HeadersInit {
    const token = authService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // ✅ CREAR PRODUCTO - EXACTAMENTE COMO EL SWAGGER
  async createProduct(data: CreateProductClean): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Creating product")
    console.log("🔍 Payload enviado:", JSON.stringify(data, null, 2))
    
    const response = await fetch(`${this.baseURL}/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data) // ✅ ENVÍO DIRECTO SIN MODIFICACIONES
    })

    console.log("🔍 Response status:", response.status)
    console.log("🔍 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response:", errorData)
      
      if (response.status === 401) {
        throw new Error("No estás autenticado")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos")
      }
      
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const result = await response.json()
    console.log("✅ Service Clean - Success:", result)
    return result
  }
}

export const productServiceClean = new ProductServiceClean()