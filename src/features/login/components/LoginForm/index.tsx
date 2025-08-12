"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
// components/LoginForm.tsx
import React, { useEffect } from "react"
import { Formik, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, LogIn, Mail, Lock, AlertCircle } from "lucide-react"

import { LoginFormValues } from "../../types/login"
import { useRouter } from "next/navigation"
import useAuth from "../../hooks/useAuth"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

// Validación con Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),

  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
})

const initialValues: LoginFormValues = {
  email: "",
  password: "",
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuth()
  const router = useRouter()

  // Limpiar errores al montar
  useEffect(() => {
    clearError()
  }, [clearError])

  // Redirigir si ya está autenticado
  // useEffect(() => {
  //   console.log("🔍 isAuthenticated changed:", isAuthenticated)

  //   if (isAuthenticated) {
  //     console.log("🎉 Usuario autenticado, redirigiendo a /home...")
  //     router.push("/home")

  //     if (onSuccess) {
  //       onSuccess()
  //     }
  //   }
  // }, [isAuthenticated, onSuccess, router])

  // ✅ FUNCIÓN handleSubmit CORREGIDA
  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: any
  ) => {
    try {
      console.log("🔐 Intentando login con:", values.email)

      const result = await login({
        email: values.email.toLowerCase().trim(),
        password: values.password,
      })

      console.log("✅ Login result:", result)
      console.log("🔍 Token en localStorage:", localStorage.getItem("token"))
      console.log("🔍 User en localStorage:", localStorage.getItem("user"))

      // ✅ AHORA SÍ PODEMOS VERIFICAR EL RESULTADO
      if (result && result.token && result.user) {
        console.log("✅ Login exitoso! Datos recibidos:", result)
        router.push("/home")
        return
      }

      // ❌ Si llegamos aquí, algo salió mal
      console.error("❌ Login falló: no se recibió token o usuario válido")
    } catch (err) {
      console.error("❌ Login error:", err)
      // Aquí puedes mostrar un mensaje de error al usuario
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 -mt-20">
      {/* Card limpio y moderno */}
      <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Borde superior rojo elegante */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        <CardHeader className="text-center py-8 bg-white">
          {/* Logo moderno */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20" />
              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-black via-red-600 to-black bg-clip-text text-transparent">
              RepuStore
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 font-medium text-lg">
            Portal de Administración
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 bg-gray-50/30">
          {/* Error - Diseño limpio */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-medium text-sm">
                  {error}
                </span>
              </div>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              isValid,
              dirty,
            }) => (
              <Form className="space-y-6">
                {/* Email - Input moderno */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                  >
                    <Mail className="h-4 w-4 text-red-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                      touched.email && errors.email
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-600 font-medium ml-1"
                  />
                </div>

                {/* Contraseña - Input moderno */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                  >
                    <Lock className="h-4 w-4 text-red-600" />
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                      touched.password && errors.password
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-600 font-medium ml-1"
                  />
                </div>

                {/* Botón premium */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isValid || !dirty}
                  className="relative w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-300 overflow-hidden group disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {/* Efecto hover sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading || isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                </Button>
                <div className="flex justify-center items-center">
                  <Button
                    variant="outline"
                    className="w-94 h-12 rounded-2xl flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  >
                    {/* Icono de Google inline */}
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.59 2.43 30.15 0 24 0 14.64 0 6.4 5.4 2.56 13.22l7.98 6.19C12.12 13.46 17.59 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.08 24.55c0-1.57-.14-3.08-.4-4.55H24v9.02h12.43c-.54 2.92-2.19 5.39-4.67 7.06l7.54 5.84C43.86 37.48 46.08 31.46 46.08 24.55z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.54 28.03c-1.2-3.58-1.2-7.5 0-11.08l-7.98-6.19C-2.33 17.96-2.33 30.04 2.56 38.78l7.98-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.15 0 11.34-2.02 15.12-5.48l-7.54-5.84C29.42 38.3 26.84 39 24 39c-6.41 0-11.88-3.96-14.46-9.91l-7.98 6.19C6.4 42.6 14.64 48 24 48z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </Button>
                </div>

                {/* Link sutil y minimalista */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchToRegister) {
                          onSwitchToRegister()
                        } else {
                          window.location.href = "/register"
                        }
                      }}
                      className="cursor-pointer text-red-600 hover:text-red-700 font-medium transition-colors duration-200 hover:underline"
                      disabled={loading}
                    >
                      Regístrate aquí
                    </button>
                  </p>
                  <div></div>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
