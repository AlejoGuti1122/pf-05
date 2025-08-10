/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCreateProductClean.ts
import { useState } from "react"

import {
  CreateProductClean,
  CreateProductResponseClean,
} from "../types/productClean"
import { productServiceClean } from "../services/create"

interface UseCreateProductCleanReturn {
  loading: boolean
  error: string | null
  success: boolean
  createProduct: (
    data: CreateProductClean
  ) => Promise<CreateProductResponseClean>
  clearStatus: () => void
}

export const useCreateProductClean = (): UseCreateProductCleanReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createProduct = async (
    data: CreateProductClean
  ): Promise<CreateProductResponseClean> => {
    console.log("🎯 Hook Clean - Starting creation")
    console.log("🔍 Data received in hook:", data)

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // ✅ LLAMADA DIRECTA SIN MODIFICACIONES
      const result = await productServiceClean.createProduct(data)

      console.log("✅ Hook Clean - Product created:", result)
      setSuccess(true)
      return result
    } catch (err: any) {
      const errorMessage = err.message || "Error al crear producto"
      console.error("❌ Hook Clean - Error:", errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearStatus = () => {
    setError(null)
    setSuccess(false)
  }

  return {
    loading,
    error,
    success,
    createProduct,
    clearStatus,
  }
}
