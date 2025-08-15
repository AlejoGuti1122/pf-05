/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useOrder.ts

"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { CreateOrderRequest, Order, UseOrderReturn } from "../types/orders"
import { orderService } from "../services/orders-service"

export const useOrder = (): UseOrderReturn => {
  const [order, setOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage
    setError(message)
    toast.error(message)
    console.error("❌ [useOrder] Error:", error)
  }, [])

  // Crear nueva orden
  const createOrder = useCallback(
    async (orderData: CreateOrderRequest): Promise<Order> => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("🛒 [useOrder] Creando orden:", orderData)

        const newOrder = await orderService.createOrder(orderData)

        console.log("✅ [useOrder] Orden creada:", newOrder)
        setOrder(newOrder)

        // Agregar a la lista de órdenes si ya está cargada
        setOrders((prev) => [newOrder, ...prev])

        toast.success("¡Orden creada exitosamente!")
        return newOrder
      } catch (error) {
        handleError(error, "Error al crear la orden")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  // Obtener orden por ID
  const getOrder = useCallback(
    async (orderId: string): Promise<Order> => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("🔍 [useOrder] Obteniendo orden:", orderId)

        const orderData = await orderService.getOrder(orderId)

        console.log("✅ [useOrder] Orden obtenida:", orderData)
        setOrder(orderData)

        return orderData
      } catch (error) {
        handleError(error, "Error al obtener la orden")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  // Obtener todas las órdenes del usuario
  const getUserOrders = useCallback(async (): Promise<Order[]> => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("📋 [useOrder] Obteniendo órdenes del usuario")

      const userOrders = await orderService.getUserOrders()

      console.log("✅ [useOrder] Órdenes obtenidas:", userOrders.length)
      setOrders(userOrders)

      return userOrders
    } catch (error) {
      handleError(error, "Error al obtener las órdenes")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Cancelar orden
  const cancelOrder = useCallback(
    async (orderId: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("❌ [useOrder] Cancelando orden:", orderId)

        await orderService.cancelOrder(orderId)

        // Actualizar estado local
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: "CANCELLED" as any }
              : order
          )
        )

        if (order?.id === orderId) {
          setOrder((prev) =>
            prev ? { ...prev, status: "CANCELLED" as any } : null
          )
        }

        toast.success("Orden cancelada exitosamente")
      } catch (error) {
        handleError(error, "Error al cancelar la orden")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError, order]
  )

  // Refrescar datos
  const refetch = useCallback(async () => {
    try {
      await getUserOrders()
    } catch (error) {
      console.error("Error al refrescar órdenes:", error)
    }
  }, [getUserOrders])

  // Computed values con useMemo
  const computedValues = useMemo(
    () => ({
      hasOrders: orders.length > 0,
      pendingOrders: orders.filter((order) => order.status === "PENDING"),
      completedOrders: orders.filter((order) => order.status === "DELIVERED"),
      totalSpent: orders
        .filter((order) => order.status !== "CANCELLED")
        .reduce((sum, order) => sum + order.total, 0),
    }),
    [orders]
  )

  // Debug logs
  console.log("🎯 [useOrder] Estado actual:", {
    orderCount: orders.length,
    currentOrder: order?.id,
    isLoading,
    error,
    ...computedValues,
  })

  return {
    // Estado básico
    order,
    orders,
    isLoading,
    error,

    // Acciones
    createOrder,
    getOrder,
    getUserOrders,
    cancelOrder,
    refetch,

    // Valores computados (opcional, para mayor funcionalidad)
    ...computedValues,
  }
}
