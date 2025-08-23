/* eslint-disable @typescript-eslint/no-explicit-any */
// services/orderService.ts

import { GetOrdersParams, OrdersResponse, OrderStats, ApiResponse, Order, CreateOrderRequest, OrderStatus, UpdateOrderStatusRequest } from "../types/orders";



// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Token de autenticación para admin
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryParams}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export class OrderService {
  /**
   * Obtener todas las órdenes (solo admin)
   * GET /orders
   */
  static async getOrders(params: GetOrdersParams = {}): Promise<OrdersResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.userId) queryParams.userId = params.userId;
    if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
    if (params.dateTo) queryParams.dateTo = params.dateTo;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<OrdersResponse>('/orders', queryParams);
  }

  /**
   * Obtener estadísticas de ventas (dashboard)
   * GET /orders/dashboard
   */
  static async getOrderStats(): Promise<OrderStats> {
    return apiClient.get<OrderStats>('/orders/dashboard');
  }

  /**
   * Obtener una orden por su ID
   * GET /orders/{id}
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
  }

  /**
   * Crear una nueva orden de compra
   * POST /orders
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>('/orders', orderData);
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
    const data: UpdateOrderStatusRequest = { status };
    if (notes) data.notes = notes;
    
    return apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, data);
  }

  /**
   * Buscar órdenes por término de búsqueda
   */
  static async searchOrders(searchTerm: string): Promise<OrdersResponse> {
    return this.getOrders({ 
      search: searchTerm,
      limit: 50 
    });
  }

  /**
   * Filtrar órdenes por estado
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<OrdersResponse> {
    return this.getOrders({ status, limit: 100 });
  }

  /**
   * Obtener órdenes de un usuario específico
   */
  static async getUserOrders(userId: string): Promise<OrdersResponse> {
    return this.getOrders({ userId, limit: 50 });
  }

  /**
   * Obtener órdenes por rango de fechas
   */
  static async getOrdersByDateRange(
    dateFrom: string, 
    dateTo: string
  ): Promise<OrdersResponse> {
    return this.getOrders({ dateFrom, dateTo });
  }

  /**
   * Aprobar orden (cambiar de "En Preparacion" a "Aprobada")
   */
  static async approveOrder(orderId: string, notes?: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, 'Aprobada', notes);
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(orderId: string, notes?: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, 'Cancelada', notes);
  }

  /**
   * Marcar orden como entregada
   */
  static async deliverOrder(orderId: string, notes?: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(orderId, 'Entregada', notes);
  }
}

export default OrderService;