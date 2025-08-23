"use client"

import React, { JSX, useState } from "react"
import {
  Search,
  Package,
  User,
  Calendar,
  DollarSign,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Filter,
  Eye,
} from "lucide-react"

// Importaciones que usarías en tu proyecto real:
// import { useOrders } from '../hooks/useOrders';
// import { OrderStatus, Order } from '../types/order';

// Tipos actualizados para coincidir con tu API real
interface OrderItem {
  id?: string
  productId?: string
  productName?: string
  productCode?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

interface OrderSummary {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
  invalidItemsCount: number
  subTotal: number // API devuelve ambos
  grandTotal: number
}

interface Order {
  id: string // UUID como en tu API
  userId: string // UUID como en tu API
  items: OrderItem[]
  summary: OrderSummary
  // Campos adicionales que podrían venir
  status?: OrderStatus
  createdAt?: string
  updatedAt?: string
  orderNumber?: string
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

type OrderStatus =
  | "En Preparacion"
  | "Aprobada"
  | "En Transito"
  | "Entregada"
  | "Cancelada"

// Mock actualizado para coincidir con tu estructura real
const useOrders = (p0: {
  initialParams: { limit: number }
  autoFetch: boolean
}) => {
  const [localOrders, setLocalOrders] = useState<Order[]>([
    {
      id: "29404e9e-bdfc-4449-ab48-af1aa50f277a",
      userId: "37b97647-6272-40dd-ab25-b77927aee18a",
      items: [
        {
          id: "item-1",
          productName: "Filtro de Aceite Honda Civic",
          productCode: "FO-HC-001",
          quantity: 2,
          unitPrice: 25000,
          totalPrice: 50000,
        },
        {
          id: "item-2",
          productName: "Pastillas de Freno Delanteras",
          productCode: "PF-HC-002",
          quantity: 1,
          unitPrice: 85000,
          totalPrice: 85000,
        },
      ],
      summary: {
        subtotal: 135000,
        discount: 0,
        tax: 25650,
        total: 160650,
        currency: "COP", // Cambiado de USD a COP
        invalidItemsCount: 0,
        subTotal: 135000,
        grandTotal: 160650,
      },
      // Campos opcionales para el display
      status: "En Preparacion",
      createdAt: "2024-08-20T10:30:00Z",
      updatedAt: "2024-08-20T10:30:00Z",
      orderNumber: "RP-2024-001",
      customer: {
        id: "123",
        name: "Carlos Méndez",
        email: "carlos@example.com",
        phone: "+57 300 123 4567",
      },
    },
    {
      id: "a1b2c3d4-e5f6-4789-9abc-def123456789",
      userId: "b2c3d4e5-f6g7-4890-9bcd-ef1234567890",
      items: [], // Orden vacía como tu ejemplo
      summary: {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        currency: "USD",
        invalidItemsCount: 0,
        subTotal: 0,
        grandTotal: 0,
      },
      status: "En Preparacion",
      createdAt: "2024-08-19T14:15:00Z",
      updatedAt: "2024-08-19T14:15:00Z",
      orderNumber: "RP-2024-002",
      customer: {
        id: "124",
        name: "Ana Torres",
        email: "ana.torres@example.com",
        phone: "+57 310 987 6543",
      },
    },
    {
      id: "c3d4e5f6-g7h8-4901-9cde-f12345678901",
      userId: "d4e5f6g7-h8i9-4012-9def-123456789012",
      items: [
        {
          id: "item-3",
          productName: "Batería 12V Toyota Corolla",
          productCode: "BAT-TC-003",
          quantity: 1,
          unitPrice: 320000,
          totalPrice: 320000,
        },
      ],
      summary: {
        subtotal: 320000,
        discount: 32000,
        tax: 54720,
        total: 342720,
        currency: "COP",
        invalidItemsCount: 0,
        subTotal: 320000,
        grandTotal: 342720,
      },
      status: "Aprobada",
      createdAt: "2024-08-18T09:45:00Z",
      updatedAt: "2024-08-20T08:30:00Z",
      orderNumber: "RP-2024-003",
      customer: {
        id: "125",
        name: "Miguel Rodríguez",
        email: "miguel.r@example.com",
        phone: "+57 320 456 7890",
      },
    },
  ])

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null)

  // Filtrar órdenes
  const filteredOrders = localOrders.filter((order) => {
    const matchesSearch =
      (order.orderNumber ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return {
    orders: filteredOrders,
    loading,
    error,
    totalOrders: localOrders.length,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    searchOrders: async (term: string) => {
      setLoading(true)
      setSearchTerm(term)
      setTimeout(() => setLoading(false), 500)
    },
    filterByStatus: async (status: OrderStatus | null) => {
      setLoading(true)
      setStatusFilter(status)
      setTimeout(() => setLoading(false), 300)
    },
    refreshOrders: async () => {
      setLoading(true)
      setError(null)
      setTimeout(() => {
        console.log("🔄 Refrescando órdenes desde Repustore API...")
        setLoading(false)
      }, 1000)
    },
    approveOrder: async (orderId: string) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          setLocalOrders((prev) =>
            prev.map((order) =>
              order.id === orderId
                ? { ...order, status: "Aprobada" as OrderStatus }
                : order
            )
          )
          console.log("✅ Orden aprobada:", orderId)
          resolve(true)
        }, 600)
      })
    },
    updateOrderStatus: async (orderId: string, status: OrderStatus) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          setLocalOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, status } : order
            )
          )
          console.log("⚡ Estado actualizado:", orderId, status)
          resolve(true)
        }, 600)
      })
    },
    setPage: (page: number) => console.log("📄 Página:", page),
    clearError: () => setError(null),
  }
}

