"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import { useGetDashboardFilters, type DashboardFilters } from "@/services/api/dashboard-enhanced"

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters)

  // Fetch filter options with hierarchical loading
  const { data: filterOptions, isLoading } = useGetDashboardFilters({
    kd_propinsi: localFilters.kd_propinsi,
    kd_dati2: localFilters.kd_dati2,
    kd_kecamatan: localFilters.kd_kecamatan,
  })

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof DashboardFilters, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value }

    // Clear dependent filters when parent filter changes
    if (key === 'kd_propinsi') {
      newFilters.kd_dati2 = undefined
      newFilters.kd_kecamatan = undefined
      newFilters.kd_kelurahan = undefined
    } else if (key === 'kd_dati2') {
      newFilters.kd_kecamatan = undefined
      newFilters.kd_kelurahan = undefined
    } else if (key === 'kd_kecamatan') {
      newFilters.kd_kelurahan = undefined
    }

    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined && value !== '')
  const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(filters)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading filter options...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* All Filters in One Line */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year Filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium whitespace-nowrap">Tahun:</label>
            <Input
              type="number"
              placeholder="Tahun"
              className="h-8 w-24"
              value={localFilters.year || ""}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('year', value === "" ? undefined : value);
              }}
            />
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium whitespace-nowrap">Provinsi:</label>
            <Select
              value={localFilters.kd_propinsi || "all"}
              onValueChange={(value) => handleFilterChange('kd_propinsi', value === "all" ? undefined : value)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filterOptions?.propinsi.map((item) => (
                  <SelectItem key={item.KD_PROPINSI} value={item.KD_PROPINSI}>
                    {item.NM_PROPINSI}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kota/Kabupaten Filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium whitespace-nowrap">Kota/Kab:</label>
            <Select
              value={localFilters.kd_dati2 || "all"}
              onValueChange={(value) => handleFilterChange('kd_dati2', value === "all" ? undefined : value)}
              disabled={!localFilters.kd_propinsi}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Kota/Kab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filterOptions?.dati2.map((item) => (
                  <SelectItem key={`${item.KD_PROPINSI}-${item.KD_DATI2}`} value={item.KD_DATI2}>
                    {item.NM_DATI2}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kecamatan Filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium whitespace-nowrap">Kecamatan:</label>
            <Select
              value={localFilters.kd_kecamatan || "all"}
              onValueChange={(value) => handleFilterChange('kd_kecamatan', value === "all" ? undefined : value)}
              disabled={!localFilters.kd_dati2}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filterOptions?.kecamatan.map((item) => (
                  <SelectItem key={`${item.KD_PROPINSI}-${item.KD_DATI2}-${item.KD_KECAMATAN}`} value={item.KD_KECAMATAN}>
                    {item.NM_KECAMATAN}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kelurahan Filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium whitespace-nowrap">Kelurahan:</label>
            <Select
              value={localFilters.kd_kelurahan || "all"}
              onValueChange={(value) => handleFilterChange('kd_kelurahan', value === "all" ? undefined : value)}
              disabled={!localFilters.kd_kecamatan}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Kelurahan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filterOptions?.kelurahan.map((item) => (
                  <SelectItem
                    key={`${item.KD_PROPINSI}-${item.KD_DATI2}-${item.KD_KECAMATAN}-${item.KD_KELURAHAN}`}
                    value={item.KD_KELURAHAN}
                  >
                    {item.NM_KELURAHAN}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button onClick={applyFilters} disabled={!hasChanges} size="sm">
              <Filter className="h-3 w-3 mr-1" />
              Terapkan
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some(value => value !== undefined && value !== '') && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-sm font-medium">Filter Aktif:</div>
            <div className="flex flex-wrap gap-1">
              {filters.year && (
                <Badge variant="secondary" className="text-xs h-6">
                  Tahun: {filters.year}
                  <button
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    onClick={() => onFiltersChange({ ...filters, year: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.kd_propinsi && (
                <Badge variant="secondary" className="text-xs h-6">
                  Provinsi: {filterOptions?.propinsi.find(p => p.KD_PROPINSI === filters.kd_propinsi)?.NM_PROPINSI || filters.kd_propinsi}
                  <button
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    onClick={() => onFiltersChange({ ...filters, kd_propinsi: undefined, kd_dati2: undefined, kd_kecamatan: undefined, kd_kelurahan: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.kd_dati2 && (
                <Badge variant="secondary" className="text-xs h-6">
                  Kabupaten: {filterOptions?.dati2.find(d => d.KD_DATI2 === filters.kd_dati2)?.NM_DATI2 || filters.kd_dati2}
                  <button
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    onClick={() => onFiltersChange({ ...filters, kd_dati2: undefined, kd_kecamatan: undefined, kd_kelurahan: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.kd_kecamatan && (
                <Badge variant="secondary" className="text-xs h-6">
                  Kecamatan: {filterOptions?.kecamatan.find(k => k.KD_KECAMATAN === filters.kd_kecamatan)?.NM_KECAMATAN || filters.kd_kecamatan}
                  <button
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    onClick={() => onFiltersChange({ ...filters, kd_kecamatan: undefined, kd_kelurahan: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.kd_kelurahan && (
                <Badge variant="secondary" className="text-xs h-6">
                  Kelurahan: {filterOptions?.kelurahan.find(k => k.KD_KELURAHAN === filters.kd_kelurahan)?.NM_KELURAHAN || filters.kd_kelurahan}
                  <button
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    onClick={() => onFiltersChange({ ...filters, kd_kelurahan: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}