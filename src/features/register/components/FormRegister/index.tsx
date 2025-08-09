"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
// components/RegisterForm.tsx
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
import {
  Loader2,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Home,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import useRegister from "../../hooks/useRegister"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  country: string
  address: string
  city: string
  age: string
}

// Validación con Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .required("El nombre es obligatorio"),

  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),

  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/\d/, "Debe contener al menos un número")
    .matches(/[!@#$%^&*]/, "Debe contener al menos un carácter especial")
    .required("La contraseña es obligatoria"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),

  phone: Yup.string()
    .matches(
      /^\d{10,15}$/,
      "Debe ser un número de teléfono válido (10-15 dígitos)"
    )
    .required("El teléfono es obligatorio"),

  country: Yup.string()
    .min(2, "El país debe tener al menos 2 caracteres")
    .required("El país es obligatorio"),

  address: Yup.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .required("La dirección es obligatoria"),

  city: Yup.string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .required("La ciudad es obligatoria"),

  age: Yup.number()
    .min(18, "Debes ser mayor de 18 años")
    .max(120, "Edad no válida")
    .required("La edad es obligatoria"),
})

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  country: "",
  address: "",
  city: "",
  age: "",
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { register, loading, error, success, clearStatus } = useRegister()

  const router = useRouter()

  // Limpiar errores al montar
  useEffect(() => {
    clearStatus()
  }, [clearStatus])

const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const registerData = {
        name: values.name.trim(),
        email: values.email.toLowerCase().trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        phone: parseInt(values.phone),
        country: values.country.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
      }

      console.log("🔍 registerData keys:", Object.keys(registerData))
      console.log("🔍 registerData:", JSON.stringify(registerData, null, 2))

      // ✅ Esperar a que el registro termine exitosamente
      await register(registerData)

      // ✅ Solo si el registro fue exitoso, hacer todo esto:
      resetForm()
      
      // Callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }

      // ✅ Redirección SOLO después del éxito
      console.log("🎉 Registro exitoso, redirigiendo al login...")
      router.push("/")

    } catch (err) {
      console.error("❌ Register error:", err)
      // No hay redirección si hay error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserPlus className="h-8 w-8 text-green-600" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Crear Cuenta
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            Regístrate para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Datos de ejemplo */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Datos de ejemplo:</strong>
              <br />
              Nombre: Ignacio Muestra | Email: muestra@example.com
              <br />
              Teléfono: 3512345678 | Edad: 25
            </AlertDescription>
          </Alert>

          {/* Alerta de éxito */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Cuenta creada exitosamente! 🎉
              </AlertDescription>
            </Alert>
          )}

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
              setFieldValue,
              isSubmitting,
              isValid,
              dirty,
            }) => (
              <Form className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Nombre Completo *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ignacio Muestra"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.name && errors.name ? "border-red-500" : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>

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
                        placeholder="muestra@example.com"
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

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="3512345678"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.phone && errors.phone ? "border-red-500" : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>

                    {/* Edad */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="age"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Edad *
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        min="18"
                        max="120"
                        placeholder="25"
                        value={values.age}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.age && errors.age ? "border-red-500" : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="age"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* País */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="country"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        País *
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="Argentina"
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.country && errors.country
                            ? "border-red-500"
                            : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="country"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Ciudad *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Córdoba"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.city && errors.city ? "border-red-500" : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="city"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2 space-y-2">
                      <Label
                        htmlFor="address"
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Dirección *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Calle Muestra 123"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.address && errors.address
                            ? "border-red-500"
                            : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="address"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Seguridad
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Confirmar contraseña */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Confirmar Contraseña *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-red-500"
                            : ""
                        }
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="p"
                        className="text-sm text-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de registro */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isValid || !dirty}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Crear Cuenta
                    </>
                  )}
                </Button>

                {/* Link para login */}
                {onSwitchToLogin && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      ¿Ya tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        disabled={loading}
                      >
                        Inicia sesión aquí
                      </button>
                    </p>
                  </div>
                )}

                {/* Información de validación */}
                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  La contraseña debe contener: mayúscula, minúscula, número y
                  carácter especial
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterForm
