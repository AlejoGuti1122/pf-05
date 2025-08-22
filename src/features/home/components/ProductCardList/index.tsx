// components/ProductCardsList.tsx
import React, { useState } from "react"
import {
  Filter,
  Heart,
  Search,
  ShoppingCart,
  Eye,
  Calendar,
  Cog,
  Loader2,
} from "lucide-react"
import Product from "../../types/products"
import ProductDetailModal from "../ProductDetailModal"
import { FilterState } from "../../types/filters"
import useProductsFiltered from "../../hooks/useFilters"

import Image from "next/image"
import { useCartContext } from "../../../cart/context/index"

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='240'%3E%3Crect width='300' height='240' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2364748b' font-size='14'%3EImagen No Disponible%3C/text%3E%3C/svg%3E"

interface ProductCardsListProps {
  filters?: FilterState
  sortBy?: "name" | "price" | "brand" | "year"
  sortOrder?: "asc" | "desc"
  className?: string
}

const ProductCardsList: React.FC<ProductCardsListProps> = ({
  filters: externalFilters,
  sortBy: externalSortBy = "name",
  sortOrder: externalSortOrder = "asc",
  className = "",
}) => {
  // Estados principales
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // ✅ Agregar el hook del carrito:
  const { addItem, isLoading: cartLoading, itemCount } = useCartContext()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // ✅ FILTROS POR DEFECTO SIMPLIFICADOS - Solo marcas y años
  const defaultFilters: FilterState = {
    priceRange: { min: 0, max: Infinity },
    selectedBrands: [],
    yearRange: { min: 1990, max: new Date().getFullYear() }, // ✅ Valores consistentes
  }

  const filters = externalFilters || defaultFilters

  // Hook personalizado para obtener productos filtrados
  const {
    products: allProducts,
    loading,
    error,
    totalCount,
    refetch,
  } = useProductsFiltered({
    searchTerm: "",
    filters: filters,
    sortBy: externalSortBy,
    sortOrder: externalSortOrder,
    page: 1,
    limit: 100,
  })

  // Filtrar productos específicos
  const products = React.useMemo(() => {
    const productsToHide = [
      "Aceite Castrol 10W40",
      "Amortiguador Monroe",
      "Bujía NGK Iridium",
      "Filtro de Aceite Bosch",
    ]

    return allProducts
      .filter((product) => !productsToHide.includes(product.name))
      .filter((product) => product.stock > 0)
  }, [allProducts])

  // Handlers
  const handleToggleFavorite = (product: Product) => {
    const productId = `${product.name}-${product.brand}`
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const handleToggleFavoriteWithEvent = (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault()
    e.stopPropagation()
    handleToggleFavorite(product)
  }

  // ✅ Nueva función integrada con el backend:
  const handleAddToCart = async (product: Product) => {
    console.log("🔍 DEBUG - Producto completo:", product)
    console.log("🔍 DEBUG - Claves del producto:", Object.keys(product))

    if (product.stock <= 0) return

    try {
      // ✅ Usar el ID real del producto que ya viene del backend
      const productId = product.id

      if (!productId) {
        console.error("❌ Producto sin ID válido:", product)
        return
      }

      console.log(
        "🎯 Enviando productId UUID:",
        productId,
        "para producto:",
        product.name
      )

      await addItem({
        productId: productId, // ✅ Usar el UUID real, no generar uno falso
        quantity: 1,
      })

      console.log("✅ Producto agregado al carrito backend:", product.name)
    } catch (error) {
      console.error("❌ Error agregando al carrito:", error)
    }
  }

  const handleAddToCartWithEvent = async (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault()
    e.stopPropagation()
    await handleAddToCart(product)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Sin Stock
        </span>
      )
    } else if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Stock: {stock}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Stock: {stock}
        </span>
      )
    }
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center h-64`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`${className} bg-red-50 border border-red-200 rounded-xl p-6 text-center`}
      >
        <Filter
          size={48}
          className="mx-auto mb-2 text-red-600"
        />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error al cargar productos
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Productos Disponibles
          </h2>
          <p className="text-gray-600">
            Mostrando {products.length} productos
            {totalCount > products.length && ` de ${totalCount} total`}
          </p>
        </div>

        {/* Contadores - ✅ Actualizado para usar el carrito del backend */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Favoritos</p>
            <p className="text-xl font-bold text-red-500">{favorites.size}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">En carrito</p>
            <p className="text-xl font-bold text-blue-500">{itemCount}</p>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const productId = `${product.name}-${product.brand}`
            const isFavorite = favorites.has(productId)
            const isOutOfStock = product.stock <= 0

            return (
              <div
                key={`${product.id}-${index}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
                onClick={() => handleProductClick(product)}
              >
                {/* Imagen del producto */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={product.imgUrl}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes("data:image/svg")) {
                        target.src = PLACEHOLDER_IMAGE
                      }
                    }}
                  />

                  {/* Badge de stock */}
                  <div className="absolute top-4 left-4">
                    {getStockBadge(product.stock)}
                  </div>

                  {/* Botón de favorito */}
                  <button
                    onClick={(e) => handleToggleFavoriteWithEvent(e, product)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
                      isFavorite
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
                    } backdrop-blur-sm`}
                    type="button"
                  >
                    <Heart
                      size={18}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>

                  {/* Overlay con botones de acción */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                        className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Eye
                          size={20}
                          className="text-gray-700"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Información del producto */}
                <div className="p-6">
                  {/* Marca y código */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {product.model}
                    </span>
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Detalles técnicos */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{product.year}</span>
                    </div>
                    {product.model && (
                      <div className="flex items-center gap-1">
                        <Cog size={14} />
                        <span className="truncate">{product.model}</span>
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">USD</span>
                  </div>

                  {/* Descripción */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Botón de agregar al carrito - ✅ Actualizado con loading */}
                  <button
                    onClick={(e) => handleAddToCartWithEvent(e, product)}
                    disabled={isOutOfStock || cartLoading}
                    type="button"
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      isOutOfStock || cartLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg active:scale-95"
                    }`}
                  >
                    {cartLoading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    {cartLoading
                      ? "Agregando..."
                      : isOutOfStock
                      ? "No Disponible"
                      : "Agregar al Carrito"}
                  </button>
                </div>

                {/* Indicador de producto sin stock */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart
                          size={24}
                          className="text-red-500"
                        />
                      </div>
                      <p className="font-semibold text-red-600">Agotado</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Search
            size={64}
            className="mx-auto text-gray-400 mb-6"
          />
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Intenta ajustando los filtros para ver más productos disponibles en
            nuestro catálogo
          </p>
          <button
            onClick={refetch}
            className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
          >
            Recargar productos
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      <ProductDetailModal
        isOpen={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={
          selectedProduct
            ? favorites.has(`${selectedProduct.name}-${selectedProduct.brand}`)
            : false
        }
      />
    </div>
  )
}

export default ProductCardsList
