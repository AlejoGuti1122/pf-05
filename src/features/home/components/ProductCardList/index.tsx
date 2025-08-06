// components/ProductCardsList.tsx
import React, { useState } from "react"
import { Search, Filter, SortAsc } from "lucide-react"
import useProducts from "../../hooks/useProducts"
import Product from "../../types/products"
import ProductCard from "../ProductCard"

interface ProductCardsListProps {
  searchTerm?: string
  onSearchChange?: (term: string) => void
  className?: string
}

const ProductCardsList: React.FC<ProductCardsListProps> = ({
  searchTerm = "",
  onSearchChange,
  className = "",
}) => {
  const { products, loading, error } = useProducts()

  // Estados locales para favoritos y carrito
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<Product[]>([])
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">(
    "name"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filtrar productos por búsqueda
  const filteredProducts = React.useMemo(() => {
    const term = (onSearchChange ? searchTerm : localSearchTerm).toLowerCase()

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.model.toLowerCase().includes(term) ||
        product.engine.toLowerCase().includes(term) ||
        product.year.includes(term)
    )

    // Ordenar productos
    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy]
      let bValue: string | number = b[sortBy]

      if (sortBy === "price") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [products, searchTerm, localSearchTerm, onSearchChange, sortBy, sortOrder])

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (onSearchChange) {
      onSearchChange(value)
    } else {
      setLocalSearchTerm(value)
    }
  }

  // Manejar favoritos
  const handleToggleFavorite = (product: Product) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = (product as any).id || `${product.name}-${product.brand}`
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

  // Manejar agregar al carrito
  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
    // Aquí podrías mostrar una notificación
    console.log("Producto agregado al carrito:", product.name)
  }

  // Manejar click en producto
  const handleProductClick = (product: Product) => {
    console.log("Producto clickeado:", product)
    // Aquí podrías navegar a la página de detalle del producto
  }

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <Filter
              size={48}
              className="mx-auto mb-2"
            />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar productos
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header con búsqueda y filtros */}
      <div className="mb-6">
        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar productos por nombre, marca, modelo..."
              value={onSearchChange ? searchTerm : localSearchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Controles de ordenamiento */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">Ordenar por:</span>
          {[
            { key: "name" as const, label: "Nombre" },
            { key: "brand" as const, label: "Marca" },
            { key: "price" as const, label: "Precio" },
            { key: "year" as const, label: "Año" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                sortBy === key
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
              {sortBy === key && (
                <SortAsc
                  size={14}
                  className={`transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Favoritos: {favorites.size}</span>
          <span>En carrito: {cart.length}</span>
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const productId =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (product as any).id || `${product.name}-${product.brand}-${index}`
            return (
              <ProductCard
                key={productId}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onProductClick={handleProductClick}
                isFavorite={favorites.has(productId)}
              />
            )
          })}
        </div>
      ) : (
        /* Mensaje cuando no hay productos */
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search
              size={48}
              className="mx-auto"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductCardsList
