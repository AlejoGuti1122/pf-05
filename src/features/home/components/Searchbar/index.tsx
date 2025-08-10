// components/SearchBar.tsx
import React, { useState, useEffect } from "react"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"

export interface SearchFilters {
  priceRange: { min: number; max: number }
  selectedBrands: string[]
  yearRange: { min: number; max: number }
  stockFilter: "all" | "inStock" | "outOfStock"
}

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters?: SearchFilters
  onFiltersChange?: (filters: SearchFilters) => void
  availableBrands?: string[]
  showFilters?: boolean
  placeholder?: string
  className?: string
}

const defaultFilters: SearchFilters = {
  priceRange: { min: 0, max: Infinity },
  selectedBrands: [],
  yearRange: { min: 0, max: new Date().getFullYear() },
  stockFilter: "all",
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  filters = defaultFilters,
  onFiltersChange,
  availableBrands = [],
  showFilters = true,
  placeholder = "Buscar productos por nombre, marca, modelo...",
  className = "",
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  // Sincronizar filtros externos con estado local
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters }
    setLocalFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const handleBrandToggle = (brand: string) => {
    const newSelectedBrands = localFilters.selectedBrands.includes(brand)
      ? localFilters.selectedBrands.filter((b) => b !== brand)
      : [...localFilters.selectedBrands, brand]
    
    handleFilterChange({ selectedBrands: newSelectedBrands })
  }

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: { min: 0, max: Infinity },
      selectedBrands: [],
      yearRange: { min: 0, max: new Date().getFullYear() },
      stockFilter: "all" as const,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.priceRange.min > 0 || localFilters.priceRange.max < Infinity) count++
    if (localFilters.selectedBrands.length > 0) count++
    if (
      localFilters.yearRange.min > 0 ||
      localFilters.yearRange.max < new Date().getFullYear()
    ) count++
    if (localFilters.stockFilter !== "all") count++
    return count
  }

  const removeBrandFilter = (brand: string) => {
    handleBrandToggle(brand)
  }

  const removeStockFilter = () => {
    handleFilterChange({ stockFilter: "all" })
  }

  return (
    <div className={`${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Input de búsqueda */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Botón de filtros */}
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
              showFiltersPanel
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={20} />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
            {showFiltersPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && showFiltersPanel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rango de Precio ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.priceRange.min === 0 ? "" : localFilters.priceRange.min}
                  onChange={(e) =>
                    handleFilterChange({
                      priceRange: {
                        ...localFilters.priceRange,
                        min: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.priceRange.max === Infinity ? "" : localFilters.priceRange.max}
                  onChange={(e) =>
                    handleFilterChange({
                      priceRange: {
                        ...localFilters.priceRange,
                        max: Number(e.target.value) || Infinity,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de marcas */}
            {availableBrands.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marcas ({availableBrands.length})
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2 bg-white border border-gray-200 rounded-md p-2">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filtro de año */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rango de Año
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Desde"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localFilters.yearRange.min === 0 ? "" : localFilters.yearRange.min}
                  onChange={(e) =>
                    handleFilterChange({
                      yearRange: {
                        ...localFilters.yearRange,
                        min: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Hasta"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={
                    localFilters.yearRange.max === new Date().getFullYear()
                      ? ""
                      : localFilters.yearRange.max
                  }
                  onChange={(e) =>
                    handleFilterChange({
                      yearRange: {
                        ...localFilters.yearRange,
                        max: Number(e.target.value) || new Date().getFullYear(),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Disponibilidad
              </label>
              <select
                value={localFilters.stockFilter}
                onChange={(e) =>
                  handleFilterChange({
                    stockFilter: e.target.value as "all" | "inStock" | "outOfStock",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los productos</option>
                <option value="inStock">Solo en stock</option>
                <option value="outOfStock">Sin stock</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
              >
                <X size={14} />
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chips de filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Chips de marcas */}
          {localFilters.selectedBrands.map((brand) => (
            <span
              key={brand}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in slide-in-from-left-1"
            >
              <span className="font-medium">{brand}</span>
              <button
                onClick={() => removeBrandFilter(brand)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Remover filtro de marca ${brand}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Chip de stock */}
          {localFilters.stockFilter !== "all" && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in slide-in-from-left-1">
              <span className="font-medium">
                {localFilters.stockFilter === "inStock" ? "En Stock" : "Sin Stock"}
              </span>
              <button
                onClick={removeStockFilter}
                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                aria-label="Remover filtro de stock"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Chip de precio */}
          {(localFilters.priceRange.min > 0 || localFilters.priceRange.max < Infinity) && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in slide-in-from-left-1">
              <span className="font-medium">
                ${localFilters.priceRange.min} - ${localFilters.priceRange.max === Infinity ? "∞" : localFilters.priceRange.max}
              </span>
              <button
                onClick={() => handleFilterChange({ priceRange: { min: 0, max: Infinity } })}
                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                aria-label="Remover filtro de precio"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Chip de año */}
          {(localFilters.yearRange.min > 0 || localFilters.yearRange.max < new Date().getFullYear()) && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in slide-in-from-left-1">
              <span className="font-medium">
                {localFilters.yearRange.min} - {localFilters.yearRange.max}
              </span>
              <button
                onClick={() => handleFilterChange({ yearRange: { min: 0, max: new Date().getFullYear() } })}
                className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                aria-label="Remover filtro de año"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar