/* eslint-disable @typescript-eslint/no-explicit-any */
// types/cart.ts

// ✅ NUEVO: Interfaz para el producto anidado
export interface ProductInCart {
  id: string
  name: string
  price: number
  imageUrl: string | null
}

// ✅ ACTUALIZADO: CartItem según la respuesta real de tu API
export interface CartItem {
  id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  isValid: boolean
  product: ProductInCart // ✅ Datos del producto anidados
}

export interface Cart {
  id: string
  status: string
  subtotal: number
  total: number
  currency: string
  items: CartItem[]
  lastValidatedAt: string | null
  updatedAt: string
}

// Request types
export interface AddItemToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateItemQuantityRequest {
  quantity: number // 0 = eliminar
}

export interface MergeCartRequest {
  guestCartId?: string
}

// Response types
export interface CartResponse {
  success: boolean
  data: Cart
  message?: string
}

export interface CartItemResponse {
  success: boolean
  data: CartItem
  message?: string
}

// Error types
export interface CartError {
  message: string
  code?: string
  details?: any
}
