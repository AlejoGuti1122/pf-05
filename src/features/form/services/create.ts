// services/productServiceClean.ts
import { authService } from "@/features/login/services/login-service"
import { CreateProductResponseClean } from "../types/productClean"

class ProductServiceClean {
  private baseURL = "http://localhost:3001"

  // ✅ HEADERS PARA FORMDATA (SIN Content-Type)
  private getHeadersForFormData(): HeadersInit {
    const token = authService.getToken()
    return {
      // ✅ NO INCLUIR Content-Type para FormData - el browser lo hace automáticamente
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // ✅ CREAR PRODUCTO CON FORMDATA
  async createProduct(formData: FormData): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Creating product with FormData")

    // ✅ DEBUG: Ver contenido del FormData
    console.log("🔍 FormData contents:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        )
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    const response = await fetch(`${this.baseURL}/products`, {
      method: "POST",
      headers: this.getHeadersForFormData(), // ✅ Headers especiales para FormData
      body: formData, // ✅ FormData directamente, no JSON.stringify
    })

    console.log("🔍 Response status:", response.status)
    console.log(
      "🔍 Response headers:",
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response completo:", errorData)

      // ✅ MOSTRAR EL ARRAY DE ERRORES ESPECÍFICOS
      if (errorData.message && Array.isArray(errorData.message)) {
        console.error("❌ Errores específicos:", errorData.message)
        errorData.message.forEach((msg: string, index: number) => {
          console.error(`   ${index + 1}. ${msg}`)
        })
      }

      if (response.status === 401) {
        throw new Error("No estás autenticado")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos")
      }

      // ✅ MEJORAR EL MENSAJE DE ERROR
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message ||
          `Error ${response.status}: ${response.statusText}`

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log("✅ Service Clean - Success:", result)
    return result
  }
}

export const productServiceClean = new ProductServiceClean()
