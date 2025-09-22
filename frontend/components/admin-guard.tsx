"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthMe } from "@/services/api/endpoints/auth/auth"
import { Card, CardContent } from "@/components/ui/card"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: user, error, isLoading } = useAuthMe()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !error && user && !user.is_admin) {
      router.replace("/profile")
    }
  }, [user, isLoading, error, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Access denied. Please login.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user.is_admin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Access denied. Admin privileges required.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}