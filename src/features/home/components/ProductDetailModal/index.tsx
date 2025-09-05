// components/ProductDetailModal.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { X, Heart, Loader2, AlertCircle, Minus, Plus, Shield } from "lucide-react"
import Image from "next/image"
import { Product } from "../../types/products"
import useProductDetail from "../../hooks/useProductsDetail"
import { useFavorites } from "../../../cart/hooks/useFavorites"

interface ProductDetailModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, quantity?: number) => void
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  // ---- Hooks SIEMPRE al top-level
  const { productDetail, loading, error, fetchProductDetail, clearDetail } = useProductDetail()
  const { toggleFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites()

  const [qty, setQty] = useState<number>(1)
  const [imgErrored, setImgErrored] = useState(false)

  // Helpers
  const productId = product?.id ?? null
  const displayProduct: Product | null = (productDetail as Product) || product || null
  const isProductFavorite = productId ? isFavorite(productId) : false

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail(productId)
    } else {
      clearDetail()
    }
    setQty(1)
    setImgErrored(false)
  }, [isOpen, productId, fetchProductDetail, clearDetail])

  const rating = useMemo(() => {
    if (!displayProduct) return null
    const avg = Number((displayProduct as any).averageRating || 0)
    const total = Number((displayProduct as any).totalReviews || 0)
    if (!avg && !total) return null
    return { avg, total }
  }, [displayProduct])

  const formatCOP = (value: number | string) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    })
      .format(Number(value || 0))
      .replace(/^\$/, "")

  const maxQty = Math.max(0, Number(displayProduct?.stock || 0))
  const canAdd = !!displayProduct && maxQty > 0 && qty > 0

  const inc = () => setQty((q) => Math.min(q + 1, maxQty || 1))
  const dec = () => setQty((q) => Math.max(1, q - 1))

  const handleToggleFavorite = async () => {
    if (!productId) return
    await toggleFavorite(productId)
  }

  const handleAddToCart = () => {
    if (!displayProduct || !canAdd) return
    try {
      onAddToCart(displayProduct, qty)
    } catch {
      for (let i = 0; i < qty; i++) onAddToCart(displayProduct)
    }
    onClose()
  }

  // Guard posterior a los hooks
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            {displayProduct && (
              <>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  {displayProduct.brand}
                </span>
                <span className="text-sm text-gray-500">{displayProduct.model}</span>
              </>
            )}
            {productDetail?.category && (
              <span className="text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">
                {productDetail.category.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-red-600">
                <Loader2 className="animate-spin" size={22} />
                <span className="font-medium">Cargando detalle del producto...</span>
              </div>
            </div>
          )}

          {!!error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="font-semibold">No pudimos cargar el detalle</span>
              </div>
              <p className="text-red-700/90 text-sm mt-1">
                Se muestra la información básica mientras tanto.
              </p>
            </div>
          )}

          {!loading && displayProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Imagen */}
              <div>
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {imgErrored ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="https://picsum.photos/800/800"
                      alt={displayProduct.name}
                      className="w-full h-[420px] object-cover"
                    />
                  ) : (
                    <Image
                      src={displayProduct.imgUrl}
                      alt={displayProduct.name}
                      width={800}
                      height={800}
                      className="w-full h-[420px] object-cover"
                      onError={() => setImgErrored(true)}
                    />
                  )}

                  {/* stock pill */}
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                      displayProduct.stock > 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {displayProduct.stock > 0
                      ? `Stock: ${displayProduct.stock}`
                      : "Sin stock"}
                  </div>

                  {/* favorito */}
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading || !productId}
                    className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all ${
                      isProductFavorite
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white/85 text-gray-700 hover:bg-red-600 hover:text-white"
                    } ${favoritesLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    aria-label="Favorito"
                  >
                    {favoritesLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} fill={isProductFavorite ? "currentColor" : "none"} />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="h-4 w-4 text-black" />
                  Garantía y calidad certificada
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-black">{displayProduct.name}</h1>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-red-600">
                      ${formatCOP(displayProduct.price)}
                    </span>
                    {rating && (
                      <span className="text-sm text-gray-600">
                        {rating.avg.toFixed(1)} ★ ({rating.total})
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {productDetail?.description ||
                      `${displayProduct.brand} ${displayProduct.model} • ${displayProduct.year} • Motor ${displayProduct.engine}`}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-3">Especificaciones</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Marca</dt>
                      <dd className="font-medium text-black">{displayProduct.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Modelo</dt>
                      <dd className="font-medium text-black">{displayProduct.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Año</dt>
                      <dd className="font-medium text-black">{displayProduct.year}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Motor</dt>
                      <dd className="font-medium text-black">{displayProduct.engine}</dd>
                    </div>
                    {productDetail?.category && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Categoría</dt>
                        <dd className="font-medium text-black">
                          {productDetail.category.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Cantidad & acciones — reemplazado por tu bloque (adaptado) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-700">
                      Cantidad:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={dec}
                        disabled={qty <= 1}
                        className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={inc}
                        disabled={maxQty !== 0 && qty >= maxQty}
                        className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {!!maxQty && (
                      <span className="text-xs text-gray-500">({maxQty} disp.)</span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      canAdd
                        ? "bg-black text-white hover:bg-gray-900"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Agregar al Carrito
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading || !productId}
                    className={`w-full py-3 px-6 border-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isProductFavorite
                        ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                        : "border-red-600 text-red-600 hover:bg-red-50"
                    } ${favoritesLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {favoritesLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} fill={isProductFavorite ? "currentColor" : "none"} />
                    )}
                    {favoritesLoading
                      ? "Procesando..."
                      : isProductFavorite
                      ? "Quitar de Favoritos"
                      : "Agregar a Favoritos"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="px-6 py-4 border-t bg-white/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Envíos a todo el país • Pagos seguros • Soporte postventa
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
