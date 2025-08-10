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
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  // ✅ Estados para filtros - CORREGIDO: stockFilter por defecto "all"
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: Infinity },
    selectedBrands: [],
    yearRange: { min: 0, max: new Date().getFullYear() },
    stockFilter: "all", // ✅ CORREGIDO: Cambiar de "inStock" a "all"
  })

  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">(
    "name"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)

  // ✅ MARCAS DISPONIBLES (extraídas de searchResults)
  const availableBrands = useMemo(() => {
    if (!searchResults.length) return []
    return [...new Set(searchResults.map((p: any) => p.brand))].sort()
  }, [searchResults])

  // ✅ Handlers para búsqueda
  const handleResultsChange = (results: any[]) => {
    console.log("🎯 PADRE - Results received:", results)
    setSearchResults(results)
  }

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)
  }

  // ✅ FILTRAR searchResults BASADO EN LOS FILTROS
  const filteredSearchResults = useMemo(() => {
    if (!searchResults.length) return []

    return searchResults
      .filter((product: any) => {
        // Filtro de precio
        const price = Number(product.price)
        const matchesPrice =
          price >= filters.priceRange.min && price <= filters.priceRange.max

        // Filtro de marca
        const matchesBrand =
          filters.selectedBrands.length === 0 ||
          filters.selectedBrands.includes(product.brand)

        // Filtro de año
        const year = Number(product.year)
        const matchesYear =
          year >= filters.yearRange.min && year <= filters.yearRange.max

        // Filtro de stock
        const matchesStock =
          filters.stockFilter === "all" ||
          (filters.stockFilter === "inStock" && product.stock > 0) ||
          (filters.stockFilter === "outOfStock" && product.stock === 0)

        return matchesPrice && matchesBrand && matchesYear && matchesStock
      })
      .sort((a: any, b: any) => {
        // Ordenamiento
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
  }, [searchResults, filters, sortBy, sortOrder])

  // ✅ HANDLERS PARA FILTROS
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev: "asc" | "desc") => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

  const handleToggleFilters = () => {
    setShowFilters((prev: boolean) => !prev)
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: Infinity },
      selectedBrands: [],
      yearRange: { min: 0, max: new Date().getFullYear() },
      stockFilter: "all", // ✅ CORREGIDO: Cambiar de "inStock" a "all"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header>
        <Navbar />
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Nuestros Productos
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra los mejores vehículos con la mejor calidad y garantía
            </p>
          </div>
        </section>

        {/* ✅ SearchBar restaurado */}
        <div>
          <SearchBarWithAPI
            onResultsChange={handleResultsChange}
            onSearchTermChange={handleSearchTermChange}
          />
        </div>

        {/* ✅ Filtros SOLO cuando hay resultados de búsqueda */}
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

        {/* ✅ Mostrar resultados de búsqueda FILTRADOS si los hay */}
        {searchResults.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Resultados de búsqueda ({filteredSearchResults.length} de{" "}
              {searchResults.length})
            </h2>
            {filteredSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSearchResults.map((product: any) => (
                  <div
                    key={product.id}
                    className="border p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* ✅ IMAGEN A LA IZQUIERDA */}
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

                      {/* ✅ INFORMACIÓN A LA DERECHA */}
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
              // Mensaje cuando no hay resultados después de filtrar
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron productos que coincidan con los filtros
                  aplicados.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </section>
        ) : (
          /* ✅ Mostrar productos de la API cuando no hay búsqueda - CON FILTROS */
          <section>
            {/* ✅ Filtros para ProductCardsList también */}
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableBrands={[]} // Se llenará desde useProductsFiltered
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
