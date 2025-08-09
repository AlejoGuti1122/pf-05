// services/productService.ts

import { ProductDetailResponse } from "../types/detail"

class ProductService {
  private baseURL: string

  constructor() {
    this.baseURL = "http://localhost:3001" // ✅ CORREGIR URL
  }

  async getProductDetail(id: string): Promise<ProductDetailResponse> {
    const url = `${this.baseURL}/products/${id}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return data
  }

  async getCategories() {
    const response = await fetch(`${this.baseURL}/categories`)
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const productService = new ProductService()