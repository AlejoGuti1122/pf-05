// components/ProductDetailModal.tsx
import React, { useEffect } from "react"
import { X, Heart, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Product from "../../types/products"
import useProductDetail from "../../hooks/useProductsDetail"

interface ProductDetailModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product) => void
  onToggleFavorite: (product: Product) => void
  isFavorite: boolean
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}) => {
  const { productDetail, loading, error, fetchProductDetail, clearDetail } =
    useProductDetail()

  // Función para obtener el ID del producto
  const getProductId = (product: Product) => {
    // Ajusta según tu estructura de datos
    // Si tu Product tiene id:
    if ("id" in product && product.id) {
      return product.id as string
    }
    // Si necesitas generar ID de otra forma, ajusta aquí
    return null
  }

  useEffect(() => {
    if (isOpen && product) {
      const productId = getProductId(product)
      if (productId) {
        fetchProductDetail(productId)
      }
    } else {
      clearDetail()
    }
  }, [isOpen, product, fetchProductDetail, clearDetail])

  if (!isOpen || !product) return null

  // Usar datos del backend si están disponibles, sino usar los del listado
  const displayProduct = productDetail || product

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Detalle del Producto
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Estado de loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-blue-600">
                <Loader2
                  className="animate-spin"
                  size={24}
                />
                <span>Cargando detalle del producto...</span>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <span className="font-medium">Error al cargar el detalle</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-gray-600 text-sm mt-2">
                Mostrando información básica del producto.
              </p>
            </div>
          )}

          {/* Contenido principal */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Imagen del producto */}
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={displayProduct.imgUrl}
                    alt={displayProduct.name}
                    width={400}
                    height={400}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/400/400"
                    }}
                  />
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                      displayProduct.stock > 0
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {displayProduct.stock > 0
                      ? `Stock: ${displayProduct.stock}`
                      : "Sin Stock"}
                  </div>
                </div>
              </div>

              {/* Información del producto */}
              <div className="space-y-6">
                {/* Título y marca */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {displayProduct.brand}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {displayProduct.model}
                    </span>
                    {/* Mostrar categoría si está disponible del backend */}
                    {productDetail?.category && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {productDetail.category.name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {displayProduct.name}
                  </h1>
                  <p className="text-4xl font-bold text-blue-600">
                    ${displayProduct.price.toLocaleString()}
                  </p>
                </div>

                {/* Especificaciones técnicas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Especificaciones Técnicas
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Año:</span>
                      <span className="font-semibold">
                        {displayProduct.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motor:</span>
                      <span className="font-semibold">
                        {displayProduct.engine}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-semibold">
                        {displayProduct.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponibilidad:</span>
                      <span
                        className={`font-semibold ${
                          displayProduct.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {displayProduct.stock > 0
                          ? `${displayProduct.stock} unidades`
                          : "Agotado"}
                      </span>
                    </div>
                    {/* Mostrar categoría en especificaciones si está disponible */}
                    {productDetail?.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-semibold">
                          {productDetail.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción - Del backend si está disponible */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {productDetail?.description ||
                      `${displayProduct.name} de ${displayProduct.brand} modelo ${displayProduct.model} del año ${displayProduct.year}. 
                      Equipado con motor ${displayProduct.engine}, este vehículo ofrece una excelente combinación de rendimiento, 
                      confiabilidad y eficiencia. Ideal para quienes buscan calidad y durabilidad en cada kilómetro.`}
                  </p>
                </div>

                {/* Información adicional del backend */}
                {productDetail?.orderDetails &&
                  productDetail.orderDetails.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Información Adicional
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Este producto ha sido pedido{" "}
                        {productDetail.orderDetails.length} vez(es)
                      </p>
                    </div>
                  )}

                {/* Acciones */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onAddToCart(product) // Usar el producto original para el carrito
                      onClose()
                    }}
                    disabled={displayProduct.stock === 0}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      displayProduct.stock > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {displayProduct.stock > 0
                      ? "Agregar al Carrito"
                      : "No Disponible"}
                  </button>

                  <button
                    onClick={() => onToggleFavorite(product)} // Usar el producto original
                    className="w-full py-3 px-6 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart
                      size={20}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                    {isFavorite ? "Quitar de Favoritos" : "Agregar a Favoritos"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
