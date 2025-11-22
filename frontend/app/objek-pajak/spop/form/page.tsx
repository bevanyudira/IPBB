"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"
import { useToast } from "@/hooks/use-toast"
import { SpopForm } from "@/components/spop/spop-form"
import type { UserRead } from "@/services/api/models/userRead"

export default function SpopFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [spopData, setSpopData] = useState(null)
  const [mode, setMode] = useState("create")
  const [sidebarUser, setSidebarUser] = useState<UserRead | undefined>(undefined)

  // Fetch user data for sidebar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token")
        if (!token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setSidebarUser(userData)
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const nop = searchParams.get("nop")
    if (nop && nop.length === 18) {
      setMode("edit")
      loadSpopData(nop)
    }
  }, [searchParams])

  const loadSpopData = async (nop) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const kdPropinsi = nop.substring(0, 2)
      const kdDati2 = nop.substring(2, 4)
      const kdKecamatan = nop.substring(4, 7)
      const kdKelurahan = nop.substring(7, 10)
      const kdBlok = nop.substring(10, 13)
      const noUrut = nop.substring(13, 17)
      const kdJnsOp = nop.substring(17, 18)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/${kdPropinsi}/${kdDati2}/${kdKecamatan}/${kdKelurahan}/${kdBlok}/${noUrut}/${kdJnsOp}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Data SPOP tidak ditemukan")
      }

      const data = await response.json()
      setSpopData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data SPOP",
        variant: "destructive",
      })
      router.push("/objek-pajak/spop")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    toast({
      title: "Berhasil",
      description: mode === "create" ? "Data SPOP berhasil ditambahkan" : "Data SPOP berhasil diperbarui",
    })
    router.push("/objek-pajak/spop")
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "create" ? "Tambah SPOP Baru" : "Edit SPOP"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "create" ? "Isi formulir untuk menambahkan data objek pajak baru" : "Perbarui data objek pajak"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <SpopForm mode={mode} initialData={spopData} onSuccess={handleSuccess} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
