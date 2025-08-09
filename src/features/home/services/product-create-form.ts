// services/productService.ts
import { ProductDetailResponse } from "../types/detail"
import {
  CreateProductResponse,
  CreateProductRequest,
  Category,
} from "../types/product-form"

class ProductService {
  private baseURL: string

  constructor() {
    this.baseURL = "http://localhost:3001" // ✅ CORREGIR URL
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
    const response = await fetch(`${this.baseURL}/products`, { // ✅ CORREGIR URL
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