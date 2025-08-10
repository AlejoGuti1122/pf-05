"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductForm.tsx
import React, { useEffect, useState } from "react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Package,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import useCategories from "../../hooks/useCategories"
import ProductFormFields from "../ProductFormFields"
import { ProductFormClean } from "@/features/form/types/productClean"
import { useCreateProductClean } from "@/features/form/hooks/useCreateForm"
import Image from "next/image"

interface ProductFormProps {
  onSuccess?: (productId: string) => void
  onCancel?: () => void
}

// Validación con Yup actualizada para incluir archivo
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .required("El nombre es obligatorio"),

  price: Yup.string()
    .required("El precio es obligatorio")
    .test("is-number", "Debe ser un número válido", (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),

  stock: Yup.string()
    .required("El stock es obligatorio")
    .test("is-number", "Debe ser un número entero válido", (value) => {
      if (!value) return false
      const num = parseInt(value)
      return !isNaN(num) && num >= 0
    }),

  // ✅ YA NO ES REQUERIDA LA URL PORQUE SUBIMOS ARCHIVO
  imgUrl: Yup.string().optional(),

  year: Yup.string()
    .matches(/^\d{4}$/, "Debe ser un año válido (4 dígitos)")
    .test("year-range", "El año debe ser mayor a 1900", function (value) {
      if (!value) return false
      const year = parseInt(value)
      const currentYear = new Date().getFullYear()
      return year > 1900 && year <= currentYear
    })
    .required("El año es obligatorio"),

  brand: Yup.string()
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(50, "La marca no puede exceder 50 caracteres")
    .required("La marca es obligatoria"),

  model: Yup.string()
    .min(1, "El modelo debe tener al menos 1 caracter")
    .max(50, "El modelo no puede exceder 50 caracteres")
    .required("El modelo es obligatorio"),

  engine: Yup.string()
    .min(1, "El motor debe tener al menos 1 caracter")
    .max(50, "El motor no puede exceder 50 caracteres")
    .required("El motor es obligatorio"),

  categoryId: Yup.string().required("La categoría es obligatoria"),
})

const initialValues: ProductFormClean = {
  name: "",
  price: "",
  stock: "",
  imgUrl: "", // ✅ Mantener por compatibilidad pero no mostrar en form
  year: "",
  brand: "",
  model: "",
  engine: "",
  categoryId: "",
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { createProduct, loading, error, success, clearStatus } =
    useCreateProductClean()
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories()

  // Limpiar estado cuando se monta el componente
  useEffect(() => {
    clearStatus()
  }, [clearStatus])

  // Redirección después del éxito
  useEffect(() => {
    if (success) {
      console.log("✅ Producto creado exitosamente, redirigiendo a /home...")

      const timer = setTimeout(() => {
        router.push("/home")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  // ✅ MANEJAR SELECCIÓN DE ARCHIVO
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona solo archivos de imagen")
        return
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo debe ser menor a 5MB")
        return
      }

      setSelectedFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ REMOVER ARCHIVO SELECCIONADO
  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  const handleSubmit = async (values: ProductFormClean, { resetForm }: any) => {
    try {
      console.log("🎯 Form Clean - Form values:", values)

      // ✅ VALIDAR QUE HAYA ARCHIVO SELECCIONADO
      if (!selectedFile) {
        throw new Error("Debes seleccionar una imagen del producto")
      }

      // ✅ DEBUG: Ver cada valor antes de convertir
      console.log(
        "🔍 DEBUG - price raw:",
        `"${values.price}"`,
        typeof values.price
      )
      console.log(
        "🔍 DEBUG - stock raw:",
        `"${values.stock}"`,
        typeof values.stock
      )
      console.log("🔍 DEBUG - file:", selectedFile.name, selectedFile.size)

      // ✅ VALIDAR Y CONVERTIR VALORES ANTES DE ENVIAR
      const price = parseFloat(values.price)
      const stock = parseInt(values.stock)

      if (isNaN(price) || price <= 0) {
        console.error("❌ Price inválido:", values.price, "→", price)
        throw new Error("El precio debe ser un número válido mayor a 0")
      }

      if (isNaN(stock) || stock < 0) {
        console.error("❌ Stock inválido:", values.stock, "→", stock)
        throw new Error("El stock debe ser un número válido mayor o igual a 0")
      }

      // ✅ CREAR FORMDATA EN LUGAR DE OBJETO
      const formData = new FormData()
      formData.append("name", values.name.trim())
      formData.append("price", price.toString())
      formData.append("stock", stock.toString())
      formData.append("year", values.year.trim())
      formData.append("brand", values.brand.trim())
      formData.append("model", values.model.trim())
      formData.append("engine", values.engine.trim())
      formData.append("categoryId", values.categoryId)
      formData.append("file", selectedFile) // ✅ EL ARCHIVO

      console.log("🎯 Form Clean - Sending FormData")
      console.log(
        "🔍 File info:",
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      )

      const result = await createProduct(formData as any)

      console.log("✅ Producto creado, iniciando redirección...")

      // Reset form y archivo después de éxito
      resetForm()
      removeFile()

      // ✅ REDIRECCIÓN DIRECTA AQUÍ
      setTimeout(() => {
        console.log("🔄 Redirigiendo a /home...")
        router.push("/home")
      }, 1000) // 1 segundo para ver el mensaje de éxito

      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (err) {
      console.error("❌ Form Clean - Error:", err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crear Nuevo Producto
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            Agrega un nuevo repuesto a tu catálogo con imagen
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Alertas de estado */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Producto creado exitosamente! 🎉 Redirigiendo a inicio...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {categoriesError && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Error al cargar categorías: {categoriesError}
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
              isValid,
              dirty,
            }) => (
              <Form className="space-y-6">
                {/* ✅ SECCIÓN DE UPLOAD DE IMAGEN */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Imagen del Producto *
                  </Label>

                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Selecciona una imagen del producto
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG, JPEG hasta 5MB
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <Label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          Elegir Archivo
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {preview && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Vista previa:
                          </p>
                          <Image
                            src={preview}
                            alt="Preview"
                            width={20}
                            height={20}
                            className="w-32 h-32 object-cover rounded-lg border border-b-black"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Campos del formulario existentes */}
                <ProductFormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                  categories={categories}
                  loadingCategories={loadingCategories}
                />

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !isValid || !dirty || !selectedFile}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Crear Producto
                      </>
                    )}
                  </Button>

                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={loading}
                      className="px-8"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  Los campos marcados con * son obligatorios
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductForm
