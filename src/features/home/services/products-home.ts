// services/productsService.ts
import Product, {
  ProductWithId,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/products"

// ✅ USAR VARIABLE DE ENTORNO
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

class ProductsService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    console.log("🔗 ProductsService request:", url)

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        console.error("❌ ProductsService error:", response.status, response.statusText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ ProductsService success:", endpoint)
      return data
    } catch (error) {
      console.error("❌ ProductsService API Error:", error)
      throw error
    }
  }

  // Obtener todos los productos
  getAllProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products")
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

  // ✅ BONUS: Método para obtener productos por categoría
  getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.request<Product[]>(`/products/category/${categoryId}`)
  }

  // ✅ BONUS: Método para buscar productos
  searchProducts(query: string): Promise<Product[]> {
    const searchParams = new URLSearchParams({ search: query })
    return this.request<Product[]>(`/products?${searchParams.toString()}`)
  }

  // ✅ BONUS: Método para obtener productos con paginación
  getProductsPaginated(page: number = 1, limit: number = 10): Promise<{
    products: Product[]
    total: number
    page: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    })
    return this.request(`/products?${searchParams.toString()}`)
  }
}

const productsService = new ProductsService()
export default productsService