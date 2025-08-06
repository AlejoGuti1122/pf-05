// components/ProductDetailModal.tsx
import React from "react"
import { X, Heart } from "lucide-react"
import Image from "next/image"
import Product from "../../types/products"

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
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Detalle del Producto</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={product.imgUrl}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/400/400"
                  }}
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                  product.stock > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : "Sin Stock"}
                </div>
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              
              {/* Título y marca */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.brand}
                  </span>
                  <span className="text-gray-500 text-sm">{product.model}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-4xl font-bold text-blue-600">${product.price.toLocaleString()}</p>
              </div>

              {/* Especificaciones técnicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Especificaciones Técnicas</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Año:</span>
                    <span className="font-semibold">{product.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Motor:</span>
                    <span className="font-semibold">{product.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-semibold">{product.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disponibilidad:</span>
                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.name} de {product.brand} modelo {product.model} del año {product.year}. 
                  Equipado con motor {product.engine}, este vehículo ofrece una excelente combinación de rendimiento, 
                  confiabilidad y eficiencia. Ideal para quienes buscan calidad y durabilidad en cada kilómetro.
                </p>
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onAddToCart(product)
                    onClose()
                  }}
                  disabled={product.stock === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    product.stock > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {product.stock > 0 ? "Agregar al Carrito" : "No Disponible"}
                </button>
                
                <button
                  onClick={() => onToggleFavorite(product)}
                  className="w-full py-3 px-6 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                  {isFavorite ? "Quitar de Favoritos" : "Agregar a Favoritos"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal