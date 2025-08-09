// services/productsService.ts
import Product, {
  ProductWithId,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/products"

// ✅ CORREGIDO: Sin /api al final
const API_BASE_URL = "http://localhost:3001"

class ProductsService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Obtener todos los productos
  getAllProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products")  // ✅ Sin /api
  }

  // Obtener producto por ID
  getProductById(id: string): Promise<ProductWithId> {
    return this.request<ProductWithId>(`/products/${id}`)
  }

  // Crear producto
  createProduct(productData: CreateProductRequest): Promise<ProductWithId> {
    return this.request<ProductWithId>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  // Actualizar producto
  updateProduct(
    id: string,
    productData: UpdateProductRequest
  ): Promise<ProductWithId> {
    return this.request<ProductWithId>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  // Eliminar producto
  deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    })
  }
}

const productsService = new ProductsService()
export default productsService