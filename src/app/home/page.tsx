/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Navbar from "@/features/home/components/Navbar"
import ProductCardsList from "@/features/home/components/ProductCardList"
import SearchBarWithAPI from "@/features/home/components/Searchbar"

import Image from "next/image"

import React, { useState } from "react"

const PageHome = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([]) // ✅ Tipo definido

  // ✅ Handler para recibir resultados del SearchBar
  const handleResultsChange = (results: any[]) => {
    console.log("🎯 PADRE - Results received:", results)
    setSearchResults(results)
  }

  // ✅ Handler para term changes
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)
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

        <div>
          <SearchBarWithAPI
            onResultsChange={handleResultsChange}
            onSearchTermChange={handleSearchTermChange}
          />
        </div>

        {/* ✅ Mostrar resultados de búsqueda si los hay */}
        {searchResults.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Resultados de búsqueda ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((product: any) => (
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
                          // ✅ Imagen de fallback si falla la carga
                          const target = e.target as HTMLImageElement
                          target.src =
                            "https://via.placeholder.com/80x80/e2e8f0/94a3b8?text=Sin+Imagen"
                        }}
                      />
                    </div>

                    {/* ✅ INFORMACIÓN A LA DERECHA */}
                    <div className="flex-1 min-w-0">
                      {" "}
                      {/* min-w-0 para truncar texto largo */}
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
          </section>
        ) : (
          /* ✅ Mostrar productos normales cuando no hay búsqueda */
          <section>
            <ProductCardsList
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              className="w-full"
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default PageHome
