import React from "react"
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Shield,
  Truck,
  CreditCard,
  Wrench,
  Settings,
  Zap,
  ArrowUp,
} from "lucide-react"

const RepuStoreFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const categories = [
    { name: "Motor", icon: Settings },
    { name: "Frenos", icon: Zap },
    { name: "Suspensión", icon: Wrench },
    { name: "Eléctrico", icon: Zap },
    { name: "Filtros", icon: Settings },
    { name: "Aceites", icon: Wrench },
  ]

  const brands = [
    "Toyota",
    "Chevrolet",
    "Nissan",
    "Ford",
    "Hyundai",
    "Kia",
    "Mazda",
    "Volkswagen",
  ]

  const services = [
    { name: "Envío Gratis", description: "En compras > $200.000", icon: Truck },
    { name: "Garantía", description: "Hasta 2 años", icon: Shield },
    { name: "Pago Seguro", description: "SSL Certificado", icon: CreditCard },
  ]

  return (
    <footer className="bg-black text-white relative">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Services Banner */}
      <div className="bg-red-600 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-center md:justify-start gap-3 text-center md:text-left"
              >
                <div className="bg-white/20 p-3 rounded-lg">
                  <service.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{service.name}</h4>
                  <p className="text-red-100 text-sm">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">RepuStore</h2>
                  <p className="text-gray-400 text-sm">Repuestos para Autos</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Tu tienda de confianza para repuestos automotrices. Más de 15
                años brindando calidad y servicio excepcional en Colombia.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-red-500" />
                  <span>+57 (6) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-red-500" />
                  <span>info@repustore.com</span>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-red-500 mt-1" />
                  <span>
                    Carrera 23 #45-67
                    <br />
                    Manizales, Caldas
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span>Lun - Sáb: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Categorías Populares
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-gray-900 p-2 rounded-lg transition-all duration-200"
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Marcas Disponibles
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-300 hover:text-red-400 text-sm py-1 hover:bg-gray-900 px-2 rounded transition-all duration-200"
                  >
                    {brand}
                  </a>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold text-white mb-2">
                  💡 ¿No encuentras tu marca?
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Contáctanos y te ayudamos a encontrar el repuesto que
                  necesitas.
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Contactar Ahora
                </button>
              </div>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Mantente Conectado
              </h3>

              <div className="mb-6">
                <p className="text-gray-300 text-sm mb-4">
                  Suscríbete y recibe ofertas exclusivas y novedades sobre
                  repuestos.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Suscribir
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Síguenos</h4>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-colors group"
                  >
                    <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-colors group"
                  >
                    <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-colors group"
                  >
                    <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">
                  🚗 Instalación Profesional
                </h4>
                <p className="text-gray-300 text-sm">
                  Ofrecemos servicio de instalación con mecánicos certificados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2025 RepuStore. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Desarrollado con ❤️ en Manizales, Colombia
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Términos de Servicio
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Garantías
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Devoluciones
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default RepuStoreFooter
