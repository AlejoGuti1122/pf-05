/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import {
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCartContext } from "../../context/index"
import { useOrder } from "../../hooks/useOrders"

const ShoppingCart = () => {
  const router = useRouter()

  // ✅ Helper function para manejar errores de TypeScript
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    return "Error desconocido"
  }

  // ✅ Hook del carrito (existente)
  const {
    cart,
    isLoading: cartLoading,
    error,
    itemCount,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
    validateForCheckout,
  } = useCartContext()

  // ✅ Hook de órdenes
  const { createOrder, isLoading: orderLoading } = useOrder()

  // ✅ Loading combinado
  const isLoading = cartLoading || orderLoading

  // ✅ Calcular totales con validación de undefined
  const subtotal = Number(cart?.total || cart?.subtotal || 0)
  const shipping = subtotal > 500 ? 0 : 29.99
  const tax = subtotal * 0.1
  const finalTotal = subtotal + shipping + tax

  // ✅ ACTUALIZADO: handleCheckout con formato correcto de API
  const handleCheckout = async () => {
    try {
      console.log("🔍 Validando carrito para checkout...")
      const validation = await validateForCheckout()

      const isValidCart =
        validation &&
        validation.status === "ACTIVE" &&
        validation.items &&
        validation.items.length > 0 &&
        validation.total > 0

      if (!isValidCart) {
        toast.error("El carrito no es válido para proceder al checkout")
        console.error("❌ Carrito no válido:", validation)
        return
      }

      console.log("✅ Carrito validado correctamente")

      // ✅ FORMATO CORRECTO: Lo que espera tu API
      const orderData = {
        userId: JSON.parse(localStorage.getItem("user") || "{}").id, // TODO: Obtener del contexto de usuario
        products: validation.items.map((item: any) => ({
          id: item.product.id, // Usar el ID del producto
        })),
      }

      console.log("🛒 Creando orden con datos adaptados:", orderData)

      const newOrder = await createOrder(orderData)

      console.log("✅ Orden creada exitosamente:", newOrder.id)

      // Limpiar carrito después de crear la orden
      await clearCart()

      toast.success(`¡Orden #${newOrder.id} creada exitosamente!`)

      // Redirigir a página de confirmación
      // router.push(`/order-confirmation/${newOrder.id}`)
    } catch (error) {
      console.error("❌ Error en checkout:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(`Error en checkout: ${errorMessage}`)
    }
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  // Estado de carga
  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <p className="text-red-600 mb-4">
            Error al cargar el carrito: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 flex items-center justify-center gap-3">
            <ShoppingBag className="w-8 h-8 text-red-600" />
            Carrito de Compras
          </h1>
          <p className="text-gray-600">Revisa tus productos seleccionados</p>
        </div>

        {/* Empty Cart State */}
        {isEmpty && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Descubre nuestros productos y agrega algunos al carrito!
              </p>
              <button
                onClick={() => router.push("/home")}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Explorar Productos
              </button>
            </div>
          </div>
        )}

        {/* Cart with Items */}
        {!isEmpty && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">
                    Productos ({itemCount})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Vaciar carrito
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart?.items?.map((item) => {
                    // ✅ Acceder a los datos del producto anidado
                    const itemPrice = Number(item.product?.price) || 0
                    const itemQuantity = Number(item.quantity) || 1
                    const itemName = item.product?.name || "Producto sin nombre"
                    const itemImage = item.product?.imageUrl

                    return (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {itemImage ? (
                              <Image
                                src={itemImage}
                                alt={itemName}
                                width={80}
                                height={80}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src =
                                    "https://via.placeholder.com/80x80/f1f5f9/64748b?text=Sin+Imagen"
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-black text-lg mb-1 truncate">
                              {itemName}
                            </h3>
                            <p className="text-red-600 font-bold text-xl mb-3">
                              ${itemPrice.toFixed(2)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Cantidad:
                                </span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        itemQuantity - 1
                                      )
                                    }
                                    disabled={isLoading || itemQuantity <= 1}
                                    className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                    {itemQuantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        itemQuantity + 1
                                      )
                                    }
                                    disabled={isLoading}
                                    className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right sm:text-left">
                            <p className="text-lg font-bold text-black">
                              ${(itemPrice * itemQuantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-8">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-black">
                    Resumen del Pedido
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-semibold text-black">
                      {shipping === 0 ? (
                        <span className="text-green-600">¡Gratis!</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="font-semibold text-black">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-black">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        💡 Agrega ${(500 - subtotal).toFixed(2)} más para envío
                        gratuito
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 space-y-3">
                  {/* ✅ Botón de checkout actualizado */}
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || isEmpty}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {orderLoading ? "Creando orden..." : "Procesando..."}
                      </>
                    ) : (
                      <>
                        Proceder al Checkout
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push("/home")}
                    className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>

                <div className="p-6 pt-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-2">
                      🔒 Compra Segura
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Pago 100% seguro</li>
                      <li>✓ Envío con seguimiento</li>
                      <li>✓ Garantía de devolución</li>
                      <li>✓ Checkout rápido y automático</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart
