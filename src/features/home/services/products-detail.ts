// services/productService.ts

import { ProductDetailResponse } from "../types/detail"

class ProductService {
  private baseURL: string

  constructor() {
    // Usar el proxy de Next.js - NO más CORS issues!
    this.baseURL = "/api"
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
}

export const productService = new ProductService()
