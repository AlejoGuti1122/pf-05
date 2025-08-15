/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useProfile.ts
"use client"

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { UpdateProfileRequest, UserProfile, UserStats } from '../types/profile-types'
import { userService } from '../services/profile-services'


export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage
    setError(message)
    toast.error(message)
    console.error('❌ [useProfile] Error:', error)
  }, [])

  // Obtener perfil del usuario
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🔄 [useProfile] Cargando perfil...")

      const profileData = await userService.getCurrentUserProfile()
      console.log("✅ [useProfile] Perfil cargado:", profileData)
      
      setProfile(profileData)
    } catch (error) {
      handleError(error, "Error al cargar el perfil")
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Actualizar perfil
  const updateProfile = useCallback(async (updateData: UpdateProfileRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("✏️ [useProfile] Actualizando perfil:", updateData)

      const updatedProfile = await userService.updateUserProfile(updateData)
      
      setProfile(updatedProfile)
      toast.success("Perfil actualizado correctamente")
      
      return updatedProfile
    } catch (error) {
      handleError(error, "Error al actualizar el perfil")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await userService.getUserStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      // No mostrar error para stats, son opcionales
    }
  }, [])

  // Cargar datos al montar
  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [fetchProfile, fetchStats])

  return {
    // Estado
    profile,
    stats,
    isLoading,
    error,

    // Acciones
    updateProfile,
    refetchProfile: fetchProfile,
    refetchStats: fetchStats,
  }
}