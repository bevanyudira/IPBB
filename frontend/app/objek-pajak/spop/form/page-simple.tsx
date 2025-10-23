"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconArrowLeft } from "@tabler/icons-react"

export default function SpopFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nop = searchParams?.get("nop")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {nop ? "Edit SPOP" : "Tambah SPOP"}
              </h1>
              <p className="text-muted-foreground">
                {nop ? `Mengedit data SPOP: ${nop}` : "Menambahkan data SPOP baru"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/objek-pajak/spop")}
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>

          {/* Coming Soon Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form SPOP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">🚧</div>
                <h2 className="text-2xl font-bold">Coming Soon</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Form untuk menambahkan dan mengedit data SPOP sedang dalam pengembangan.
                  Fitur ini akan segera tersedia.
                </p>
                {nop && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono">NOP: {nop}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
