// types/filters.ts

export interface FilterState {
  priceRange: { min: number; max: number }
  selectedBrands: string[]
  yearRange: { min: number; max: number }
  stockFilter: "all" | "inStock" | "outOfStock"
}

// Parámetros que se envían al API (basado en tu endpoint de Swagger)
export interface ProductFiltersAPI {
  limit?: number
  page?: number
  priceMax?: number
  priceMin?: number
  yearMax?: number
  yearMin?: number
  inStock?: boolean
  brands?: string // CSV o array de marcas
  search?: string // Texto parcial, case-insensitive
}

// Para convertir FilterState a parámetros de API
export interface ProductQueryParams extends ProductFiltersAPI {
  sortBy?: "name" | "price" | "brand" | "year"
  sortOrder?: "asc" | "desc"
}

// Respuesta del API de productos - Actualizada con categoryId
export interface ProductResponse {
  id: string
  name: string
  price: number
  stock: number
  imgUrl: string
  year: string
  brand: string
  model: string
  engine: string
  categoryId: string // ✅ Agregado para compatibilidad
  category: {
    id: string
    name: string
    products: string[]
  }
  description: string
  orderDetails: OrderDetail[]
}

interface OrderDetail {
  id: string
  price: number
  order: {
    id: string
    date: string
    status: string
    orderDetails: string
    user: {
      id: string
      name: string
      email: string
      password: string
      phone: number
      country: string
      address: string
      city: string
      isAdmin: boolean
      isSuperAdmin: boolean
      orders: string[]
    }
  }
  products: string[]
}