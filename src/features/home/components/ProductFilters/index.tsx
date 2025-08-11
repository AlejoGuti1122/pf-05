// components/ProductFilters.tsx
import React from "react"
import { Filter, ChevronDown, ChevronUp, X, SortAsc } from "lucide-react"
import { FilterState } from "../../types/filters"

interface ProductFiltersProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  availableBrands: string[]
  sortBy: "name" | "price" | "brand" | "year"
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: "name" | "price" | "brand" | "year") => void
  showFilters: boolean
  onToggleFilters: () => void
  onClearFilters: () => void
  className?: string
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  availableBrands,
  sortBy,
  sortOrder,
  onSortChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  className = "",
}) => {
  const handleBrandToggle = (brand: string) => {
    const newSelectedBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand]

    onFilterChange({ selectedBrands: newSelectedBrands })
  }

  // ✅ FUNCIÓN SIMPLIFICADA - SOLO MARCAS Y STOCK
  const getActiveFiltersCount = () => {
    let count = 0

    // Marcas activas si hay alguna seleccionada
    if (filters.selectedBrands.length > 0) count++

    // Stock activo si no es "all"
    if (filters.stockFilter !== "all") count++

    return count
  }

  // ✅ FUNCIONES PARA REMOVER FILTROS - SOLO LAS NECESARIAS
  const removeBrandFilter = (brand: string) => {
    handleBrandToggle(brand)
  }

  const removeStockFilter = () => {
    onFilterChange({ stockFilter: "all" })
  }

  return (
    <div className={className}>
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de marcas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marcas
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableBrands.length > 0 ? (
                  availableBrands.map((brand) => (
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
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    Haz una búsqueda para ver marcas disponibles
                  </p>
                )}
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
                  onFilterChange({
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
              onClick={onClearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* ✅ CHIPS DE FILTROS ACTIVOS - SOLO MARCAS Y STOCK */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Chips de marcas */}
          {filters.selectedBrands.map((brand) => (
            <span
              key={brand}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {brand}
              <button onClick={() => removeBrandFilter(brand)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Chip de stock */}
          {filters.stockFilter !== "all" && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              {filters.stockFilter === "inStock" ? "En Stock" : "Sin Stock"}
              <button onClick={removeStockFilter}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Controles de filtros y ordenamiento */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Botón de filtros */}
        <div className="flex justify-between items-center">
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
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

        {/* Controles de ordenamiento */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">Ordenar por:</span>
          {[
            { key: "name" as const, label: "Nombre", defaultOrder: "asc" },
            { key: "brand" as const, label: "Marca", defaultOrder: "asc" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSortChange(key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                sortBy === key
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
              {sortBy === key && (
                <div className="flex items-center gap-1">
                  <SortAsc
                    size={14}
                    className={`transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-xs">
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
