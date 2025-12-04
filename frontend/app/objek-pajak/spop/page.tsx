/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { IconPlus, IconSearch, IconMapPin, IconRefresh } from "@tabler/icons-react"
import type { UserRead } from "@/services/api/models/userRead"
import type { SpopListResponse, SpopListItem } from "@/types/spop-api"

// Custom hooks/components yang bisa di-extract nanti
import { useDebounce } from "@/hooks/use-debounce"
import { Pagination } from "@/app/objek-pajak/spop/components/pagination"
import { SpopCard } from "@/app/objek-pajak/spop/components/spop-card"

export default function SpopPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [data, setData] = useState<SpopListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarUser, setSidebarUser] = useState<UserRead | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | null>(null)

  const perPage = 20
  const debouncedSearch = useDebounce(searchInput, 300)

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

  // Effect untuk debounced search
  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1)
  }, [debouncedSearch])

  // Fetch data menggunakan API
  const fetchData = useCallback(async (pageNum: number, searchTerm: string) => {
    // Cancel previous request jika masih pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        page_size: perPage.toString(),
      })
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/list?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: abortController.signal,
        }
      )
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      const result: SpopListResponse = await response.json()
      setData(result)
    } catch (err: any) {
      // AbortError tidak perlu ditampilkan sebagai error
      if (err.name !== 'AbortError') {
        setError(err.message || "Gagal memuat data SPOP")
        toast({
          title: "Error",
          description: err.message || "Gagal memuat data SPOP",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router, toast])

  // Effect untuk fetch data
  useEffect(() => {
    fetchData(page, search)
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [page, search, fetchData])

  // Handlers
  const handleSearch = useCallback(() => {
    setSearch(searchInput)
    setPage(1)
  }, [searchInput])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }, [handleSearch])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchData(page, search)
  }, [fetchData, page, search])

  const handleAddNew = useCallback(() => {
    router.push("/objek-pajak/spop/form")
  }, [router])

  const handleViewDetail = useCallback((nop: string) => {
    router.push(`/objek-pajak/spop/form?nop=${nop}`)
  }, [router])

  // Format NOP helper
  const formatNOP = (spop: SpopListItem): string => {
    if (!spop.KD_PROPINSI || !spop.KD_DATI2 || !spop.KD_KECAMATAN || 
        !spop.KD_KELURAHAN || !spop.KD_BLOK || !spop.NO_URUT || !spop.KD_JNS_OP) {
      return "-"
    }
    
    const nop = `${spop.KD_PROPINSI}${spop.KD_DATI2}${spop.KD_KECAMATAN}${spop.KD_KELURAHAN}${spop.KD_BLOK}${spop.NO_URUT}${spop.KD_JNS_OP}`
    
    if (nop.length !== 18) return nop
    
    return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(4, 7)}.${nop.slice(7, 10)}.${nop.slice(10, 13)}.${nop.slice(13, 17)}.${nop.slice(17, 18)}`
  }

  const getNOP = (spop: SpopListItem): string => {
    return `${spop.KD_PROPINSI || ''}${spop.KD_DATI2 || ''}${spop.KD_KECAMATAN || ''}${spop.KD_KELURAHAN || ''}${spop.KD_BLOK || ''}${spop.NO_URUT || ''}${spop.KD_JNS_OP || ''}`
  }

  const getTransactionType = (typeCode: string): string => {
    const types: Record<string, string> = {
      "1": "Baru",
      "2": "Pemecahan",
      "3": "Penggabungan",
      "4": "Mutasi",
      "5": "Perubahan"
    }
    return types[typeCode] || "Tidak Diketahui"
  }

  // Loading skeletons
  const renderSkeletons = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(perPage)].map((_, i) => (
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
  )

  // Empty state
  const renderEmptyState = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground mb-4">
          {search ? "Tidak ada data yang sesuai dengan pencarian." : "Belum ada data SPOP."}
        </p>
        {search && (
          <Button variant="outline" onClick={() => setSearch("")}>
            Reset Pencarian
          </Button>
        )}
      </CardContent>
    </Card>
  )

  // Error state
  const renderErrorState = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <SidebarProvider
    style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebar user={sidebarUser} variant="inset" />
      <SidebarInset>
        <SiteHeader title="SPOP - Surat Pemberitahuan Objek Pajak"/>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan NOP atau Nama Wajib Pajak..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                aria-label="Cari data SPOP"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              Cari
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleAddNew}
                className="gap-2"
                aria-label="Tambah SPOP baru"
              >
                <IconPlus className="h-4 w-4" />
                Tambah SPOP
              </Button>
            </div>
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
                  <div className="text-2xl font-bold">{data.total.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">
                    Objek pajak terdaftar
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content */}
          {isLoading && !data ? (
            renderSkeletons()
          ) : error ? (
            renderErrorState()
          ) : !data || !data.data || data.data.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* SPOP Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((spop) => {
                  const nop = getNOP(spop)
                  return (
                    <SpopCard
                      key={nop}
                      spop={spop}
                      nop={nop}
                      formattedNOP={formatNOP(spop)}
                      transactionType={getTransactionType(spop.JNS_TRANSAKSI_OP)}
                      onViewDetail={() => handleViewDetail(nop)}
                    />
                  )
                })}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={data.total_pages}
                  totalItems={data.total}
                  perPage={perPage}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}