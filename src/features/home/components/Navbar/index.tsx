"use client"



import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, ShoppingCart, User, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence, useScroll, useTransform, Variants } from "framer-motion"

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -10])
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])

  const navItems = [
    { label: "Inicio", href: "/", icon: "🏠" },
    { label: "Repuestos", href: "/repuestos", icon: "⚙️" },
    { label: "Categorías", href: "/categorias", icon: "📂" },
    { label: "Contacto", href: "/contacto", icon: "📞" },
  ]

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animaciones de container
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        staggerChildren: 0.1
      }
    }
  }

  // Animaciones de items del nav
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  }

  // Animación del logo
  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut" as const
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0] as const,
      transition: { duration: 0.5 }
    }
  }

  // Partículas flotantes
  const FloatingParticle = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute w-1 h-1 bg-red-400 rounded-full"
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: [0, 1, 0],
        y: [100, -20],
        x: [0, Math.random() * 100 - 50],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  )

  return (
    <motion.header
      style={{ y: headerY, opacity: headerOpacity }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "backdrop-blur-md bg-black/90" : "bg-black"
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Forma diagonal animada */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,0 L1200,0 L1200,70 Q600,100 0,70 Z"
              fill="url(#animatedGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <motion.stop
                  offset="0%"
                  stopColor="#dc2626"
                  animate={{ stopColor: ["#dc2626", "#ef4444", "#dc2626"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.stop
                  offset="50%"
                  stopColor="#991b1b"
                  animate={{ stopColor: ["#991b1b", "#dc2626", "#991b1b"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.stop
                  offset="100%"
                  stopColor="#7f1d1d"
                  animate={{ stopColor: ["#7f1d1d", "#991b1b", "#7f1d1d"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
        {/* LOGO ultra animado */}
        <motion.div variants={logoVariants} whileHover="hover">
          <Link href="/" className="group relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-xl blur-lg"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.span
              className="relative z-10 text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent"
              whileHover={{
                backgroundSize: "200% 200%",
                backgroundPosition: "100% 0%",
              }}
            >
              AutoParts
            </motion.span>
            {/* Efectos de chispas */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Desktop Nav ultra dinámico */}
        <motion.nav
          className="hidden md:flex space-x-6 items-center"
          variants={containerVariants}
        >
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={itemVariants}
              whileHover="hover"
              className="relative"
            >
              <Link
                href={item.href}
                className="group relative flex items-center space-x-2 px-4 py-2 rounded-xl"
              >
                {/* Fondo animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 rounded-xl"
                  whileHover={{
                    background: "linear-gradient(90deg, rgba(220,38,38,0.2), rgba(239,68,68,0.3))",
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Ícono animado */}
                <motion.span
                  className="text-lg"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.icon}
                </motion.span>
                
                {/* Texto */}
                <motion.span
                  className="relative z-10 text-white font-medium"
                  whileHover={{ color: "#fca5a5" }}
                >
                  {item.label}
                </motion.span>

                {/* Línea mágica */}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />

                {/* Efectos de partículas en hover */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  whileHover={{
                    background: "radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)",
                  }}
                />
              </Link>
            </motion.div>
          ))}

          {/* Botón CREAR PRODUCTO épico */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/form" className="relative group">
              <motion.div
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold border-2 border-red-500 hover:border-red-400 transition-all duration-300 shadow-lg"
                whileHover={{
                  boxShadow: "0 0 25px rgba(220,38,38,0.6)",
                  background: "linear-gradient(90deg, #dc2626, #b91c1c)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(220,38,38,0.4)",
                    "0 0 25px rgba(220,38,38,0.6)",
                    "0 0 15px rgba(220,38,38,0.4)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ x: 2 }}
                >
                  <Zap className="w-4 h-4" />
                  Crear Repuesto
                </motion.span>
                
                {/* Efecto de brillo */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* Carrito súper animado */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/carrito" className="relative group">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-700/30 backdrop-blur-sm border border-red-500/30"
                whileHover={{
                  boxShadow: "0 0 30px rgba(220,38,38,0.5)",
                  borderColor: "rgba(239,68,68,0.8)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(220,38,38,0.3)",
                    "0 0 30px rgba(220,38,38,0.5)",
                    "0 0 20px rgba(220,38,38,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div whileHover={{ rotate: [0, -10, 10, 0] }}>
                  <ShoppingCart className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Badge ultra animado */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center border-2 border-white"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.3 }}
              >
                <span className="text-xs font-bold text-white">3</span>
                {/* Ping effect */}
                <motion.div
                  className="absolute inset-0 bg-red-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* Avatar SIN giro mareante */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <motion.div
              className="p-1 rounded-full bg-gradient-to-r from-red-500 to-red-700"
              whileHover={{
                boxShadow: "0 0 20px rgba(220,38,38,0.6)",
                scale: 1.05
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Avatar className="w-10 h-10 cursor-pointer border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-br from-white to-gray-100 text-black font-bold">
                    AG
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </motion.div>
            
            {/* Pulso sutil en lugar de giro */}
            <motion.div
              className="absolute inset-0 border-2 border-red-400/30 rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.nav>

        {/* Mobile Menu Button épico */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <motion.div 
              className="md:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-600/30 relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
                {/* Efecto de onda */}
                <motion.div
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 2, opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </SheetTrigger>
          
          {/* Mobile Menu ultra dinámico */}
          <SheetContent side="left" className="w-[300px] bg-black border-r border-red-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black" />
            
            <SheetHeader className="border-b border-red-500/20 pb-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SheetTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                  AutoParts
                </SheetTitle>
              </motion.div>
            </SheetHeader>

            <motion.div
              className="flex flex-col space-y-4 mt-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, staggerChildren: 0.1 }}
            >
              {/* Crear Producto destacado en mobile */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ x: 10 }}
              >
                <Link
                  href="/create-product"
                  className="group flex items-center space-x-4 text-white font-medium p-4 rounded-xl bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 hover:from-red-600/50 hover:to-red-700/40 transition-all duration-300 mb-2"
                  onClick={() => setOpen(false)}
                >
                  <motion.span
                    className="text-2xl"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                  >
                    ⚡
                  </motion.span>
                  <span className="text-lg font-bold">Crear Repuesto</span>
                  <motion.div
                    className="ml-auto w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.5 }}
                  />
                </Link>
              </motion.div>

              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-center space-x-4 text-white font-medium p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/10 transition-all duration-300"
                    onClick={() => setOpen(false)}
                  >
                    <motion.span
                      className="text-2xl"
                      whileHover={{ scale: 1.3, rotate: 15 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className="text-lg">{item.label}</span>
                    <motion.div
                      className="ml-auto w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.5 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Efectos de fondo en mobile */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                  animate={{
                    y: [0, -100],
                    opacity: [0, 1, 0],
                    x: Math.random() * 300,
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Línea de energía inferior */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5],
          scaleX: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.header>
  )
}

export default Navbar