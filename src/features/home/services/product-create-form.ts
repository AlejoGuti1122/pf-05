// services/productService.ts
import { ProductDetailResponse } from "../types/detail"
import {
  CreateProductResponse,
  CreateProductRequest, // ← CAMBIO: Importar de product-form
  Category,
} from "../types/product-form"

class ProductService {
  private baseURL: string

  constructor() {
    this.baseURL = "/api"
  }

  async getProductDetail(id: string): Promise<ProductDetailResponse> {
    const response = await fetch(`${this.baseURL}/products/${id}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async createProduct(
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    return response.json()
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseURL}/categories`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const productService = new ProductService()
