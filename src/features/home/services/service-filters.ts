/* eslint-disable @typescript-eslint/no-explicit-any */
// services/filtersService.ts
import { ProductResponse, ProductQueryParams } from "../types/filters"
import { getApiUrl } from "@/config/urls" // ← IMPORTAR CONFIGURACIÓN DINÁMICA

// ✅ INTERFAZ EXTENDIDA CON OVERRIDE DE PROPIEDADES CONFLICTIVAS
interface ExtendedProductQueryParams
  extends Omit<ProductQueryParams, "sortBy" | "sortOrder"> {
  sortBy?: "name" | "price" | "year" | "brand" | "model" | "engine" | "stock"
  sortOrder?: "asc" | "desc"
  category?: string
  categoryId?: string
}

class FiltersService {
  // ✅ PARÁMETROS PERMITIDOS POR EL BACKEND (actualizar según lo que acepta tu API)
  private readonly ALLOWED_QUERY_PARAMS = [
    "limit",
    "page",
    "priceMin",
    "priceMax",
    "yearMin",
    "yearMax",
    "inStock",
    "brands",
    "search",
    "category",
    "categoryId",
    // ❌ COMENTADOS PORQUE EL BACKEND NO LOS ACEPTA:
    // 'sortBy',
    // 'sortOrder'
  ]

  constructor() {
    // ✅ SOLO LOG EN CLIENTE
    if (typeof window !== "undefined") {
      console.log("🌐 FiltersService initialized with baseURL:", getApiUrl())
    }
  }

