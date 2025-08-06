// components/ProductCardsList.tsx
import React, { useState } from "react"
import {
  Search,
  Filter,
  SortAsc,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
} from "lucide-react"
import useProducts from "../../hooks/useProducts"
import Product from "../../types/products"
import ProductCard from "../ProductCard"
import ProductDetailModal from "../ProductDetailModal"

interface ProductCardsListProps {
  searchTerm?: string
  onSearchChange?: (term: string) => void
  className?: string
}

interface FilterState {
  priceRange: { min: number; max: number }
  selectedBrands: string[]
  yearRange: { min: number; max: number }
  stockFilter: "all" | "inStock" | "outOfStock"
}

const ProductCardsList: React.FC<ProductCardsListProps> = ({
  searchTerm = "",
  onSearchChange,
  className = "",
}) => {
  const { products, loading, error } = useProducts()

  // Estados principales
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<Product[]>([])
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">(
    "name"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: Infinity },
    selectedBrands: [],
    yearRange: { min: 0, max: new Date().getFullYear() },
    stockFilter: "all",
  })

  // Calcular datos disponibles
  const availableData = React.useMemo(() => {
    if (!products.length) return { brands: [] }
    return { brands: [...new Set(products.map((p) => p.brand))].sort() }
  }, [products])

  // Filtrar y ordenar productos
  const filteredProducts = React.useMemo(() => {
    const term = (onSearchChange ? searchTerm : localSearchTerm).toLowerCase()

    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.model.toLowerCase().includes(term) ||
        product.engine.toLowerCase().includes(term) ||
        product.year.includes(term)

      const price = Number(product.price)
      const matchesPrice =
        price >= filters.priceRange.min && price <= filters.priceRange.max
      const matchesBrand =
        filters.selectedBrands.length === 0 ||
        filters.selectedBrands.includes(product.brand)
      const year = Number(product.year)
      const matchesYear =
        year >= filters.yearRange.min && year <= filters.yearRange.max
      const matchesStock =
        filters.stockFilter === "all" ||
        (filters.stockFilter === "inStock" && product.stock > 0) ||
        (filters.stockFilter === "outOfStock" && product.stock === 0)

      return (
        matchesSearch &&
        matchesPrice &&
        matchesBrand &&
        matchesYear &&
        matchesStock
      )
    })

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
  }, [
    products,
    searchTerm,
    localSearchTerm,
    onSearchChange,
    sortBy,
    sortOrder,
    filters,
  ])

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (onSearchChange) {
      onSearchChange(value)
    } else {
      setLocalSearchTerm(value)
    }
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

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

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
    console.log("Producto agregado al carrito:", product.name)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleBrandToggle = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter((b) => b !== brand)
        : [...prev.selectedBrands, brand],
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: Infinity },
      selectedBrands: [],
      yearRange: { min: 0, max: new Date().getFullYear() },
      stockFilter: "all",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) count++
    if (filters.selectedBrands.length > 0) count++
    if (
      filters.yearRange.min > 0 ||
      filters.yearRange.max < new Date().getFullYear()
    )
      count++
    if (filters.stockFilter !== "all") count++
    return count
  }

  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center h-64`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`${className} bg-red-50 border border-red-200 rounded-lg p-6 text-center`}
      >
        <Filter
          size={48}
          className="mx-auto mb-2 text-red-600"
        />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error al cargar productos
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header con búsqueda y filtros */}
      <div className="mb-6">
        {/* Barra de búsqueda y botón filtros */}
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={20} />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {getActiveFiltersCount()}
              </span>
            )}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro de precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rango de Precio
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={
                      filters.priceRange.min === 0 ? "" : filters.priceRange.min
                    }
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: {
                          ...filters.priceRange,
                          min: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={
                      filters.priceRange.max === Infinity
                        ? ""
                        : filters.priceRange.max
                    }
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: {
                          ...filters.priceRange,
                          max: Number(e.target.value) || Infinity,
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>

              {/* Filtro de marcas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marcas
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableData.brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={filters.selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro de año */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rango de Año
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Desde"
                    value={
                      filters.yearRange.min === 0 ? "" : filters.yearRange.min
                    }
                    onChange={(e) =>
                      handleFilterChange({
                        yearRange: {
                          ...filters.yearRange,
                          min: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={
                      filters.yearRange.max === new Date().getFullYear()
                        ? ""
                        : filters.yearRange.max
                    }
                    onChange={(e) =>
                      handleFilterChange({
                        yearRange: {
                          ...filters.yearRange,
                          max:
                            Number(e.target.value) || new Date().getFullYear(),
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>

              {/* Filtro de stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Disponibilidad
                </label>
                <select
                  value={filters.stockFilter}
                  onChange={(e) =>
                    handleFilterChange({
                      stockFilter: e.target.value as
                        | "all"
                        | "inStock"
                        | "outOfStock",
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="inStock">En Stock</option>
                  <option value="outOfStock">Sin Stock</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Chips de filtros activos */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.selectedBrands.map((brand) => (
              <span
                key={brand}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {brand}
                <button onClick={() => handleBrandToggle(brand)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.stockFilter !== "all" && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                {filters.stockFilter === "inStock" ? "En Stock" : "Sin Stock"}
                <button
                  onClick={() => handleFilterChange({ stockFilter: "all" })}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

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
            const productId = `${product.name}-${product.brand}-${index}`
            return (
              <ProductCard
                key={productId}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onProductClick={handleProductClick}
                isFavorite={favorites.has(`${product.name}-${product.brand}`)}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda o ajusta los filtros
          </p>
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
