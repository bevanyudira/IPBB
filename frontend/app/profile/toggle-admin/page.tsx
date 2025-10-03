"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { useToast } from "@/hooks/use-toast"

export default function ToggleAdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const toggleAdmin = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("No authentication token found")
          router.push("/login")
          return
        }

        const response = await fetch("/api/profile/toggle-admin", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Toggle admin failed:", errorData)
          toast({
            title: "Error",
            description: "Failed to toggle admin status",
            variant: "destructive",
          })
        } else {
          const data = await response.json()

          // Invalidate and refetch all user-related data
          await mutate("/auth/me")
          await mutate("/profile/me")

          toast({
            title: "Success",
            description: data.message || `Admin status ${data.is_admin ? 'enabled' : 'disabled'}`,
          })
        }
      } catch (error) {
        console.error("Failed to toggle admin status:", error)
        toast({
          title: "Error",
          description: "Failed to toggle admin status",
          variant: "destructive",
        })
      } finally {
        router.push("/profile")
      }
    }

    toggleAdmin()
  }, [router, toast])

  return (
    <div className="container mx-auto p-4">
      <p>Toggling admin status...</p>
    </div>
  )
}