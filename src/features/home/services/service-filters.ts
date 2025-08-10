// services/productsService.ts
import { ProductResponse, ProductQueryParams } from "../types/filters"

// ✅ URL base correcta según tu Swagger (SIN /api al final)
const API_BASE_URL = "http://localhost:3001"

// services/productsService.ts

// ✅ Posibles URLs base para probar
const POSSIBLE_BASE_URLS = [
  "http://localhost:3001", // URL base principal (sin /api)
  "http://localhost:3001/api", // Con /api
  "http://localhost:3001/api/v1", // Con versión
]

class FiltersService {
  private baseUrl = POSSIBLE_BASE_URLS[0] // Empezar con la primera

  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<ProductResponse[]> {
    // Intentar con diferentes URLs base si la primera falla
    for (const baseUrl of POSSIBLE_BASE_URLS) {
      try {
        const result = await this.tryGetProducts(baseUrl, params)
        this.baseUrl = baseUrl // Guardar la URL que funciona
        console.log("✅ API funcionando en:", baseUrl)
        return result
      } catch (error) {
        console.log("❌ Falló:", baseUrl)
        continue
      }
    }

    throw new Error("No se pudo conectar con ninguna URL de la API")
  }

  private async tryGetProducts(
    baseUrl: string,
    params: ProductQueryParams = {}
  ): Promise<ProductResponse[]> {
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

    const url = `${baseUrl}/products${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`

    console.log("🔗 Intentando:", url)

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
    return data
  }

  async getBrands(): Promise<string[]> {
    try {
      // ✅ Tu API no tiene endpoint /brands, así que obtener marcas de los productos
      console.log("📦 Obteniendo marcas desde productos...")
      const products = await this.getProducts()
      const brands = [...new Set(products.map((p) => p.brand))].sort()
      console.log("✅ Marcas encontradas:", brands)
      return brands
    } catch (error) {
      console.error("Error fetching brands:", error)
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
}

// ✅ Crear instancia y exportar con nombre más explícito
const filtersService = new FiltersService()
export default filtersService

// ✅ También exportar con nombre por si acaso
export { filtersService }
