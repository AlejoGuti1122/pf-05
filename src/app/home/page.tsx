import CarouselHome from "@/features/home/components/Carousel"
import Navbar from "@/features/home/components/Navbar"
import React from "react"

const PageHome = () => {
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="flex justify-center items-center overflow-hidden mt-8 mb-7 h-72">
        <CarouselHome />
      </div>
    </div>
  )
}

export default PageHome
