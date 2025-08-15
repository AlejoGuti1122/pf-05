// types/order.ts

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string
  }
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: OrderStatus
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  createdAt: string
  updatedAt: string
  trackingNumber?: string
  estimatedDelivery?: string
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER",
}

// ✅ ACTUALIZADO: Request para crear orden (formato que espera tu API)
export interface CreateOrderRequest {
  userId: string
  products: Array<{
    id: string
  }>
}

// ✅ NUEVO: Request completo con datos adicionales (para uso futuro)
export interface CreateOrderRequestComplete {
  userId: string
  products: Array<{
    id: string
  }>
  shippingAddress?: ShippingAddress
  paymentMethod?: PaymentMethod
  notes?: string
}

// Response del API
export interface CreateOrderResponse {
  success: boolean
  data: Order
  message?: string
}

export interface GetOrderResponse {
  success: boolean
  data: Order
  message?: string
}

// Para el hook de órdenes
export interface UseOrderReturn {
  order: Order | null
  orders: Order[]
  isLoading: boolean
  error: string | null

  // Acciones
  createOrder: (data: CreateOrderRequest) => Promise<Order>
  getOrder: (orderId: string) => Promise<Order>
  getUserOrders: () => Promise<Order[]>
  cancelOrder: (orderId: string) => Promise<void>
  refetch: () => Promise<void>
}
