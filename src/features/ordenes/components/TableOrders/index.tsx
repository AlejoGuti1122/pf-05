/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Eye,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { Order, OrderStatus } from "../../types/orders"
import useOrders from "../../hooks/useOrders"
import OrderDetailModal from "../ModalOrdersDetail"
import useOrderActions from "../../hooks/useAprobbed"

const OrdersTable: React.FC = () => {
  const {
    orders = [], // Valor por defecto para evitar undefined
    loading,
    error,
    totalOrders,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchOrders,
    refreshOrders,
    setPage,
    clearError,
  } = useOrders({
    // Quitar initialParams ya que tu backend no los usa
    autoFetch: true,
  })

  // Hook para acciones de órdenes
  const { isApproving, approveError, approveOrder, clearErrors, isUserAdmin } =
    useOrderActions()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Estados para el modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Manejar búsqueda con debounce
  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term)
    if (term.length > 2 || term.length === 0) {
      await searchOrders(term)
    }
  }

  // Manejar aprobación de orden
  const handleApproveOrder = async (orderId: string): Promise<void> => {
    setActionLoading(orderId)
    clearErrors() // Limpiar errores previos

    try {
      const success = await approveOrder(orderId)
      if (success) {
        toast.success("🎉 Orden aprobada correctamente")
        // Refrescar la lista de órdenes para mostrar el nuevo estado
        await refreshOrders()
      } else {
        // El error ya está manejado en el hook
        toast.error(approveError || "Error al aprobar la orden")
      }
    } catch (error) {
      console.error("Error inesperado aprobando orden:", error)
      toast.error("Error inesperado al aprobar la orden")
    } finally {
      setActionLoading(null)
    }
  }

  // Manejar ver detalle de orden
  const handleViewDetails = (order: any): void => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  // Cerrar modal
  const handleCloseModal = (): void => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  // Función para mapear estados del backend al frontend
  const mapBackendStatus = (backendStatus: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      onPreparation: "En Preparacion",
      approved: "Aprobada",
      inTransit: "En Transito",
      delivered: "Entregada",
      cancelled: "Cancelada",
      returned: "Devuelta",
    }
    return statusMap[backendStatus] || "En Preparacion"
  }

  // Obtener badge de estado
  const getStatusBadge = (status: OrderStatus): JSX.Element => {
    const statusStyles: Record<OrderStatus, string> = {
      "En Preparacion": "bg-blue-100 text-blue-800 border-blue-200",
      Aprobada: "bg-green-100 text-green-800 border-green-200",
      "En Transito": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Entregada: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Cancelada: "bg-red-100 text-red-800 border-red-200",
      Devuelta: "bg-orange-100 text-orange-800 border-orange-200",
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
      .replace(/\s/g, " ")
  }

  // Componente de error
  const ErrorMessage: React.FC<{ message: string; onClose: () => void }> = ({
    message,
    onClose,
  }) => (
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

      {/* Modal de detalles */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  )

  // Validación de seguridad para orders
  const safeOrders = Array.isArray(orders) ? orders : []

  if (loading && safeOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Órdenes Pendientes de Aprobación
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
                Órdenes Pendientes de Aprobación
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona las órdenes que requieren aprobación administrativa
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Órdenes pendientes</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Barra de búsqueda */}
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

          {/* Mostrar error de aprobación si existe */}
          {approveError && (
            <ErrorMessage
              message={`Error al aprobar orden: ${approveError}`}
              onClose={clearErrors}
            />
          )}

          {/* Mostrar error si existe */}
          {error && (
            <ErrorMessage
              message={error}
              onClose={clearError}
            />
          )}

          {/* Debug temporal */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Debug: Órdenes recibidas: {safeOrders.length} | Loading:{" "}
              {loading ? "Sí" : "No"} | Error: {error || "Ninguno"}
            </p>
          </div>

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
                {safeOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      {loading
                        ? "Buscando órdenes..."
                        : "No hay órdenes disponibles. Verifica tu base de datos o crea una orden de prueba."}
                    </td>
                  </tr>
                ) : (
                  safeOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber
                              ? order.orderNumber
                              : `RP-${order.id?.slice(0, 8) || "unknown"}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order.id?.slice(0, 8) || "N/A"}...
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
                              {order.user?.name || "Cliente sin datos"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || "Email no disponible"}
                            </div>
                            {order.user?.phone && (
                              <div className="text-xs text-gray-400">
                                {order.user.phone}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              UserID: {order.user?.id?.slice(0, 8) || "N/A"}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.orderDetails?.products?.length || 0} producto
                          {(order.orderDetails?.products?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </div>
                        {order.orderDetails?.products?.length > 0 ? (
                          <div className="text-xs text-gray-500">
                            {order.orderDetails.products[0]?.name ||
                              "Producto sin nombre"}
                            {order.orderDetails.products.length > 1 &&
                              ` +${order.orderDetails.products.length - 1} más`}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500">
                            Carrito vacío
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          {formatPrice(
                            parseFloat(order.orderDetails?.price || "0"),
                            "COP"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(
                          mapBackendStatus(order.status || "onPreparation")
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            {order.date ? (
                              <>
                                <div className="font-medium">
                                  {formatDate(order.date)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatTime(order.date)}
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
                            onClick={() => handleViewDetails(order)}
                            className="inline-flex items-center p-2 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Ver detalles de la orden"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Botón aprobar - solo si está en preparación Y es admin */}
                          {order.status === "onPreparation" && isUserAdmin && (
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={
                                actionLoading === order.id || isApproving
                              }
                              className="inline-flex items-center px-3 py-1 border border-green-300 rounded text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Aprobar orden"
                            >
                              {actionLoading === order.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              {actionLoading === order.id
                                ? "Aprobando..."
                                : "Aprobar"}
                            </button>
                          )}

                          {/* Mostrar mensaje si no es admin */}
                          {order.status === "onPreparation" && !isUserAdmin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              Solo Admin
                            </span>
                          )}

                          {/* Mostrar badge adicional si es carrito vacío */}
                          {(order.orderDetails?.products?.length || 0) ===
                            0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Vacío
                            </span>
                          )}
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
              Mostrando {safeOrders.length} de {totalOrders || 0} órdenes
              pendientes
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((currentPage || 1) - 1)}
                disabled={!hasPrevPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage || 1} de {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((currentPage || 1) + 1)}
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
