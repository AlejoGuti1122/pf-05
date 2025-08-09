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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, Mail, Lock, AlertCircle } from "lucide-react"

import { LoginFormValues } from "../../types/login"
import { useRouter } from "next/navigation" // ✅ AGREGAR
import useAuth from "../../hooks/useLogin"

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

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { login, loading, error, isAuthenticated, clearError } = useAuth()
  const router = useRouter() // ✅ AGREGAR

  // Limpiar errores al montar
  useEffect(() => {
    clearError()
  }, [clearError])

  // ✅ MEJORAR: Redirigir si ya está autenticado
  useEffect(() => {
    console.log("🔍 isAuthenticated changed:", isAuthenticated)
    
    if (isAuthenticated) {
      console.log("🎉 Usuario autenticado, redirigiendo a /home...")
      router.push("/home")
      
      // También ejecutar callback si existe
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [isAuthenticated, onSuccess, router])

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

      console.log("✅ Login exitoso!", result)
      console.log("🔍 isAuthenticated después del login:", isAuthenticated)
      
      // ✅ REDIRECCIÓN MANUAL como backup
      if (!isAuthenticated) {
        console.log("⚠️ isAuthenticated aún es false, redirigiendo manualmente...")
        router.push("/home")
      }
      
    } catch (err) {
      console.error("❌ Login error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogIn className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Iniciar Sesión
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            Accede a tu cuenta de administrador
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Credenciales de prueba */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Credenciales de prueba:</strong>
              <br />
              Email: admin@example.com | Contraseña: Admin123!
            </AlertDescription>
          </Alert>

          {/* Alerta de error */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
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
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      touched.email && errors.email ? "border-red-500" : ""
                    }
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Contraseña *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      touched.password && errors.password
                        ? "border-red-500"
                        : ""
                    }
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>

                {/* Botón de login */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isValid || !dirty}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>

                {/* Link para registrarse */}
                {onSwitchToRegister && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      ¿No tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        disabled={loading}
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm