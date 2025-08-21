// services/productService.ts
import { authService } from "@/features/login/services/login-service"
import { ProductDetailResponse } from "../types/detail"
import {
  CreateProductResponse,
  CreateProductRequest,
  Category,
} from "../types/product-form"

class ProductService {
  private baseURL: string

  constructor() {
    // ✅ USAR VARIABLE DE ENTORNO
    this.baseURL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"
  }

  // ✅ MÉTODO HELPER para headers con auth
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken()

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Solo agregar si hay token
    }
  }

  async getProductDetail(id: string): Promise<ProductDetailResponse> {
    const url = `${this.baseURL}/products/${id}`
    console.log("🔗 Obteniendo detalle del producto:", url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("❌ Error en getProductDetail:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Detalle del producto obtenido:", data.id)
    return data
  }

  async createProduct(
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> {
    console.log("🚀 INICIO createProduct")
    console.log("🔗 URL:", `${this.baseURL}/products`)
    console.log("🔍 Datos originales:", JSON.stringify(productData, null, 2))

    // ✅ NORMALIZAR PRECIO (convertir comas a puntos)
    const normalizedPrice = productData.price.toString().replace(",", ".")
    const price = parseFloat(normalizedPrice)

    console.log("🔍 Precio original:", productData.price)
    console.log("🔍 Precio normalizado:", normalizedPrice)
    console.log("🔍 Precio convertido:", price)

    // Validar que el precio sea válido
    if (isNaN(price)) {
      throw new Error("Precio inválido")
    }

    // ✅ PROBAR DIFERENTES FORMATOS DE PRECIO
    console.log("🧪 Testing different price formats...")

    const priceTests = {
      original: price,
      string: price.toFixed(2),
      stringWithoutDecimals: price.toFixed(0),
      number: Number(price),
      numberFixed: Number(price.toFixed(2)),
      parseFloat: parseFloat(price.toFixed(2)),
    }

    console.log("🔍 Price formats to test:", priceTests)

    // ✅ PROBAR CON PARSEFLOAT Y STRING SIN DECIMALES
    const dataToSend = {
      name: productData.name,
      price: parseFloat(price.toFixed(2)), // ✅ PARSEFLOAT DEL STRING
      stock: parseInt(productData.stock.toString()),
      imgUrl: productData.imgUrl,
      year: productData.year.toString(),
      brand: productData.brand,
      model: productData.model,
      engine: productData.engine,
      categoryId: productData.categoryId,
    }

    console.log("🚀 Datos enviados:", JSON.stringify(dataToSend, null, 2))

    const response = await fetch(`${this.baseURL}/products`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dataToSend),
    })

    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error response:", errorData)

      // ✅ MEJOR manejo de errores
      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para crear productos.")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const result = await response.json()
    console.log("✅ Producto creado exitosamente:", result)
    return result
  }

  async getCategories(): Promise<Category[]> {
    const url = `${this.baseURL}/categories`
    console.log("🔗 Obteniendo categorías:", url)

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      console.error("❌ Error en getCategories:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Categorías obtenidas:", data.length || 0)
    return data
  }

  // ✅ BONUS: Método para actualizar producto
  async updateProduct(
    id: string,
    productData: Partial<CreateProductRequest>
  ): Promise<CreateProductResponse> {
    const url = `${this.baseURL}/products/${id}`
    console.log("🔗 Actualizando producto:", url)

    // Normalizar precio si existe
    const dataToSend = { ...productData }
    if (productData.price) {
      const normalizedPrice = productData.price.toString().replace(",", ".")
      dataToSend.price = parseFloat(normalizedPrice)
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dataToSend),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error updating product:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para actualizar productos.")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const result = await response.json()
    console.log("✅ Producto actualizado exitosamente:", result)
    return result
  }

  // ✅ BONUS: Método para eliminar producto
  async deleteProduct(id: string): Promise<void> {
    const url = `${this.baseURL}/products/${id}`
    console.log("🔗 Eliminando producto:", url)

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error deleting product:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado. Por favor inicia sesión.")
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para eliminar productos.")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    console.log("✅ Producto eliminado exitosamente")
  }
}

export const productService = new ProductService()
