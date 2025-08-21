// services/productsService.ts
import { ProductResponse, ProductQueryParams } from "../types/filters"

// ✅ URL base usando variable de entorno
const API_BASE_URL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"

class FiltersService {
  private baseUrl = API_BASE_URL

  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<ProductResponse[]> {
    try {
      console.log("🔗 Usando API:", this.baseUrl)
      
      // Construir query string
      const queryParams = new URLSearchParams()

      // Agregar parámetros solo si tienen valor
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.priceMin)
        queryParams.append("priceMin", params.priceMin.toString())
      if (params.priceMax && params.priceMax !== Infinity) {
        queryParams.append("priceMax", params.priceMax.toString())
      }
      if (params.yearMin) queryParams.append("yearMin", params.yearMin.toString())
      if (params.yearMax) queryParams.append("yearMax", params.yearMax.toString())
      if (params.inStock !== undefined)
        queryParams.append("inStock", params.inStock.toString())
      if (params.brands) queryParams.append("brands", params.brands)
      if (params.search) queryParams.append("search", params.search)

      const url = `${this.baseUrl}/products${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`

      console.log("🔗 URL completa:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Productos obtenidos:", data.length || 0)
      return data
    } catch (error) {
      console.error("❌ Error en getProducts:", error)
      throw error
    }
  }

  async getBrands(): Promise<string[]> {
    try {
      console.log("📦 Obteniendo marcas desde productos...")
      const products = await this.getProducts()
      const brands = [...new Set(products.map((p) => p.brand))].sort()
      console.log("✅ Marcas encontradas:", brands)
      return brands
    } catch (error) {
      console.error("❌ Error fetching brands:", error)
      // ✅ Fallback con marcas comunes
      return [
        "Toyota",
        "Ford",
        "Honda",
        "Chevrolet",
        "Nissan",
        "BMW",
        "Mercedes",
        "Audi",
      ]
    }
  }

  // ✅ Método para obtener un producto por ID
  async getProductById(id: string): Promise<ProductResponse> {
    try {
      const url = `${this.baseUrl}/products/${id}`
      console.log("🔗 Obteniendo producto:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Producto obtenido:", data.id)
      return data
    } catch (error) {
      console.error("❌ Error en getProductById:", error)
      throw error
    }
  }
}

// ✅ Crear instancia y exportar
const filtersService = new FiltersService()
export default filtersService

// ✅ También exportar con nombre por si acaso
export { filtersService }