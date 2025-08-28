/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCart.ts

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { AddItemToCartRequest, Cart } from "../types/cart"
import { cartService } from "../services/services-cart"

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage
    setError(message)
    toast.error(message)
  }, [])

  // Cargar carrito inicial
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🔄 Cargando carrito...") // Debug

      // ✅ Llamar directamente al API y adaptar la respuesta
      const response = await cartService.getCurrentCart()

      console.log("📦 Respuesta cruda del servicio:", response) // Debug

      // ✅ Adaptar la respuesta según lo que devuelve tu API
      let cartData: Cart | null = null

      // Si la respuesta tiene .data, usarlo, sino usar la respuesta directamente
      if (response && typeof response === "object" && "data" in response) {
        cartData = response.data as Cart
      } else {
        cartData = response as Cart
      }

      console.log("📦 Carrito adaptado:", cartData) // Debug
      console.log("📦 Claves del carrito:", Object.keys(cartData || {})) // Debug
      console.log("📦 Items en carrito:", cartData?.items?.length || 0) // Debug

      setCart(cartData)

      // ✅ AGREGAR: Log después de actualizar el estado
      console.log("✅ Estado del carrito actualizado") // Debug
    } catch (error) {
      console.error("❌ Error cargando carrito:", error) // Debug
      handleError(error, "Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Agregar item al carrito
  const addItem = useCallback(
    async (data: AddItemToCartRequest) => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("🛒 Agregando al carrito:", data) // Debug

        const addResponse = await cartService.addItem(data)
        console.log("✅ Respuesta de agregar item:", addResponse) // Debug

        // Refrescar el carrito después de agregar
        console.log("🔄 Refrescando carrito después de agregar...") // Debug
        await fetchCart()

        console.log("🎯 Carrito refrescado, verificando nuevo estado...") // Debug

        toast.success("Producto agregado al carrito correctamente")
      } catch (error) {
        console.error("❌ Error agregando al carrito:", error) // Debug
        handleError(error, "Error al agregar producto al carrito")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // Actualizar cantidad de un item
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setIsLoading(true)
        setError(null)

        await cartService.updateItemQuantity(itemId, { quantity })

        // Refrescar el carrito
        await fetchCart()

        toast.success("Cantidad actualizada correctamente")
      } catch (error) {
        handleError(error, "Error al actualizar la cantidad")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // Eliminar item del carrito
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setIsLoading(true)
        setError(null)

        await cartService.removeItem(itemId)

        // Refrescar el carrito
        await fetchCart()

        toast.success("Producto eliminado del carrito correctamente")
      } catch (error) {
        handleError(error, "Error al eliminar el producto")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart, handleError]
  )

  // Vaciar carrito completo
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      await cartService.clearCart()
      setCart(null)

      toast.success("Se eliminaron todos los productos del carrito")
    } catch (error) {
      handleError(error, "Error al vaciar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Refrescar/revalidar carrito
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.refreshCart()
      setCart(response.data)

      toast.success("Los precios y stock se han actualizado")
    } catch (error) {
      handleError(error, "Error al actualizar el carrito")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Fusionar carritos (útil cuando un guest se registra)
  const mergeCarts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await cartService.mergeCarts()
      setCart(response.data)

      toast.success("Los carritos se fusionaron correctamente")
    } catch (error) {
      handleError(error, "Error al fusionar los carritos")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Validar carrito para checkout
  const validateForCheckout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await cartService.validateCartForCheckout()

      if (!result.valid && result.errors) {
        toast.error(`Carrito no válido: ${result.errors.join(", ")}`)
      }

      return result
    } catch (error) {
      handleError(error, "Error al validar el carrito")
      return { success: false, valid: false }
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Cargar carrito al montar el componente
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ✅ CORREGIDO: Computed values con useMemo para mejor reactividad
  const itemCount = useMemo(() => {
    const count = cart?.items?.length || 0
    console.log("🎯 Calculando itemCount:", count, "desde items:", cart?.items) // Debug
    return count
  }, [cart?.items])

  const total = useMemo(() => {
    // ✅ CORREGIDO: Acceder al total desde cart.summary según la estructura real
    const totalValue = cart?.summary?.total || cart?.summary?.subtotal || 0
    console.log("🎯 Calculando total:", totalValue) // Debug
    return totalValue
  }, [cart?.summary?.total, cart?.summary?.subtotal]) // ✅ CORREGIDO: Dependencias correctas

  const isEmpty = useMemo(() => {
    const empty = itemCount === 0
    console.log("🎯 Calculando isEmpty:", empty) // Debug
    return empty
  }, [itemCount])

  // ✅ AGREGAR: useEffect para debug cuando cambia el itemCount
  useEffect(() => {
    console.log("🔔 itemCount cambió a:", itemCount)
  }, [itemCount])

  // ✅ AGREGAR: useEffect para debug cuando cambia el cart
  useEffect(() => {
    console.log("🔔 Cart cambió:", cart)
  }, [cart])

  console.log("🎯 Hook useCart - Valores actuales:", {
    itemCount,
    total,
    isEmpty,
  }) // Debug
  console.log("🎯 Cart items actuales:", cart?.items) // Debug

  return {
    // Estado
    cart,
    isLoading,
    error,

    // Computed values
    itemCount,
    total,
    isEmpty,

    // Acciones
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    mergeCarts,
    validateForCheckout,
    refetch: fetchCart,
  }
}
