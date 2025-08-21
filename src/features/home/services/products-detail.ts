/* eslint-disable @typescript-eslint/no-explicit-any */
// services/productService.ts

import { ProductDetailResponse } from "../types/detail"

class ProductService {
  private baseURL: string

  constructor() {
    // ✅ USAR VARIABLE DE ENTORNO
    this.baseURL = process.env.API_URL || "https://pf-grupo5-8.onrender.com"
  }

  async getProductDetail(id: string): Promise<ProductDetailResponse> {
    const url = `${this.baseURL}/products/${id}`

    console.log("🔗 Obteniendo detalle del producto:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("❌ Error en getProductDetail:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Detalle del producto obtenido:", data.id)

    return data
  }

  async getCategories() {
    const url = `${this.baseURL}/categories`

    console.log("🔗 Obteniendo categorías:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("❌ Error en getCategories:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Categorías obtenidas:", data.length || 0)

    return data
  }

  // ✅ BONUS: Método para crear producto (si lo necesitas después)
  async createProduct(productData: any) {
    const url = `${this.baseURL}/products`

    console.log("🔗 Creando producto:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Agregar Authorization si es necesario:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      console.error("❌ Error en createProduct:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Producto creado:", data.id)

    return data
  }

  // ✅ BONUS: Método para actualizar producto
  async updateProduct(id: string, productData: any) {
    const url = `${this.baseURL}/products/${id}`

    console.log("🔗 Actualizando producto:", url)

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Agregar Authorization si es necesario:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      console.error("❌ Error en updateProduct:", response.status)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Producto actualizado:", data.id)

    return data
  }
}

export const productService = new ProductService()
