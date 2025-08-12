"use client"

import React, { useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  CreditCard,
  Package,
  Heart,
  Settings,
  LogOut,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+57 300 123 4567",
    address: "Carrera 23 #45-67, Manizales, Caldas",
    birthDate: "1992-05-15",
    joinDate: "2023-01-15",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b3-5c?w=150&h=150&fit=crop&crop=face",
  })

  const [tempData, setTempData] = useState({ ...profileData })

  const handleSave = () => {
    setProfileData({ ...tempData })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData({ ...profileData })
    setIsEditing(false)
  }

  const stats = [
    { label: "Pedidos", value: "24", icon: Package },
    { label: "Favoritos", value: "18", icon: Heart },
    { label: "Puntos", value: "2,450", icon: CheckCircle },
  ]

  const menuItems = [
    { id: "profile", label: "Mi Perfil", icon: User },
    { id: "orders", label: "Mis Pedidos", icon: Package },
    { id: "favorites", label: "Favoritos", icon: Heart },
    { id: "payments", label: "Métodos de Pago", icon: CreditCard },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "settings", label: "Configuración", icon: Settings },
  ]

  const recentOrders = [
    {
      id: "#ORD-001",
      date: "2025-08-10",
      status: "Entregado",
      total: "$299.99",
    },
    {
      id: "#ORD-002",
      date: "2025-08-05",
      status: "En tránsito",
      total: "$150.00",
    },
    {
      id: "#ORD-003",
      date: "2025-07-28",
      status: "Entregado",
      total: "$89.99",
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Image
                    src={profileData.avatar}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="w-24 h-24 rounded-full border-4 border-red-100 object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-black mb-1">
                    {profileData.name}
                  </h2>
                  <p className="text-gray-600 mb-2">Cliente Premium</p>
                  <p className="text-sm text-gray-500">
                    Miembro desde{" "}
                    {new Date(profileData.joinDate).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditing
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isEditing ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-gray-100 p-6 text-center"
                >
                  <stat.icon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-black mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-black mb-6">
                Información Personal
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) =>
                        setTempData({ ...tempData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-black">
                      {profileData.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) =>
                        setTempData({ ...tempData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-black">
                      {profileData.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) =>
                        setTempData({ ...tempData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-black">
                      {profileData.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Nacimiento
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tempData.birthDate}
                      onChange={(e) =>
                        setTempData({ ...tempData, birthDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-black">
                      {new Date(profileData.birthDate).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.address}
                      onChange={(e) =>
                        setTempData({ ...tempData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-black">
                      {profileData.address}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case "orders":
        return (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-black">
                Pedidos Recientes
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-semibold text-black">{order.id}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "Entregado"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="font-bold text-red-600 mt-1">
                        {order.total}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">
              Próximamente
            </h3>
            <p className="text-gray-600">
              Esta sección estará disponible pronto.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-15">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="p-6 bg-gradient-to-r from-red-600 to-red-700">
                <div className="text-center">
                  <Image
                    src={profileData.avatar}
                    alt="Avatar"
                    width={20}
                    height={20}
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-3 border-white"
                  />
                  <h2 className="font-semibold text-white">
                    {profileData.name}
                  </h2>
                  <p className="text-red-100 text-sm">Cliente Premium</p>
                </div>
              </div>

              <nav className="p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}

                <hr className="my-4 border-gray-200" />

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
