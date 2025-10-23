"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminGuard } from "@/components/admin-guard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { IconPlus, IconSearch, IconChevronLeft, IconChevronRight, IconEdit, IconMapPin } from "@tabler/icons-react"

// TODO: Generate types dari OpenAPI setelah backend ready
interface SpopListItem {
  NOP: string
  KD_PROPINSI: string
  KD_DATI2: string
  KD_KECAMATAN: string
  KD_KELURAHAN: string
  KD_BLOK: string
  NO_URUT: string
  KD_JNS_OP: string
  NM_WP: string | null
  STATUS_PEMBAYARAN_SPPT: boolean | null
  THN_PAJAK_SPPT: string | null
  JALAN_OP: string | null
  KELURAHAN_OP: string | null
  LUAS_BUMI: number | null
}

interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

interface SpopListResponse {
  data: SpopListItem[]
  meta: PaginationMeta
}

// Mock hook - nanti diganti dengan real API hook
function useGetSpopList(params: { page: number; per_page: number; search?: string }) {
  // TODO: Implement real API call
  return {
    data: null as SpopListResponse | null,
    error: null,
    isLoading: false,
  }
}

export default function AdminSpopPage() {
  return (
    <AdminGuard>
      <AdminSpopPageContent />
    </AdminGuard>
  )
}

function AdminSpopPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const perPage = 10

  const { data, error, isLoading } = useGetSpopList({
    page,
    per_page: perPage,
    search: search || undefined,
  })

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatNOP = (nop: string) => {
    // Format: XX.XX.XXX.XXX.XXX.XXXX.X
    if (nop.length !== 18) return nop
    return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}.${nop.slice(13, 17)}.${nop.slice(17, 18)}`
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">SPOP</h1>
              <p className="text-muted-foreground">
                Surat Pemberitahuan Objek Pajak - Data Objek Pajak
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/spop/form")}
              className="gap-2"
            >
              <IconPlus className="h-4 w-4" />
              Tambah SPOP
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan NOP atau Nama Wajib Pajak..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch}>Cari</Button>
          </div>

          {/* Stats */}
          {data && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total SPOP</CardTitle>
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.meta.total.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">
                    Objek pajak terdaftar
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Error loading data. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : !data || data.data.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {search ? "Tidak ada data yang sesuai dengan pencarian." : "Belum ada data SPOP."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* SPOP Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((spop) => (
                  <Card key={spop.NOP} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {spop.NM_WP || "Nama tidak tersedia"}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs mt-1">
                            {formatNOP(spop.NOP)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            spop.STATUS_PEMBAYARAN_SPPT === true
                              ? "default"
                              : spop.STATUS_PEMBAYARAN_SPPT === false
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {spop.STATUS_PEMBAYARAN_SPPT === true
                            ? "Lunas"
                            : spop.STATUS_PEMBAYARAN_SPPT === false
                            ? "Belum Bayar"
                            : "Belum Ada SPPT"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {spop.JALAN_OP && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Alamat: </span>
                          <span>{spop.JALAN_OP}</span>
                        </div>
                      )}
                      {spop.KELURAHAN_OP && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Kelurahan: </span>
                          <span>{spop.KELURAHAN_OP}</span>
                        </div>
                      )}
                      {spop.LUAS_BUMI && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Luas Bumi: </span>
                          <span>{spop.LUAS_BUMI.toLocaleString("id-ID")} m²</span>
                        </div>
                      )}
                      {spop.THN_PAJAK_SPPT && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Tahun Pajak: </span>
                          <span>{spop.THN_PAJAK_SPPT}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => router.push(`/admin/spop/form?nop=${spop.NOP}`)}
                        >
                          <IconEdit className="h-4 w-4" />
                          Lihat Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.meta.total_pages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {((page - 1) * perPage) + 1} - {Math.min(page * perPage, data.meta.total)} dari {data.meta.total} data
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <IconChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.meta.total_pages) }, (_, i) => {
                        let pageNum: number
                        if (data.meta.total_pages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= data.meta.total_pages - 2) {
                          pageNum = data.meta.total_pages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(data.meta.total_pages, p + 1))}
                      disabled={page === data.meta.total_pages}
                    >
                      Selanjutnya
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
