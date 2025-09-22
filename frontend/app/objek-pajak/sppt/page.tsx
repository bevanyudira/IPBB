"use client"

import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { useSidebarUser } from "../../hooks/use-sidebar-user"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useOpGetAllSpop } from "@/services/api/endpoints/op/op"
import type { SpopResponse } from "@/services/api/models/spopResponse"
import {
  MapPin,
  Building,
  FileText,
  User,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { PbbInformationPanel } from "./components/PbbInformationPanel"

export default function Page() {
  const router = useRouter()
  const sidebarUser = useSidebarUser()

  // Fetch SPOP objects
  const { data: spopData, isLoading: spopLoading, error: spopError } = useOpGetAllSpop({})
  const objects = spopData?.data || []

  // Handle object selection - navigate to year selection page
  const handleSelectObject = (spop: SpopResponse) => {
    const nop = [
      spop.KD_PROPINSI,
      spop.KD_DATI2,
      spop.KD_KECAMATAN,
      spop.KD_KELURAHAN,
      spop.KD_BLOK,
      spop.NO_URUT,
      spop.KD_JNS_OP
    ].join("")

    router.push(`/objek-pajak/sppt/${nop}`)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={sidebarUser} variant="inset" />
      <SidebarInset>
        <SiteHeader title="SPPT - Surat Pemberitahuan Pajak Terhutang" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">

            {/* Object selection */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-xl">Pilih Objek Pajak (NOP)</CardTitle>
                    <CardDescription>
                      Silakan pilih salah satu objek pajak yang terdaftar atas nama Anda
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {spopLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <span className="text-sm text-gray-600">Memuat data objek pajak...</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : spopError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Gagal Memuat Data</AlertTitle>
                    <AlertDescription>
                      Terjadi kesalahan saat memuat data objek pajak. Silakan coba lagi.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {objects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {objects.map((spop: SpopResponse) => {
                          const nopObj = [
                            spop.KD_PROPINSI,
                            spop.KD_DATI2,
                            spop.KD_KECAMATAN,
                            spop.KD_KELURAHAN,
                            spop.KD_BLOK,
                            spop.NO_URUT,
                            spop.KD_JNS_OP
                          ].join("")
                          return (
                            <Card
                              key={nopObj}
                              className="bg-primary/10"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-primary dark:text-primary" />
                                      <span className="font-mono text-sm font-medium text-primary dark:text-primary">
                                        {nopObj}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        {spop.NM_WP || 'Nama tidak tersedia'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-sm">
                                        {spop.JALAN_OP || 'Alamat tidak tersedia'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                      <span className="text-sm font-medium">
                                        {spop.LUAS_BUMI || 0} m²
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-end">
                                      <span className="text-sm">
                                        {(() => {
                                          switch (spop.JNS_BUMI) {
                                            case "1":
                                              return "Tanah + Bangunan";
                                            case "2":
                                              return "Kavling Siap Bangun";
                                            case "3":
                                              return "Tanah Kosong";
                                            case "4":
                                              return "Fasilitas Umum";
                                            default:
                                              return spop.JNS_BUMI || "-";
                                          }
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                      <Button
                                        onClick={() => handleSelectObject(spop)}
                                        className="flex items-center gap-2"
                                        size="sm"
                                      >
                                        Pilih
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Tidak Ada Data</AlertTitle>
                        <AlertDescription>
                          Tidak ada objek pajak ditemukan. Pastikan akun Anda telah terverifikasi
                          dan memiliki objek pajak yang terdaftar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information Panel */}
            <PbbInformationPanel />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}