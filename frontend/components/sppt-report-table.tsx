"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { SpptReportTableResponse, SpptReportFilters } from "@/services/api/sppt-report"
import { formatNumber, formatCurrency } from "@/lib/utils"

interface SpptReportTableProps {
  data: SpptReportTableResponse | undefined
  isLoading: boolean
  filters: SpptReportFilters
  onFiltersChange: (filters: SpptReportFilters) => void
}

export function SpptReportTable({ data, isLoading, filters, onFiltersChange }: SpptReportTableProps) {
  const [pageSize, setPageSize] = useState(filters.limit || 50)

  const currentPage = filters.page || 1
  const totalPages = data ? Math.ceil(data.total_count / pageSize) : 0

  const handlePageChange = (page: number) => {
    onFiltersChange({
      ...filters,
      page,
    })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize)
    setPageSize(size)
    onFiltersChange({
      ...filters,
      limit: size,
      page: 1, // Reset to first page
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Laporan SPPT</CardTitle>
          <CardDescription>Memuat data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Laporan SPPT</CardTitle>
          <CardDescription>Tidak ada data tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Tidak ada data laporan SPPT untuk filter yang dipilih.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Laporan SPPT</CardTitle>
        <CardDescription>
          Menampilkan {((currentPage - 1) * pageSize) + 1} sampai {Math.min(currentPage * pageSize, data.total_count)} dari {data.total_count} data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Kelurahan</TableHead>
                  <TableHead className="text-right">Luas Bumi (m²)</TableHead>
                  <TableHead className="text-right">Luas Bangunan (m²)</TableHead>
                  <TableHead className="text-right">NJOP</TableHead>
                  <TableHead className="text-right">PBB Terhutang</TableHead>
                  <TableHead className="text-right">Ketetapan</TableHead>
                  <TableHead className="text-right">Terbayar</TableHead>
                  <TableHead className="text-right">Belum Terbayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((item, index) => (
                  <TableRow key={`${item.KD_PROPINSI}-${item.KD_DATI2}-${item.KD_KECAMATAN}-${item.KD_KELURAHAN}-${index}`}>
                    <TableCell className="font-medium">{item.THN_PAJAK_SPPT}</TableCell>
                    <TableCell>{item.NM_KECAMATAN}</TableCell>
                    <TableCell>{item.NM_KELURAHAN}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.LUAS_BUMI_SPPT || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.LUAS_BNG_SPPT || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.NJOP_SPPT || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.PBB_TERHUTANG_SPPT || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.PBB_YG_HARUS_DIBAYAR_SPPT || 0)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(item.REALISASI || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(item.TUNGGAKAN || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Baris per halaman</p>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}