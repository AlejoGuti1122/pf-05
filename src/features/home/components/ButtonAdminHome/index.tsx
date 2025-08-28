import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

interface Props {
  user?: User
}

const ButtonAdmin = ({ user }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleDashboardClick = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Botón clickeado - navegando a dashboard")
    console.log("Usuario:", user)
    window.location.href = "/dashboard"
  }

  if (!user?.isAdmin) return null

  return (
    <div className="flex justify-center items-center my-8">
      <motion.div
        className="relative"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTapStart={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
      >
        {/* Glow Effect Background */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 opacity-0 blur-xl"
          variants={{
            hover: {
              opacity: 0.6,
              scale: 1.1,
              transition: { duration: 0.3 },
            },
          }}
        />

        {/* Animated Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-red-500"
          variants={{
            hover: {
              scale: 1.05,
              borderColor: "#ffffff",
              transition: { duration: 0.3 },
            },
          }}
        />

        {/* Main Button */}
        <motion.button
          className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-black via-gray-900 to-black border border-red-500 text-white font-bold text-lg shadow-2xl overflow-hidden cursor-pointer z-50"
          variants={{
            hover: {
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)",
              transition: { duration: 0.2 },
            },
            tap: {
              scale: 0.98,
              transition: { duration: 0.1 },
            },
          }}
          onClick={handleDashboardClick}
          onMouseDown={() => console.log("Mouse down detectado")}
          style={{ pointerEvents: "all" }}
        >
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent -skew-x-12"
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Sparkle Effects */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Button Content */}
          <div className="relative flex items-center justify-center space-x-3">
            {/* Icon */}
            <motion.div
              className="text-red-400"
              variants={{
                hover: {
                  rotate: 360,
                  color: "#ffffff",
                  transition: { duration: 0.5 },
                },
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 10.93 5.16-1.191 9-5.38 9-10.93V7l-10-5z" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </motion.div>

            {/* Text */}
            <motion.span
              className="relative"
              variants={{
                hover: {
                  color: "#ffffff",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              DASHBOARD ADMIN
            </motion.span>

            {/* Arrow */}
            <motion.div
              className="text-red-400"
              variants={{
                hover: {
                  x: 5,
                  color: "#ffffff",
                  transition: { duration: 0.2 },
                },
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
              </svg>
            </motion.div>
          </div>

          {/* Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-red-500 via-transparent to-red-500 opacity-0"
            variants={{
              hover: {
                opacity: 0.3,
                transition: { duration: 0.3 },
              },
            }}
            style={{
              background:
                "linear-gradient(90deg, #ef4444 0%, transparent 50%, #ef4444 100%)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
            }}
          />
        </motion.button>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-red-500 opacity-0"
          animate={
            isPressed
              ? {
                  scale: [1, 1.2],
                  opacity: [0.5, 0],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </div>
  )
}

export default ButtonAdmin
