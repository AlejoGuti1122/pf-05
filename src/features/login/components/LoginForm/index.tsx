"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

const Form = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ email: "", password: "" })

  const handleSubmit = () => {
    const newErrors = { email: "", password: "" }

    // Validar email
    if (!email) {
      newErrors.email = "El email es requerido"
    } else if (!email.includes("@")) {
      newErrors.email = "Email inválido"
    }

    // Validar contraseña
    if (!password) {
      newErrors.password = "La contraseña es requerida"
    } else if (password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres"
    }

    setErrors(newErrors)

    // Si no hay errores, enviar
    if (!newErrors.email && !newErrors.password) {
      alert("¡Login exitoso!")
      console.log({ email, password })
    }
  }

  return (
    <div className="p-6 flex justify-center items-center flex-col">
      <p className="text-center font-bold text-2xl mb-6">INICIAR SESIÓN</p>

      <div className="mt-4 w-80">
        <p className="mb-1 font-medium">Email</p>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={
            errors.email && errors.email.length > 0 ? "border-red-500" : ""
          }
        />
        {errors.email && errors.email.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mt-4 w-80">
        <p className="mb-1 font-medium">Contraseña</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={
            errors.password && errors.password.length > 0
              ? "border-red-500"
              : ""
          }
        />
        {errors.password && errors.password.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-80 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Iniciar Sesión
      </button>

      <div className="flex justify-center items-center">
        <a href="http://localhost:3001/auth/google">
          <button
            type="button"
            className="mt-4 w-80 h-10 bg-white text-black border border-gray-300 px-4 py-2 rounded-md shadow flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">
              Iniciar sesión con Google
            </span>
          </button>
        </a>
      </div>
    </div>
  )
}

export default Form