  // ✅ HELPER PARA OBTENER HEADERS CON AUTH OPCIONAL
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth && typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // ✅ HELPER PARA CONSTRUIR QUERY PARAMS SEGUROS
  private buildSafeQueryParams(
    params: ExtendedProductQueryParams
  ): URLSearchParams {
    const queryParams = new URLSearchParams()

    // ✅ SOLO AGREGAR PARÁMETROS PERMITIDOS Y VÁLIDOS
    const paramEntries: [string, any][] = [
      [
        "limit",
        params.limit && params.limit > 0 ? Math.min(params.limit, 100) : null,
      ],
      ["page", params.page && params.page > 0 ? params.page : null],
      [
        "priceMin",
        params.priceMin && params.priceMin >= 0 ? params.priceMin : null,
      ],
      [
        "priceMax",
        params.priceMax && params.priceMax !== Infinity && params.priceMax > 0
          ? params.priceMax
          : null,
      ],
      ["yearMin", params.yearMin && params.yearMin > 0 ? params.yearMin : null],
      ["yearMax", params.yearMax && params.yearMax > 0 ? params.yearMax : null],
      ["inStock", params.inStock !== undefined ? params.inStock : null],
      [
        "brands",
        params.brands && params.brands.trim() ? params.brands.trim() : null,
      ],
      [
        "search",
        params.search && params.search.trim() ? params.search.trim() : null,
      ],
      ["category", params.category ? params.category : null],
      ["categoryId", params.categoryId ? params.categoryId : null],
    ]

    // ✅ FILTRAR Y AGREGAR SOLO PARÁMETROS VÁLIDOS Y PERMITIDOS
    paramEntries.forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        this.ALLOWED_QUERY_PARAMS.includes(key)
      ) {
        queryParams.append(key, value.toString())
      }
    })

    return queryParams
  }

  // ✅ MEJORADO: Obtener productos con filtros y URLs dinámicas
  // Reemplaza el método getProducts() en tu filtersService con esta versión mejorada:

  // Reemplaza el método getProducts() en tu filtersService con esta versión mejorada:

  async getProducts(
    params: ExtendedProductQueryParams = {}
  ): Promise<ProductResponse[]> {
    try {
      console.log("🔍 Obteniendo productos con filtros:", params)

      // ✅ CONSTRUIR QUERY STRING SEGURO
      const queryParams = this.buildSafeQueryParams(params)

      // ⚠️ LOG DE PARÁMETROS IGNORADOS (para debug)
      if (params.sortBy || params.sortOrder) {
        console.warn(
          "⚠️ Parámetros de ordenamiento ignorados (no soportados por el backend):",
          {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          }
        )
      }

      // ✅ USAR URLs DINÁMICAS
      const endpoint = `/products/seeder${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
      const url = getApiUrl(endpoint)

      console.log("🔗 URL completa:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include", // ✅ AGREGAR PARA COOKIES
      })

      console.log("📡 Products response status:", response.status)
      console.log(
        "📡 Products response headers:",
        response.headers.get("content-type")
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en getProducts:", response.status, errorData)

        if (response.status === 400) {
          // ✅ MEJORAR MENSAJE DE ERROR 400
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || "Parámetros de filtros inválidos."

          throw new Error(`Parámetros inválidos: ${message}`)
        }
        if (response.status === 404) {
          throw new Error(
            "Endpoint /products/seeder no encontrado. Verifica que esté disponible en el backend."
          )
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      // ✅ VERIFICAR SI LA RESPUESTA TIENE CONTENIDO ANTES DE PARSEAR JSON
      const responseText = await response.text()
      console.log("📡 Response text length:", responseText.length)
      console.log("📡 Response preview:", responseText.substring(0, 200))

      if (!responseText || responseText.trim().length === 0) {
        console.warn("⚠️ Respuesta vacía del servidor")
        return []
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Error parsing JSON:", parseError)
        console.error("❌ Response text was:", responseText)
        const errorMessage =
          parseError instanceof Error ? parseError.message : "Error desconocido"
        throw new Error(`Respuesta inválida del servidor: ${errorMessage}`)
      }

      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let products: ProductResponse[] = []

      if (Array.isArray(data)) {
        products = data
      } else if (data.products) {
        products = data.products
      } else if (data.data) {
        products = data.data
      } else {
        console.warn("⚠️ Formato de respuesta inesperado:", data)
        products = []
      }

      console.log("✅ Productos obtenidos:", products.length)
      return products
    } catch (error) {
      console.error("❌ Error en getProducts:", error)
      throw error
    }
  }

  // ✅ HELPER PARA ORDENAMIENTO EN EL FRONTEND (mientras el backend no lo soporte)
  sortProductsLocally(
    products: ProductResponse[],
    sortBy?: string,
    sortOrder: "asc" | "desc" = "asc"
  ): ProductResponse[] {
    if (!sortBy || !products.length) return products

    return [...products].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || ""
          bValue = b.name?.toLowerCase() || ""
          break
        case "price":
          aValue = parseFloat(a.price?.toString() || "0")
          bValue = parseFloat(b.price?.toString() || "0")
          break
        case "year":
          aValue = parseInt(a.year?.toString() || "0")
          bValue = parseInt(b.year?.toString() || "0")
          break
        case "brand":
          aValue = a.brand?.toLowerCase() || ""
          bValue = b.brand?.toLowerCase() || ""
          break
        case "model":
          aValue = a.model?.toLowerCase() || ""
          bValue = b.model?.toLowerCase() || ""
          break
        case "engine":
          aValue = a.engine?.toLowerCase() || ""
          bValue = b.engine?.toLowerCase() || ""
          break
        case "stock":
          aValue = parseInt(a.stock?.toString() || "0")
          bValue = parseInt(b.stock?.toString() || "0")
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  // ✅ MÉTODO PÚBLICO QUE INCLUYE ORDENAMIENTO LOCAL
  async getProductsWithSort(
    params: ExtendedProductQueryParams = {}
  ): Promise<ProductResponse[]> {
    // ✅ OBTENER PRODUCTOS SIN ORDENAMIENTO DEL BACKEND
    const products = await this.getProducts(params)

    // ✅ APLICAR ORDENAMIENTO LOCAL SI SE ESPECIFICA
    if (params.sortBy) {
      return this.sortProductsLocally(products, params.sortBy, params.sortOrder)
    }

    return products
  }

  // ✅ RESTO DE MÉTODOS SIN CAMBIOS...
  async getBrands(): Promise<string[]> {
    try {
      console.log("📦 Obteniendo marcas...")

      // ✅ PRIMERO INTENTAR ENDPOINT ESPECÍFICO DE MARCAS
      try {
        const url = getApiUrl("/products/brands")
        console.log("🔗 Intentando endpoint de marcas:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
          credentials: "include",
        })

        if (response.ok) {
          const brands = await response.json()
          console.log(
            "✅ Marcas obtenidas desde endpoint específico:",
            brands.length
          )
          return Array.isArray(brands) ? brands.sort() : []
        }
      } catch (error) {
        console.log("⚠️ Endpoint de marcas no disponible, usando productos")
      }

      // ✅ FALLBACK: EXTRAER MARCAS DE TODOS LOS PRODUCTOS
      console.log("📦 Extrayendo marcas desde productos...")
      const products = await this.getProducts({ limit: 1000 }) // Obtener muchos productos para marcas completas

      const brandsSet = new Set<string>()
      products.forEach((product) => {
        if (product.brand && product.brand.trim()) {
          brandsSet.add(product.brand.trim())
        }
      })

      const brands = Array.from(brandsSet).sort()
      console.log("✅ Marcas extraídas:", brands.length)
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
        "Hyundai",
        "Kia",
        "Mazda",
        "Subaru",
      ].sort()
    }
  }

  // ✅ MÉTODO PARA DEBUG - Ver qué parámetros están siendo enviados
  debugParams(params: ExtendedProductQueryParams): void {
    console.log("🔍 DEBUG - Parámetros recibidos:", params)
    console.log("🔍 DEBUG - Parámetros permitidos:", this.ALLOWED_QUERY_PARAMS)

    const safeParams = this.buildSafeQueryParams(params)
    console.log("🔍 DEBUG - Query string final:", safeParams.toString())

    // Mostrar parámetros ignorados
    const ignoredParams = Object.keys(params).filter(
      (key) =>
        !this.ALLOWED_QUERY_PARAMS.includes(key) &&
        params[key as keyof ExtendedProductQueryParams] !== undefined
    )
    if (ignoredParams.length > 0) {
      console.warn("⚠️ DEBUG - Parámetros ignorados:", ignoredParams)
    }
  }

  // ... resto de métodos permanecen igual
}

// ✅ Crear instancia y exportar
const filtersService = new FiltersService()
export default filtersService

// ✅ También exportar con nombre por si acaso
export { filtersService }