const OrdersTable: React.FC = () => {
  const {
    orders,
    loading,
    error,
    totalOrders,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchOrders,
    filterByStatus,
    refreshOrders,

    setPage,
    clearError,
  } = useOrders({
    initialParams: { limit: 10 },
    autoFetch: true,
  })

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null)

  // Manejar búsqueda con debounce
  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term)
    if (term.length > 2 || term.length === 0) {
      await searchOrders(term)
    }
  }

  // Manejar filtro por estado
  const handleStatusFilter = async (
    status: OrderStatus | null
  ): Promise<void> => {
    setStatusFilter(status)
    await filterByStatus(status)
  }

  // Manejar ver detalle de orden
  const handleViewDetails = (orderId: string): void => {
    console.log("🔍 Ver detalles de orden:", orderId)
    // Aquí navegarías a la vista de detalle
    // router.push(`/admin/orders/${orderId}`);
  }

  // Obtener badge de estado
  const getStatusBadge = (status: OrderStatus): JSX.Element => {
    const statusStyles: Record<OrderStatus, string> = {
      "En Preparacion": "bg-blue-100 text-blue-800 border-blue-200",
      Aprobada: "bg-green-100 text-green-800 border-green-200",
      "En Transito": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Entregada: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Cancelada: "bg-red-100 text-red-800 border-red-200",
    }

    const style = statusStyles[status] || statusStyles["En Preparacion"]

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
      >
        {status}
      </span>
    )
  }

  // Formatear precio colombiano
  const formatPrice = (price: number, currency: string = "COP"): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Formatear fecha en formato colombiano con "de"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("es-CO", { month: "short" })
    const year = date.getFullYear()

    return `${day} de ${month} de ${year}`
  }

  // Formatear hora en formato colombiano
  const formatTime = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s/g, " ") // Asegurar espacios correctos
  }

  // Props para el componente de error
  interface ErrorMessageProps {
    message: string
    onClose: () => void
  }

  // Componente de error
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Órdenes de Repustore
          </h3>
          <p className="text-sm text-gray-500 mt-1">Cargando órdenes...</p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestión de Órdenes - Repustore
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Administra todas las órdenes de repuestos para autos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total de órdenes</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de orden, cliente o email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearch(e.target.value)
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleStatusFilter((e.target.value as OrderStatus) || null)
                }
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading}
              >
                <option value="">Todos los estados</option>
                <option value="En Preparacion">En Preparación</option>
                <option value="Aprobada">Aprobada</option>
                <option value="En Transito">En Tránsito</option>
                <option value="Entregada">Entregada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <button
              onClick={refreshOrders}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <ErrorMessage
              message={error}
              onClose={clearError}
            />
          )}

          {/* Tabla de órdenes */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      {loading
                        ? "Buscando órdenes..."
                        : "No se encontraron órdenes"}
                    </td>
                  </tr>
                ) : (
                  orders.map((order: Order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber
                              ? order.orderNumber
                              : `RP-${order.id.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer
                                ? order.customer.name
                                : "Cliente sin datos"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer
                                ? order.customer.email
                                : "Email no disponible"}
                            </div>
                            {order.customer?.phone && (
                              <div className="text-xs text-gray-400">
                                {order.customer.phone}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              UserID: {order.userId.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} producto
                          {order.items.length !== 1 ? "s" : ""}
                        </div>
                        {order.items.length > 0 ? (
                          <div className="text-xs text-gray-500">
                            {order.items[0]?.productName
                              ? order.items[0].productName
                              : "Producto sin nombre"}
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1} más`}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500">
                            Carrito vacío
                          </div>
                        )}
                        {order.summary.invalidItemsCount > 0 && (
                          <div className="text-xs text-red-500">
                            {order.summary.invalidItemsCount} item(s)
                            inválido(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          {formatPrice(
                            order.summary.grandTotal
                              ? order.summary.grandTotal
                              : order.summary.total,
                            order.summary.currency
                          )}
                        </div>
                        {order.summary.discount > 0 && (
                          <div className="text-xs text-green-600">
                            Desc:{" "}
                            {formatPrice(
                              order.summary.discount,
                              order.summary.currency
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {order.summary.currency}
                          {order.summary.tax > 0 &&
                            ` • IVA: ${formatPrice(
                              order.summary.tax,
                              order.summary.currency
                            )}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(
                          order.status ? order.status : "En Preparacion"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            {order.createdAt ? (
                              <>
                                <div className="font-medium">
                                  {formatDate(order.createdAt)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatTime(order.createdAt)}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400">
                                Fecha no disponible
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Botón ver detalles */}
                          <button
                            onClick={() => handleViewDetails(order.id)}
                            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Ver detalles de la orden"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalle
                          </button>

                          {/* Mostrar badge adicional si es carrito vacío */}
                          {order.items.length === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Vacío
                            </span>
                          )}

                          {/* Mostrar badge si hay items inválidos */}
                          {order.summary.invalidItemsCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              {order.summary.invalidItemsCount} inválido(s)
                            </span>
                          )}

                          {/* Menú más opciones */}
                          <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {orders.length} de {totalOrders} órdenes
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={!hasNextPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersTable
