"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ToggleAdminPage() {
  const router = useRouter()

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
        }
      } catch (error) {
        console.error("Failed to toggle admin status:", error)
      } finally {
        router.push("/profile")
      }
    }

    toggleAdmin()
  }, [router])

  return (
    <div className="container mx-auto p-4">
      <p>Toggling admin status...</p>
    </div>
  )
}