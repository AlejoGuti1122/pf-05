"use client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuth from "../../hooks/useAuth"

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const ButtonGoogle = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth() // Tu hook existente

  // Detectar cuando regresa de Google (el backend ya manejó todo)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    const success = urlParams.get("success")
    const error = urlParams.get("error")

    // Debug: ver qué parámetros llegan
    console.log("🔍 URL Params:", {
      token: token,
      success: success,
      error: error,
      fullURL: window.location.href,
    })

    // Si hay token en la URL (formato del backend)
    if (token) {
      console.log("🎯 Token detectado:", token)

      // Verificar si es el objeto malformado
      if (
        token === "[object Object]" ||
        token.includes("[object") ||
        token.includes("Object]")
      ) {
        console.error("❌ Token malformado detectado:", token)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
        return
      }

      try {
        // Decodificar el token si viene URL encoded
        const decodedToken = decodeURIComponent(token)
        console.log("🔓 Token decodificado:", decodedToken)

        // Si el token viene como string JSON, parsearlo
        let finalToken = decodedToken
        if (decodedToken.startsWith("{")) {
          const tokenData = JSON.parse(decodedToken)
          console.log("📦 Token parseado:", tokenData)
          finalToken = tokenData.token || tokenData.access_token || decodedToken
        }

        console.log("✅ Token final a guardar:", finalToken)

        // Guardar en localStorage como lo hace tu sistema
        localStorage.setItem("token", finalToken)
        console.log("💾 Token guardado en localStorage")

        // Limpiar URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
        console.log("🧹 URL limpiada")

        // Recargar para que useAuth detecte el cambio
        console.log("🔄 Recargando página...")
        window.location.reload()
      } catch (error) {
        console.error("❌ Error procesando token:", error)
        // Limpiar URL con error
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
      }
    }
    // Si hay success parameter
    else if (success === "true") {
      console.log("✅ Success detectado")
      // Limpiar URL de parámetros
      window.history.replaceState({}, document.title, window.location.pathname)

      // El backend ya guardó todo, forzar actualización y redirigir
      window.location.reload()
    }
    // Si hay error
    else if (error) {
      console.error("❌ Error en Google Auth:", error)
      // Limpiar URL si hay error
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Usar la variable de entorno
    const apiUrl = process.env.API_URL || "https://pf-grupo5-8.onrender.com"
    window.location.href = `${apiUrl}/auth/google/redirect`
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="outline"
          className="w-94 h-12 rounded-2xl flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium">
            {isLoading ? "Conectando..." : "Continuar con Google"}
          </span>
        </Button>
      </div>
    </div>
  )
}

export default ButtonGoogle
