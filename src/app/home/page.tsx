/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Navbar from "@/features/home/components/Navbar"
import ProductCardsList from "@/features/home/components/ProductCardList"
import ProductFilters from "@/features/home/components/ProductFilters"
import SearchBarWithAPI from "@/features/home/components/Searchbar"
import { FilterState } from "@/features/home/types/filters"

import Image from "next/image"

import React, { useState, useMemo } from "react"

const PageHome = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])

  // ✅ FILTROS SIMPLIFICADOS - SOLO MARCAS Y STOCK
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 0 }, // Ya no se usa pero mantenemos por compatibilidad
    selectedBrands: [],
    yearRange: { min: 0, max: 0 }, // Ya no se usa pero mantenemos por compatibilidad
    stockFilter: "all",
  })

  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">(
    "name"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)

  // MARCAS DISPONIBLES
  const availableBrands = useMemo(() => {
    if (!searchResults.length) return []
    return [...new Set(searchResults.map((p: any) => p.brand))].sort()
  }, [searchResults])

  // Handlers para búsqueda
  const handleResultsChange = (results: any[]) => {
    console.log("🎯 PADRE - Results received:", results)
    setSearchResults(results)
  }

  // ✅ LÓGICA DE FILTRADO SIMPLIFICADA - SOLO MARCAS Y STOCK
  const filteredSearchResults = useMemo(() => {
    if (!searchResults.length) return []

    console.log("🔍 Filtros actuales:", filters)

    return searchResults
      .filter((product: any) => {
        // ✅ FILTRO DE MARCA - ÚNICO FILTRO PRINCIPAL
        if (filters.selectedBrands.length > 0) {
          if (!filters.selectedBrands.includes(product.brand)) {
            console.log(`❌ ${product.name} filtrado por marca`)
            return false
          }
        }

        // ✅ FILTRO DE STOCK - ÚNICO FILTRO SECUNDARIO
        if (filters.stockFilter !== "all") {
          const hasStock = product.stock > 0
          if (filters.stockFilter === "inStock" && !hasStock) {
            console.log(`❌ ${product.name} filtrado por stock (sin stock)`)
            return false
          }
          if (filters.stockFilter === "outOfStock" && hasStock) {
            console.log(`❌ ${product.name} filtrado por stock (con stock)`)
            return false
          }
        }

        console.log(`✅ ${product.name} pasa todos los filtros`)
        return true
      })
      .sort((a: any, b: any) => {
        // ✅ ORDENAMIENTO CORREGIDO - SEPARAR LÓGICA NUMÉRICA Y ALFABÉTICA
        if (sortBy === "price" || sortBy === "year") {
          // ✅ Para números: convertir a Number y comparar directamente
          const aValue = Number(a[sortBy])
          const bValue = Number(b[sortBy])

          console.log(
            `🔢 Ordenando ${sortBy}: ${a.name} (${aValue}) vs ${b.name} (${bValue})`
          )

          if (sortOrder === "asc") {
            return aValue - bValue // ✅ Ascendente: menor a mayor
          } else {
            return bValue - aValue // ✅ Descendente: mayor a menor
          }
        } else {
          // ✅ Para texto: convertir a string y comparar alfabéticamente
          const aValue = String(a[sortBy]).toLowerCase()
          const bValue = String(b[sortBy]).toLowerCase()

          if (sortOrder === "asc") {
            return aValue.localeCompare(bValue) // ✅ A-Z
          } else {
            return bValue.localeCompare(aValue) // ✅ Z-A
          }
        }
      })
  }, [searchResults, filters, sortBy, sortOrder])

  // ✅ CONTAR FILTROS ACTIVOS - SOLO MARCAS Y STOCK
  const activeFiltersCount = useMemo(() => {
    let count = 0

    // Marcas activas si hay alguna seleccionada
    if (filters.selectedBrands.length > 0) count++

    // Stock activo si no es "all"
    if (filters.stockFilter !== "all") count++

    return count
  }, [filters])

  // HANDLERS PARA FILTROS
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    console.log("🔄 Cambiando filtros:", newFilters)
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      // ✅ Si ya está seleccionado, cambiar orden
      setSortOrder((prev: "asc" | "desc") => (prev === "asc" ? "desc" : "asc"))
    } else {
      // ✅ CAMBIO: Para precio y año, empezar con desc (mayor a menor)
      setSortBy(newSortBy)
      if (newSortBy === "price" || newSortBy === "year") {
        setSortOrder("desc") // ✅ Mayor a menor por defecto
      } else {
        setSortOrder("asc") // ✅ A-Z para texto
      }
    }
  }

  const handleToggleFilters = () => {
    setShowFilters((prev: boolean) => !prev)
  }

  // ✅ LIMPIAR FILTROS - SOLO MARCAS Y STOCK
  const handleClearFilters = () => {
    console.log("🧹 Limpiando filtros")
    setFilters({
      priceRange: { min: 0, max: 0 },
      selectedBrands: [],
      yearRange: { min: 0, max: 0 },
      stockFilter: "all",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header>
        <Navbar />
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 mt-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Nuestros Productos
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra los mejores repuestos de vehículos con la mejor calidad y garantía
            </p>
          </div>
        </section>

        {/* SearchBar */}
        <div>
          <SearchBarWithAPI
            onResultsChange={handleResultsChange}
            onSearchTermChange={() => {}} // ✅ Función vacía si no necesitas el término
          />
        </div>

        {/* Filtros SOLO cuando hay resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableBrands={availableBrands}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
              onClearFilters={handleClearFilters}
              className="mb-4"
            />
          </div>
        )}

        {/* Mostrar resultados de búsqueda FILTRADOS */}
        {searchResults.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Resultados de búsqueda ({filteredSearchResults.length} de{" "}
              {searchResults.length})
              {activeFiltersCount > 0 && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  • {activeFiltersCount} filtro
                  {activeFiltersCount > 1 ? "s" : ""} aplicado
                  {activeFiltersCount > 1 ? "s" : ""}
                </span>
              )}
            </h2>

            {/* ✅ DEBUG INFO SIMPLIFICADO - TEMPORAL */}
            {activeFiltersCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                <strong>Filtros activos:</strong>
                {filters.selectedBrands.length > 0 ? (
                  <span className="ml-2 text-blue-700">
                    Marcas: {filters.selectedBrands.join(", ")}
                  </span>
                ) : null}
                {filters.stockFilter !== "all" ? (
                  <span className="ml-2 text-blue-700">
                    Stock:{" "}
                    {filters.stockFilter === "inStock"
                      ? "En Stock"
                      : "Sin Stock"}
                  </span>
                ) : null}
              </div>
            )}

            {filteredSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSearchResults.map((product: any) => (
                  <div
                    key={product.id}
                    className="border p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={product.imgUrl}
                          alt={product.name}
                          width={20}
                          height={20}
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src =
                              "https://via.placeholder.com/80x80/e2e8f0/94a3b8?text=Sin+Imagen"
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold text-lg mb-2 text-gray-800 truncate"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        <p className="text-green-600 text-xl font-semibold mb-1">
                          ${product.price}
                        </p>
                        <p className="text-gray-600 mb-1 text-sm">
                          Stock:{" "}
                          <span
                            className={`font-medium ${
                              product.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </p>
                        <p
                          className="text-sm text-gray-500 truncate"
                          title={`${product.brand} ${product.model} (${product.year})`}
                        >
                          {product.brand} {product.model} ({product.year})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  No se encontraron productos que coincidan con los filtros
                  aplicados.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </section>
        ) : (
          <section>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableBrands={[]}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
              onClearFilters={handleClearFilters}
              className="mb-4"
            />

            <ProductCardsList
              filters={filters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              className="w-full"
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default PageHome
