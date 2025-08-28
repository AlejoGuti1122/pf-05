// hooks/useProductsFiltered.ts
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  FilterState,
  ProductResponse,
  ProductQueryParams,
} from "../types/filters"
import filtersService from "../services/service-filters"

interface UseProductsFilteredProps {
  searchTerm?: string
  filters: FilterState
  sortBy: "name" | "price" | "brand" | "year"
  sortOrder: "asc" | "desc"
  page?: number
  limit?: number
}

interface UseProductsFilteredReturn {
  products: ProductResponse[]
  loading: boolean
  error: string | null
  availableBrands: string[]
  totalCount: number
  refetch: () => void
}

export const useProductsFiltered = ({
  searchTerm = "",
  filters,
  sortBy,
  sortOrder,
  page = 1,
  limit = 50,
}: UseProductsFilteredProps): UseProductsFilteredReturn => {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Convertir FilterState a parámetros de API
  const apiParams: ProductQueryParams = useMemo(() => {
    const params: ProductQueryParams = {
      limit,
      page,
      search: searchTerm || undefined,
      sortBy,
      sortOrder,
    }

    // Filtros de precio
    if (filters.priceRange.min > 0) {
      params.priceMin = filters.priceRange.min
    }
    if (filters.priceRange.max < Infinity) {
      params.priceMax = filters.priceRange.max
    }

    // Filtros de año
    if (filters.yearRange.min > 0) {
      params.yearMin = filters.yearRange.min
    }
    if (filters.yearRange.max < new Date().getFullYear()) {
      params.yearMax = filters.yearRange.max
    }


    // Filtros de marcas (convertir array a CSV)
    if (filters.selectedBrands.length > 0) {
      params.brands = filters.selectedBrands.join(",")
    }

    // ✅ DEBUG: Ver qué parámetros se están enviando
    
    console.log("🔍 HOOK - apiParams:", params)

    return params
  }, [searchTerm, filters, sortBy, sortOrder, page, limit])

  // Función para obtener productos (estabilizada con useCallback)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚀 HOOK - Fetching products with params:", apiParams)
      const data = await filtersService.getProducts(apiParams)
      console.log("📦 HOOK - API returned:", data.length, "products")

      // ✅ FILTRAR productos de seeder que no quieres mostrar
      const productsToHide = [
        "Aceite Castrol 10W40",
        "Amortiguador Monroe",
        "Bujía NGK Iridium",
        "Filtro de Aceite Bosch",
        "Pastilla de Freno Brembo",
      ]

      const filteredProducts = data.filter(
        (product) => !productsToHide.includes(product.name)
      )

      // ✅ Mapear la respuesta para agregar categoryId si no existe
      const mappedProducts = filteredProducts.map((product) => ({
        ...product,
        categoryId: product.categoryId || product.category?.id || "",
      }))

      // ✅ DEBUG: Ver productos por stock
      const inStockProducts = mappedProducts.filter((p) => p.stock > 0)
      const outOfStockProducts = mappedProducts.filter((p) => p.stock <= 0)

      console.log("📊 HOOK - Productos en stock:", inStockProducts.length)
      console.log("📊 HOOK - Productos sin stock:", outOfStockProducts.length)
      console.log("📊 HOOK - Total productos:", mappedProducts.length)

      setProducts(mappedProducts)
      setTotalCount(mappedProducts.length)
    } catch (err) {
      console.error("❌ HOOK - Error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [apiParams])

  // Función para obtener marcas disponibles (optimizada)
  const fetchBrands = useCallback(async () => {
    try {
      const brands = await filtersService.getBrands()
      setAvailableBrands(brands)
    } catch (err) {
      console.error("Error fetching brands:", err)
      setAvailableBrands([])
    }
  }, [])

  // Efectos
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  // ✅ Efecto separado para extraer marcas de productos como fallback
  useEffect(() => {
    if (products.length > 0 && availableBrands.length === 0) {
      const brandsFromProducts = [
        ...new Set(products.map((p) => p.brand)),
      ].sort()
      setAvailableBrands(brandsFromProducts)
    }
  }, [products, availableBrands.length])

  // Función para refetch manual (estabilizada)
  const refetch = useCallback(() => {
    fetchProducts()
    fetchBrands()
  }, [fetchProducts, fetchBrands])

  return {
    products,
    loading,
    error,
    availableBrands,
    totalCount,
    refetch,
  }
}

export default useProductsFiltered
