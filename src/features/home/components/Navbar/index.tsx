"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const Navbar = () => {
  const [open, setOpen] = useState(false)

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Repuestos", href: "/repuestos" },
    { label: "Categorías", href: "/categorias" },
    { label: "Contacto", href: "/contacto" },
  ]

  return (
    <header className="w-full border-2 shadow-sm border-red-600">
      <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-7xl mx-auto">
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold text-primary">
          AutoParts
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <Link href="/carrito">
            <ShoppingCart className="w-5 h-5 hover:text-primary" />
          </Link>

          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px]">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col space-y-4 mt-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/carrito"
                className="flex items-center space-x-2 mt-4"
                onClick={() => setOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Navbar
