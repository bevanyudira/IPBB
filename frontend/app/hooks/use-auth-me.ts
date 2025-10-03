import { useGetMyProfile } from "@/services/api/profile"
import { handleAuthError } from "@/lib/error-handler"
import type { ErrorResponse } from "@/services/api/models"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export const useAuthMeWithRedirect = () => {
  const router = useRouter()
  const pathname = usePathname()
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useGetMyProfile()

  // Handle auth errors if needed
  if (error) {
    handleAuthError(error?.response?.data as unknown as ErrorResponse)
  }

  // Redirect unverified users to verification page
  useEffect(() => {
    // Only redirect when we have confirmed user data (not loading and data exists)
    // This prevents redirect during loading state which causes the loop
    if (!isLoading && user?.user) {
      // Check if user is not verified and not already on verification page
      if (user.user.is_verified === false && pathname !== "/profile/verification") {
        router.replace("/profile/verification")
      }
    }
  }, [user, isLoading, pathname, router])

  return { user, error, isLoading, mutate }
}
