/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import ButtonAdmin from "@/features/home/components/ButtonAdminHome"
import ProductCardsList from "@/features/home/components/ProductCardList"
import ProductFilters from "@/features/home/components/ProductFilters"
import SearchBarWithAPI from "@/features/home/components/Searchbar"
import { FilterState } from "@/features/home/types/filters"
import LayoutWrapper from "@/shared/Wrapper"

import Image from "next/image"
import React, { useState, useMemo, useEffect } from "react"

const PageHome = () => {
  // ESTADOS
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 0 },
    selectedBrands: [],
    yearRange: { min: 1990, max: new Date().getFullYear() },
  })
  const [sortBy, setSortBy] = useState<"name" | "price" | "brand" | "year">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)

  // MANEJAR GOOGLE AUTH Y CARGAR USUARIO
  useEffect(() => {
    // DEBUG URL/Auth
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    const data = urlParams.get("data")

    // NUEVO FORMATO: data con access_token y user
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        const accessToken =
          parsedData.access_Token || parsedData.accessToken || parsedData.token
        if (accessToken && parsedData.user) {
          localStorage.setItem("token", accessToken)
          localStorage.setItem("user", JSON.stringify(parsedData.user))
          window.dispatchEvent(new CustomEvent("auth-updated"))
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {
        // noop
      }
    } else if (token) {
      try {
        if (
          token === "[object Object]" ||
          token.includes("[object") ||
          token.includes("Object]")
        ) {
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          localStorage.setItem("token", token)
          window.dispatchEvent(new CustomEvent("auth-updated"))
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch {
        // noop
      }
    }

    // Cargar usuario del localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setCurrentUser(parsedUser)
      } catch {
        // noop
      }
    }
  }, [])

  // MARCAS DISPONIBLES
  const availableBrands = useMemo(() => {
    if (!searchResults.length) return []
    return [...new Set(searchResults.map((p: any) => p.brand))].sort()
  }, [searchResults])

  // RESULTADOS FILTRADOS
  const filteredSearchResults = useMemo(() => {
    if (!searchResults.length) return []
    return searchResults
      .filter((product: any) => {
        // Filtro de marca
        if (filters.selectedBrands.length > 0) {
          if (!filters.selectedBrands.includes(product.brand)) return false
        }
        // Filtro de año
        if (
          filters.yearRange.min > 1990 ||
          filters.yearRange.max < new Date().getFullYear()
        ) {
          const productYear = parseInt(product.year)
          if (
            productYear < filters.yearRange.min ||
            productYear > filters.yearRange.max
          ) {
            return false
          }
        }
        return true
      })
      .sort((a: any, b: any) => {
        if (sortBy === "price" || sortBy === "year") {
          const aValue = Number(a[sortBy])
          const bValue = Number(b[sortBy])
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        } else {
          const aValue = String(a[sortBy]).toLowerCase()
          const bValue = String(b[sortBy]).toLowerCase()
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
      })
  }, [searchResults, filters, sortBy, sortOrder])

  // CONTAR FILTROS ACTIVOS
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.selectedBrands.length > 0) count++
    if (
      filters.yearRange.min > 1990 ||
      filters.yearRange.max < new Date().getFullYear()
    )
      count++
    return count
  }, [filters])

  // HANDLERS
  const handleResultsChange = (results: any[]) => {
    setSearchResults(results)
  }

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev: "asc" | "desc") => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === "price" || newSortBy === "year" ? "desc" : "asc")
    }
  }

  const handleToggleFilters = () => setShowFilters((prev: boolean) => !prev)

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 0 },
      selectedBrands: [],
      yearRange: { min: 1990, max: new Date().getFullYear() },
    })
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {/* Header: título + botón admin (en desktop) */}
          <section className="mb-8 mt-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Nuestros Productos
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Encuentra los mejores repuestos de vehículos con la mejor
                  calidad y garantía
                </p>
              </div>

              {/* Botón admin: visible sólo desde md+ */}
              <div className="hidden md:block">
                <ButtonAdmin user={currentUser} />
              </div>
            </div>
          </section>

          {/* SearchBar */}
          <div>
            <SearchBarWithAPI
              onResultsChange={handleResultsChange}
              onSearchTermChange={() => {}}
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

              {activeFiltersCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                  <strong>Filtros activos:</strong>
                  {filters.selectedBrands.length > 0 && (
                    <span className="ml-2 text-blue-700">
                      Marcas: {filters.selectedBrands.join(", ")}
                    </span>
                  )}
                  {(filters.yearRange.min > 1990 ||
                    filters.yearRange.max < new Date().getFullYear()) && (
                    <span className="ml-2 text-blue-700">
                      Años: {filters.yearRange.min} - {filters.yearRange.max}
                    </span>
                  )}
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
                              target.src = "/images/no-image-placeholder.png"
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
                                product.stock > 0 ? "text-green-600" : "text-red-600"
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
                    No se encontraron productos que coincidan con los filtros aplicados.
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

        {/* FAB móvil (solo < md) */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <ButtonAdmin user={currentUser} />
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default PageHome
