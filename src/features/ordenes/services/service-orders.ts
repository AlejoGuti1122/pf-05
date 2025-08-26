/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orderService.ts

import {
  GetOrdersParams,
  OrdersResponse,
  OrderStats,
  ApiResponse,
  Order,
  CreateOrderRequest,
  OrderStatus,
  UpdateOrderStatusRequest,
} from "../types/orders"
import { authService } from "@/features/login/services/login-service"
import { getApiUrl } from "@/config/urls"

class ApiClient {
  private baseURL: string

  constructor() {
    // Usar configuración dinámica como ProductService
    this.baseURL = getApiUrl()

    if (typeof window !== "undefined") {
      console.log(
        "OrderService ApiClient initialized with baseURL:",
        this.baseURL
      )
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Agregar credentials como ProductService
      ...options,
    }

    // Usar authService centralizado en lugar de localStorage directo
    const token = authService.getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    } else {
      console.warn(
        "No token found - request might fail for protected endpoints"
      )
    }

    if (typeof window !== "undefined") {
      console.log("Making request to:", url)
      console.log("Has token:", !!token)
      console.log("User is admin:", authService.isAdmin())
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Mejor manejo de errores específicos como ProductService
        if (response.status === 401) {
          console.error(
            "Authentication failed - redirecting to login might be needed"
          )
          throw new Error("No estás autenticado. Por favor inicia sesión.")
        }
        if (response.status === 403) {
          console.error(
            "Access forbidden - user might not have admin permissions"
          )
          throw new Error("No tienes permisos para acceder a las órdenes.")
        }
        if (response.status === 404) {
          throw new Error("Recurso no encontrado.")
        }
        if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta de nuevo más tarde.")
        }

        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : ""
    return this.request<T>(`${endpoint}${queryParams}`, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

// Crear instancia única sin parámetros
const apiClient = new ApiClient()

export class OrderService {
  /**
   * Obtener todas las órdenes (solo admin)
   * GET /orders
   */
  static async getOrders(
    params: GetOrdersParams = {}
  ): Promise<OrdersResponse> {
    const queryParams: Record<string, string> = {}

    if (params.page) queryParams.page = params.page.toString()
    if (params.limit) queryParams.limit = params.limit.toString()
    if (params.search) queryParams.search = params.search
    if (params.status) queryParams.status = params.status
    if (params.userId) queryParams.userId = params.userId
    if (params.dateFrom) queryParams.dateFrom = params.dateFrom
    if (params.dateTo) queryParams.dateTo = params.dateTo
    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder

    // Verificar autenticación antes de hacer la petición
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver las órdenes")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para ver todas las órdenes"
      )
    }

    return apiClient.get<OrdersResponse>("/orders", queryParams)
  }

  /**
   * Obtener estadísticas de ventas (dashboard)
   * GET /orders/dashboard
   */
  static async getOrderStats(): Promise<OrderStats> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver las estadísticas")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para ver las estadísticas"
      )
    }

    return apiClient.get<OrderStats>("/orders/dashboard")
  }

  /**
   * Obtener una orden por su ID
   * GET /orders/{id}
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para ver la orden")
    }

    return apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`)
  }

  /**
   * Crear una nueva orden de compra
   * POST /orders
   */
  static async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para crear una orden")
    }

    return apiClient.post<ApiResponse<Order>>("/orders", orderData)
  }

  /**
   * Cambiar el status de una orden (solo admin)
   * PATCH /orders/{id}/status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    if (!authService.isAuthenticated()) {
      throw new Error("Debes estar autenticado para actualizar la orden")
    }

    if (!authService.isAdmin()) {
      throw new Error(
        "Necesitas permisos de administrador para cambiar el estado de órdenes"
      )
    }

    const data: UpdateOrderStatusRequest = { status }
    if (notes) data.notes = notes

    return apiClient.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      data
    )
  }

  /**
   * Buscar órdenes por término de búsqueda
   */
  static async searchOrders(searchTerm: string): Promise<OrdersResponse> {
    return this.getOrders({
      search: searchTerm,
      limit: 50,
    })
  }

  /**
   * Filtrar órdenes por estado
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<OrdersResponse> {
    return this.getOrders({ status, limit: 100 })
  }

  /**
   * Obtener órdenes de un usuario específico
   */
  static async getUserOrders(userId: string): Promise<OrdersResponse> {
    return this.getOrders({ userId, limit: 50 })
  }

  /**
   * Obtener órdenes por rango de fechas
   */
  static async getOrdersByDateRange(
    dateFrom: string,
    dateTo: string
  ): Promise<OrdersResponse> {
    return this.getOrders({ dateFrom, dateTo })
  }

  /**
   * Aprobar orden (cambiar de "En Preparacion" a "Aprobada")
   */
  static async approveOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Aprobada", notes)
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Cancelada", notes)
  }

  /**
   * Marcar orden como entregada
   */
  static async deliverOrder(
    orderId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, "Entregada", notes)
  }
}

export default OrderService
