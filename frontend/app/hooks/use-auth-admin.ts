import { useAuthMe } from "@/services/api/endpoints/auth/auth"
import { handleAuthError } from "@/lib/error-handler"
import type { ErrorResponse } from "@/services/api/models"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const useAuthAdmin = () => {
  const router = useRouter()
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useAuthMe()

  // Handle auth errors if needed
  if (error) {
    handleAuthError(error?.response?.data as unknown as ErrorResponse)
  }

  // Check if user is admin
  const isAdmin = user?.is_admin === true

  return { user, error, isLoading, mutate, isAdmin }
}

export const useAuthAdminWithRedirect = () => {
  const { user, error, isLoading, mutate, isAdmin } = useAuthAdmin()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading, user is authenticated, but not admin
    if (!isLoading && user && !isAdmin) {
      router.push("/profile") // or wherever non-admin users should go
    }
  }, [isLoading, user, isAdmin, router])

  return { user, error, isLoading, mutate, isAdmin }
}