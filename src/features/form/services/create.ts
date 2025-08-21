// services/productServiceClean.ts
import { authService } from "@/features/login/services/login-service"
import { CreateProductResponseClean } from "../types/productClean"

class ProductServiceClean {
  // ✅ USAR VARIABLE DE ENTORNO
  private baseURL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

  // ✅ HEADERS PARA FORMDATA (SIN Content-Type)
  private getHeadersForFormData(): HeadersInit {
    const token = authService.getToken()
    console.log("🔗 Using API:", this.baseURL) // Debug API URL
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

    const url = `${this.baseURL}/products`
    console.log("🔗 Full URL:", url)

    const response = await fetch(url, {
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

      // ✅ MEJORADO: Manejo específico de errores
      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para crear productos.")
      }
      if (response.status === 413) {
        throw new Error("El archivo es demasiado grande.")
      }
      if (response.status === 415) {
        throw new Error("Tipo de archivo no soportado.")
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

  // ✅ BONUS: Actualizar producto con FormData
  async updateProduct(
    productId: string,
    formData: FormData
  ): Promise<CreateProductResponseClean> {
    console.log("🚀 Service Clean - Updating product with FormData")
    console.log("🔍 Product ID:", productId)

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

    const url = `${this.baseURL}/products/${productId}`
    console.log("🔗 Full URL:", url)

    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeadersForFormData(),
      body: formData,
    })

    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response completo:", errorData)

      if (errorData.message && Array.isArray(errorData.message)) {
        console.error("❌ Errores específicos:", errorData.message)
        errorData.message.forEach((msg: string, index: number) => {
          console.error(`   ${index + 1}. ${msg}`)
        })
      }

      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para actualizar productos.")
      }
      if (response.status === 404) {
        throw new Error("Producto no encontrado.")
      }
      if (response.status === 413) {
        throw new Error("El archivo es demasiado grande.")
      }
      if (response.status === 415) {
        throw new Error("Tipo de archivo no soportado.")
      }

      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message ||
          `Error ${response.status}: ${response.statusText}`

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log("✅ Service Clean - Update Success:", result)
    return result
  }

  // ✅ BONUS: Eliminar producto
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    console.log("🚀 Service Clean - Deleting product")
    console.log("🔍 Product ID:", productId)

    const url = `${this.baseURL}/products/${productId}`
    console.log("🔗 Full URL:", url)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authService.getToken() && {
          Authorization: `Bearer ${authService.getToken()}`,
        }),
      },
    })

    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response completo:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para eliminar productos.")
      }
      if (response.status === 404) {
        throw new Error("Producto no encontrado.")
      }

      const errorMessage =
        errorData.message || `Error ${response.status}: ${response.statusText}`

      throw new Error(errorMessage)
    }

    console.log("✅ Service Clean - Delete Success")
    return { success: true }
  }

  // ✅ BONUS: Subir imagen individual
  async uploadProductImage(
    productId: string,
    imageFile: File
  ): Promise<{ imageUrl: string }> {
    console.log("🚀 Service Clean - Uploading product image")
    console.log("🔍 Product ID:", productId)
    console.log("🔍 Image file:", imageFile.name, imageFile.size, "bytes")

    const formData = new FormData()
    formData.append("image", imageFile)

    const url = `${this.baseURL}/products/${productId}/image`
    console.log("🔗 Full URL:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeadersForFormData(),
      body: formData,
    })

    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response completo:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para subir imágenes.")
      }
      if (response.status === 404) {
        throw new Error("Producto no encontrado.")
      }
      if (response.status === 413) {
        throw new Error("La imagen es demasiado grande.")
      }
      if (response.status === 415) {
        throw new Error("Tipo de imagen no soportado.")
      }

      const errorMessage =
        errorData.message || `Error ${response.status}: ${response.statusText}`

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log("✅ Service Clean - Image Upload Success:", result)
    return result
  }
}

export const productServiceClean = new ProductServiceClean()
