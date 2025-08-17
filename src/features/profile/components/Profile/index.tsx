/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react"
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  User,
  Calendar,
  DollarSign,
  Star,
  Trash2,
  Eye,
} from "lucide-react"

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("orders")
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Estados para órdenes - estructura corregida según tu backend
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Estados para favoritos - conectados al backend
  const [favorites, setFavorites] = useState<any[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  // Efecto para obtener datos del usuario solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      setUser(userData)
      setUserId(userData.id || "")
      setIsInitialized(true)
    }
  }, [])

  // Función para obtener órdenes
  const fetchOrders = async () => {
    if (!userId) return

    setOrdersLoading(true)
    setOrdersError(null)

    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") || localStorage.getItem("authToken")
          }`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar órdenes")
      }

      const userData = await response.json()
      setOrders(userData.orders || [])
    } catch (error: any) {
      setOrdersError(error.message)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Función para obtener favoritos (ajusta el endpoint según tu backend)
  const fetchFavorites = async () => {
    if (!userId) return

    setFavoritesLoading(true)
    setFavoritesError(null)

    try {
      const response = await fetch(
        `http://localhost:3001/users/${userId}/favorites`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || localStorage.getItem("authToken")
            }`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Error al cargar favoritos")
      }

      const favoritesData = await response.json()
      setFavorites(favoritesData || [])
    } catch (error: any) {
      setFavoritesError(error.message)
      // Si no hay endpoint de favoritos, mantener array vacío
      setFavorites([])
    } finally {
      setFavoritesLoading(false)
    }
  }

  useEffect(() => {
    if (userId && isInitialized) {
      fetchOrders()
      // Comentado hasta que sepamos el endpoint correcto de favoritos
      // fetchFavorites();
    }
  }, [userId, isInitialized])

  // Funciones helper actualizadas según tu estructura de datos
  const getTotalSpent = () => {
    // Como no tienes campo 'total' en las órdenes, simulamos un cálculo
    return orders.length * 50 // Placeholder - ajusta según tu lógica
  }

  const getRecentOrders = (limit = 10) => {
    return orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status)
  }

  const totalOrders = orders.length

  // Estados para favoritos (simulados - ajusta según tu API)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Package className="w-4 h-4 text-yellow-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado"
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const removeFavorite = async (productId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/users/${userId}/favorites/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || localStorage.getItem("authToken")
            }`,
          },
        }
      )

      if (response.ok) {
        setFavorites((prev) => prev.filter((item) => item.id !== productId))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  // Loading inicial mientras se obtienen los datos del usuario
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de inicializar
  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            No se encontró información del usuario
          </h3>
          <p className="text-gray-600">Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header del perfil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                ¡Hola, {user.name || user.email || "Usuario"}!
              </h1>
              <p className="text-gray-600">Bienvenido a tu perfil personal</p>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Órdenes
                </p>
                <p className="text-2xl font-bold text-black">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Gastado
                </p>
                <p className="text-2xl font-bold text-black">
                  ${getTotalSpent().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-black">
                  {favorites.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-black">
                  {getOrdersByStatus("approved").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "orders"
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Mis Órdenes
                </div>
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "favorites"
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favoritos
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab de Órdenes */}
            {activeTab === "orders" && (
              <div>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-600">
                      Cargando órdenes...
                    </span>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error: {ordersError}</p>
                    <button
                      onClick={fetchOrders}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">
                      No tienes órdenes aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Cuando realices tu primera compra, aparecerá aquí.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getRecentOrders(10).map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-black">
                                Orden #{order.id}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                ID: {order.id.substring(0, 8)}...
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                <span className="text-sm text-gray-700">
                                  Orden procesada exitosamente
                                </span>
                              </div>
                              {order.mpPaymentId && (
                                <div className="flex items-center gap-2 bg-blue-100 rounded-lg p-2">
                                  <span className="text-sm text-blue-700">
                                    Pago ID: {order.mpPaymentId}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600 mb-2">
                              Estado: {getStatusText(order.status)}
                            </p>
                            <button className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium">
                              <Eye className="w-4 h-4" />
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab de Favoritos */}
            {activeTab === "favorites" && (
              <div>
                {favoritesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-600">
                      Cargando favoritos...
                    </span>
                  </div>
                ) : favoritesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error: {favoritesError}</p>
                    <button
                      onClick={fetchFavorites}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">
                      No tienes favoritos aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Agrega productos a favoritos para verlos aquí.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="relative mb-4">
                          <img
                            src={
                              product.image ||
                              product.imgUrl ||
                              "https://via.placeholder.com/200x200"
                            }
                            alt={product.name || "Producto"}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeFavorite(product.id)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          {!product.inStock &&
                            product.inStock !== undefined && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  Sin Stock
                                </span>
                              </div>
                            )}
                        </div>

                        <h3 className="font-semibold text-black mb-2">
                          {product.name || "Producto sin nombre"}
                        </h3>
                        <p className="text-2xl font-bold text-red-600 mb-4">
                          ${(product.price || 0).toFixed(2)}
                        </p>

                        <div className="flex gap-2">
                          <button
                            disabled={product.inStock === false}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            {product.inStock === false
                              ? "Sin Stock"
                              : "Agregar al Carrito"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
