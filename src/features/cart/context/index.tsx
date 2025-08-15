/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/CartContext.tsx

"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react"
import { toast } from "sonner"
import { AddItemToCartRequest, Cart } from "../types/cart"
import { cartService } from "../services/services-cart"

// Tipos para el contexto
interface CartContextType {
  // Estado
  cart: Cart | null
  isLoading: boolean
  error: string | null

  // Computed values
  itemCount: number
  total: number
  isEmpty: boolean

  // Acciones
  addItem: (data: AddItemToCartRequest) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  mergeCarts: () => Promise<void>
  validateForCheckout: () => Promise<any>
  refetch: () => Promise<void>
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Props del provider
interface CartProviderProps {
  children: ReactNode
}

// Provider del carrito
export function CartProvider({ children }: CartProviderProps) {
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
      console.log("🔄 [CONTEXT] Cargando carrito...") // Debug

      const response = await cartService.getCurrentCart()
      console.log("📦 [CONTEXT] Respuesta cruda del servicio:", response) // Debug

      let cartData: Cart | null = null

      if (response && typeof response === "object" && "data" in response) {
        cartData = response.data as Cart
      } else {
        cartData = response as Cart
      }

      console.log("📦 [CONTEXT] Carrito adaptado:", cartData) // Debug
      console.log(
        "📦 [CONTEXT] Items en carrito:",
        cartData?.items?.length || 0
      ) // Debug

      setCart(cartData)
      console.log("✅ [CONTEXT] Estado del carrito actualizado") // Debug
    } catch (error) {
      console.error("❌ [CONTEXT] Error cargando carrito:", error) // Debug
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
        console.log("🛒 [CONTEXT] Agregando al carrito:", data) // Debug

        const addResponse = await cartService.addItem(data)
        console.log("✅ [CONTEXT] Respuesta de agregar item:", addResponse) // Debug

        // Refrescar el carrito después de agregar
        console.log("🔄 [CONTEXT] Refrescando carrito después de agregar...") // Debug
        await fetchCart()

        console.log(
          "🎯 [CONTEXT] Carrito refrescado, verificando nuevo estado..."
        ) // Debug
        toast.success("Producto agregado al carrito correctamente")
      } catch (error) {
        console.error("❌ [CONTEXT] Error agregando al carrito:", error) // Debug
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

  // Fusionar carritos
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

  // Computed values con useMemo
  const itemCount = useMemo(() => {
    const count = cart?.items?.length || 0
    console.log(
      "🎯 [CONTEXT] Calculando itemCount:",
      count,
      "desde items:",
      cart?.items
    ) // Debug
    return count
  }, [cart?.items])

  const total = useMemo(() => {
    const totalValue = cart?.total || cart?.subtotal || 0
    console.log("🎯 [CONTEXT] Calculando total:", totalValue) // Debug
    return totalValue
  }, [cart?.total, cart?.subtotal])

  const isEmpty = useMemo(() => {
    const empty = itemCount === 0
    console.log("🎯 [CONTEXT] Calculando isEmpty:", empty) // Debug
    return empty
  }, [itemCount])

  // Debug effects
  useEffect(() => {
    console.log("🔔 [CONTEXT] itemCount cambió a:", itemCount)
  }, [itemCount])

  useEffect(() => {
    console.log("🔔 [CONTEXT] Cart cambió:", cart)
  }, [cart])

  console.log("🎯 [CONTEXT] Valores actuales:", {
    itemCount,
    total,
    isEmpty,
  }) // Debug

  // Valor del contexto
  const contextValue: CartContextType = {
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

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext)

  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }

  return context
}
