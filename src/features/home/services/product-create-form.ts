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
    this.baseURL = "http://localhost:3001"
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
    const response = await fetch(`${this.baseURL}/products/${id}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async createProduct(
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> {
    console.log("🚀 INICIO createProduct")
    console.log("🔍 Datos originales:", JSON.stringify(productData, null, 2))
    
    // ✅ NORMALIZAR PRECIO (convertir comas a puntos)
    const normalizedPrice = productData.price.toString().replace(',', '.')
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
      parseFloat: parseFloat(price.toFixed(2))
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
      categoryId: productData.categoryId
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
    const response = await fetch(`${this.baseURL}/categories`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const productService = new ProductService()