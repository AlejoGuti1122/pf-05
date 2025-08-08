"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductForm.tsx
import React, { useEffect } from "react"
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
import { Loader2, Package, CheckCircle, AlertCircle } from "lucide-react"

import useCategories from "../../hooks/useCategories"
import useCreateProduct from "../../hooks/useCreateProduct"
import ProductFormFields from "../ProductFormFields"
import { ProductFormValues } from "../../types/product-form"
import { CreateProductRequest } from "../../types/products"

interface ProductFormProps {
  onSuccess?: (productId: string) => void
  onCancel?: () => void
}

// Validación con Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .required("El nombre es obligatorio"),

  price: Yup.number()
    .positive("El precio debe ser mayor a 0")
    .max(999999, "El precio no puede exceder $999,999")
    .required("El precio es obligatorio"),

  stock: Yup.number()
    .min(0, "El stock no puede ser negativo")
    .max(99999, "El stock no puede exceder 99,999")
    .required("El stock es obligatorio"),

  imgUrl: Yup.string()
    .url("Debe ser una URL válida")
    .required("La URL de la imagen es obligatoria"),

  // En validationSchema, reemplazar la validación del year por:
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

const initialValues: ProductFormValues = {
  name: "",
  price: "",
  stock: "",
  imgUrl: "",
  year: "",
  brand: "",
  model: "",
  engine: "",
  categoryId: "",
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const { createProduct, loading, error, success, clearStatus } =
    useCreateProduct()
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories()

  // Limpiar estado cuando se monta el componente
  useEffect(() => {
    clearStatus()
  }, [clearStatus])

  const handleSubmit = async (
    values: ProductFormValues,
    { resetForm }: any
  ) => {
    try {
      const productData: CreateProductRequest = {
        name: values.name.trim(),
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        imgUrl: values.imgUrl.trim(),
        year: values.year.trim(),
        brand: values.brand.trim(),
        model: values.model.trim(),
        engine: values.engine.trim(),
        categoryId: values.categoryId,
      }

      const result = await createProduct(productData)

      // Reset form después de éxito
      resetForm()

      // Callback de éxito
      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (err) {
      // El error ya se maneja en el hook
      console.error("Error creating product:", err)
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
            Agrega un nuevo repuesto a tu catálogo
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Alertas de estado */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Producto creado exitosamente! 🎉
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
                {/* Campos del formulario */}
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

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !isValid || !dirty}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

                {/* Información adicional */}
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
