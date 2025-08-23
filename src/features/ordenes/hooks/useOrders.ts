// hooks/useOrders.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import OrderService from '../services/service-orders';
import { Order, OrderStats, GetOrdersParams, CreateOrderRequest, OrderStatus } from '../types/orders';


interface UseOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  stats?: OrderStats;
}

interface UseOrdersActions {
  fetchOrders: (params?: GetOrdersParams) => Promise<void>;
  fetchOrderStats: () => Promise<void>;
  createOrder: (orderData: CreateOrderRequest) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<boolean>;
  approveOrder: (orderId: string, notes?: string) => Promise<boolean>;
  cancelOrder: (orderId: string, notes?: string) => Promise<boolean>;
  deliverOrder: (orderId: string, notes?: string) => Promise<boolean>;
  searchOrders: (searchTerm: string) => Promise<void>;
  filterByStatus: (status: OrderStatus | null) => Promise<void>;
  refreshOrders: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<GetOrdersParams>) => void;
  clearError: () => void;
}

interface UseOrdersOptions {
  initialParams?: GetOrdersParams;
  autoFetch?: boolean;
  includeDashboard?: boolean;
}

export const useOrders = (options: UseOrdersOptions = {}): UseOrdersState & UseOrdersActions => {
  const { initialParams = {}, autoFetch = true, includeDashboard = false } = options;

  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    loading: false,
    error: null,
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFiltersState] = useState<GetOrdersParams>(initialParams);

  // Función para actualizar el estado
  const updateState = useCallback((updates: Partial<UseOrdersState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función principal para obtener órdenes
  const fetchOrders = useCallback(async (params: GetOrdersParams = {}) => {
    updateState({ loading: true, error: null });
    
    try {
      const finalParams = { ...filters, ...params };
      const response = await OrderService.getOrders(finalParams);
      
      updateState({
        orders: response.data,
        totalOrders: response.meta.total,
        currentPage: response.meta.page,
        totalPages: response.meta.totalPages,
        hasNextPage: response.meta.page < response.meta.totalPages,
        hasPrevPage: response.meta.page > 1,
        loading: false,
      });
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar órdenes',
      });
    }
  }, [filters, updateState]);

  // Obtener estadísticas para dashboard
  const fetchOrderStats = useCallback(async () => {
    try {
      const stats = await OrderService.getOrderStats();
      updateState({ stats });
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  }, [updateState]);

  // Crear orden
  const createOrder = useCallback(async (orderData: CreateOrderRequest): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      await OrderService.createOrder(orderData);
      await fetchOrders(); // Refrescar la lista
      updateState({ loading: false });
      return true;
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear orden',
      });
      return false;
    }
  }, [fetchOrders, updateState]);

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: OrderStatus,
    notes?: string
  ): Promise<boolean> => {
    updateState({ error: null });
    
    try {
      await OrderService.updateOrderStatus(orderId, status, notes);
      
      // Actualizar la orden en el estado local
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date().toISOString() } 
            : order
        )
      }));
      
      return true;
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Error al actualizar estado de orden',
      });
      return false;
    }
  }, [updateState]);

  // Aprobar orden
  const approveOrder = useCallback(async (orderId: string, notes?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'Aprobada', notes);
  }, [updateOrderStatus]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId: string, notes?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'Cancelada', notes);
  }, [updateOrderStatus]);

  // Entregar orden
  const deliverOrder = useCallback(async (orderId: string, notes?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'Entregada', notes);
  }, [updateOrderStatus]);

  // Buscar órdenes
  const searchOrders = useCallback(async (searchTerm: string) => {
    await fetchOrders({ search: searchTerm, page: 1 });
  }, [fetchOrders]);

  // Filtrar por estado
  const filterByStatus = useCallback(async (status: OrderStatus | null) => {
    const filterParams = status ? { status, page: 1 } : { page: 1 };
    await fetchOrders(filterParams);
  }, [fetchOrders]);

  // Refrescar órdenes
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    if (includeDashboard) {
      await fetchOrderStats();
    }
  }, [fetchOrders, fetchOrderStats, includeDashboard]);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    fetchOrders({ page });
  }, [fetchOrders]);

  // Actualizar filtros
  const setFilters = useCallback((newFilters: Partial<GetOrdersParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    fetchOrders(updatedFilters);
  }, [filters, fetchOrders]);

  // Limpiar error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Obtener órdenes automáticamente al montar el componente
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
      if (includeDashboard) {
        fetchOrderStats();
      }
    }
  }, []); // Solo se ejecuta una vez al montar

  // Datos derivados con useMemo para optimización
  const derivedData = useMemo(() => ({
    isEmpty: state.orders.length === 0 && !state.loading,
    pendingOrders: state.orders.filter(order => order.status === 'En Preparacion'),
    approvedOrders: state.orders.filter(order => order.status === 'Aprobada'),
    deliveredOrders: state.orders.filter(order => order.status === 'Entregada'),
    canceledOrders: state.orders.filter(order => order.status === 'Cancelada'),
    totalRevenue: state.orders.reduce((sum, order) => sum + order.summary.grandTotal, 0),
    averageOrderValue: state.orders.length > 0 
      ? state.orders.reduce((sum, order) => sum + order.summary.grandTotal, 0) / state.orders.length 
      : 0,
  }), [state.orders, state.loading]);

  return {
    // Estado
    ...state,
    ...derivedData,
    
    // Acciones
    fetchOrders,
    fetchOrderStats,
    createOrder,
    updateOrderStatus,
    approveOrder,
    cancelOrder,
    deliverOrder,
    searchOrders,
    filterByStatus,
    refreshOrders,
    setPage,
    setFilters,
    clearError,
  };
};

export default useOrders;