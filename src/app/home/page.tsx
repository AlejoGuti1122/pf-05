"use client"

import Navbar from "@/features/home/components/Navbar"
import ProductCardsList from "@/features/home/components/ProductCardList"

import React, { useState } from "react"

const PageHome = () => {
  // Estado global de búsqueda (opcional)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section (opcional) */}
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

        {/* Products Section */}
        <section>
          <ProductCardsList
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            className="w-full"
          />
        </section>
      </main>
    </div>
  )
}

export default PageHome
