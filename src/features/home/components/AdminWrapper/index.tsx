// components/AdminProtectedWrapper.tsx
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react"
import useAuth from "@/features/login/hooks/useAuth"

interface AdminProtectedWrapperProps {
  children: React.ReactNode
  redirectTo?: string
}

const AdminProtectedWrapper: React.FC<AdminProtectedWrapperProps> = ({
  children,
  redirectTo = "/home",
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si terminó de cargar y no es admin, redirigir
    if (!loading && (!user || user.isAdmin !== true)) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Verificando permisos...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras validamos tu acceso
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay usuario o no es admin, mostrar mensaje antes del redirect
  if (!user || user.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border-l-4 border-red-500">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-red-600 mb-4">
              {!user
                ? "Debes iniciar sesión para acceder a esta página"
                : "Solo los administradores pueden acceder a esta página"}
            </p>
            <div className="text-sm text-gray-500">Redirigiendo...</div>
          </div>
        </div>
      </div>
    )
  }

  // Si es admin, mostrar el contenido
  return (
    <>
      {/* Header de confirmación admin */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>
            Sesión de administrador activa - {user.name || user.email}
          </span>
        </div>
      </div>

      {/* Contenido protegido */}
      {children}
    </>
  )
}

export default AdminProtectedWrapper
