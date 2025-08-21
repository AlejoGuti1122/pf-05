/* eslint-disable @typescript-eslint/no-explicit-any */
// services/productSearchService.ts
import { authService } from "@/features/login/services/login-service"

export interface ProductSearchResult {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  category: {
    id: string
    name: string
    products: string[]
  }
  description: string
  orderDetails: any[]
}

class ProductSearchService {
  // ✅ USAR VARIABLE DE ENTORNO
  private baseURL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

  private getHeaders(): HeadersInit {
    const token = authService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // ✅ BÚSQUEDA SIMPLE SIN PAGINACIÓN
  async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
    console.log("🔍 Searching products with term:", searchTerm)
    console.log("🔗 Using API:", this.baseURL)

    // Construir URL con query params
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim())
    }

    const url = `${this.baseURL}/products?${params.toString()}`
    console.log("🔍 Search URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    })

    console.log("🔍 Search response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Search error:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const results = await response.json()
    console.log("✅ Search results:", results.length || 0, "products found")
    return results
  }

  // ✅ BONUS: Búsqueda avanzada con filtros
  async searchProductsAdvanced(filters: {
    search?: string
    brand?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    minYear?: number
    maxYear?: number
    inStock?: boolean
  }): Promise<ProductSearchResult[]> {
    console.log("🔍 Advanced search with filters:", filters)

    const params = new URLSearchParams()

    if (filters.search?.trim()) {
      params.append("search", filters.search.trim())
    }
    if (filters.brand) {
      params.append("brands", filters.brand)
    }
    if (filters.category) {
      params.append("categoryId", filters.category)
    }
    if (filters.minPrice !== undefined) {
      params.append("priceMin", filters.minPrice.toString())
    }
    if (filters.maxPrice !== undefined) {
      params.append("priceMax", filters.maxPrice.toString())
    }
    if (filters.minYear !== undefined) {
      params.append("yearMin", filters.minYear.toString())
    }
    if (filters.maxYear !== undefined) {
      params.append("yearMax", filters.maxYear.toString())
    }
    if (filters.inStock !== undefined) {
      params.append("inStock", filters.inStock.toString())
    }

    const url = `${this.baseURL}/products?${params.toString()}`
    console.log("🔍 Advanced search URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Advanced search error:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const results = await response.json()
    console.log(
      "✅ Advanced search results:",
      results.length || 0,
      "products found"
    )
    return results
  }

  // ✅ BONUS: Búsqueda con paginación
  async searchProductsPaginated(
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    products: ProductSearchResult[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log("🔍 Paginated search:", { searchTerm, page, limit })

    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim())
    }
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const url = `${this.baseURL}/products?${params.toString()}`
    console.log("🔍 Paginated search URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Paginated search error:", errorData)

      if (response.status === 401) {
        throw new Error("No estás autenticado")
      }

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const results = await response.json()
    console.log("✅ Paginated search results:", results)
    return results
  }
}

export const productSearchService = new ProductSearchService()
