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
  private baseURL = "http://localhost:3001"

  private getHeaders(): HeadersInit {
    const token = authService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // ✅ BÚSQUEDA SIMPLE SIN PAGINACIÓN
  async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
    console.log("🔍 Searching products with term:", searchTerm)
    
    // Construir URL con query params
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim())
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
    console.log("✅ Search results:", results)
    return results
  }
}

export const productSearchService = new ProductSearchService()