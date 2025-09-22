"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SpptReportFilters, useGetSpptReportFilters } from "@/services/api/sppt-report"

interface SpptReportFiltersProps {
  filters: SpptReportFilters
  onFiltersChange: (filters: SpptReportFilters) => void
}

export function SpptReportFiltersComponent({ filters, onFiltersChange }: SpptReportFiltersProps) {
  const { data: filtersData, isLoading } = useGetSpptReportFilters()

  // Set default year to max year when data loads
  useEffect(() => {
    if (filtersData?.max_year && !filters.year) {
      onFiltersChange({
        ...filters,
        year: filtersData.max_year,
      })
    }
  }, [filtersData, filters, onFiltersChange])

  const handleYearChange = (year: string) => {
    onFiltersChange({
      ...filters,
      year: year === "all" ? undefined : year,
      page: 1, // Reset to first page when filter changes
    })
  }

  const handleKecamatanChange = (kd_kecamatan: string) => {
    onFiltersChange({
      ...filters,
      kd_kecamatan: kd_kecamatan === "all" ? undefined : kd_kecamatan,
      page: 1, // Reset to first page when filter changes
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-row gap-1 items-end">
        <div className="w-40 space-y-1">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="w-48 space-y-1">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row gap-1 items-end">
      {/* Year Filter */}
      <div className="w-40 space-y-1">
        <Label htmlFor="year-select" className="text-sm font-medium">Tahun Pajak</Label>
        <Select
          value={filters.year || ""}
          onValueChange={handleYearChange}
        >
          <SelectTrigger id="year-select" className="h-8">
            <SelectValue placeholder="Pilih tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {filtersData?.available_years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kecamatan Filter */}
      <div className="w-48 space-y-1">
        <Label htmlFor="kecamatan-select" className="text-sm font-medium">Kecamatan</Label>
        <Select
          value={filters.kd_kecamatan || "all"}
          onValueChange={handleKecamatanChange}
        >
          <SelectTrigger id="kecamatan-select" className="h-8">
            <SelectValue placeholder="Pilih kecamatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kecamatan</SelectItem>
            {filtersData?.kecamatan_list.map((kecamatan) => (
              <SelectItem key={kecamatan.kd_kecamatan} value={kecamatan.kd_kecamatan}>
                {kecamatan.nm_kecamatan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}