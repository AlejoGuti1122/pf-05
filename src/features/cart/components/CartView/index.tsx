"use client"

import React, { useState } from "react"
import { Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react"
import Image from "next/image"

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Auriculares Bluetooth Pro",
      price: 299.99,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Smartphone Galaxy X",
      price: 899.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Laptop Gaming Elite",
      price: 1299.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop&crop=center",
    },
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const shipping = subtotal > 500 ? 0 : 29.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-black">
                  Productos ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={20}
                          height={20}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-black text-lg mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-red-600 font-bold text-xl mb-3">
                          ${item.price.toFixed(2)}
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
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right sm:text-left">
                        <p className="text-lg font-bold text-black">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                      ${total.toFixed(2)}
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
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group">
                  Proceder al Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
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
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Cart State */}
        {cartItems.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Descubre nuestros productos y agrega algunos al carrito!
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Explorar Productos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart
