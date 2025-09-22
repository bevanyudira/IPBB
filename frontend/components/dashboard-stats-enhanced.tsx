"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Building2, 
  Calculator,
  Ruler,
  MapPin,
  Map,
  Navigation,
  Building
} from "lucide-react"
import type { DashboardStatsResponse } from "@/services/api/dashboard-enhanced"

interface DashboardStatsEnhancedProps {
  data?: DashboardStatsResponse
  isLoading: boolean
}

export function DashboardStatsEnhanced({ data, isLoading }: DashboardStatsEnhancedProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const spptStats = [
    {
      title: "Total SPPT",
      value: formatNumber(data.total_sppt),
      description: "Jumlah seluruh SPPT",
      icon: FileText,
      trend: null,
    },
    {
      title: "SPPT Lunas",
      value: formatNumber(data.total_sppt_lunas),
      description: `${data.total_sppt > 0 ? ((data.total_sppt_lunas / data.total_sppt) * 100).toFixed(1) : 0}% dari total`,
      icon: CheckCircle2,
      trend: "positive",
    },
    {
      title: "SPPT Belum Lunas",
      value: formatNumber(data.total_sppt_belum_lunas),
      description: `${data.total_sppt > 0 ? ((data.total_sppt_belum_lunas / data.total_sppt) * 100).toFixed(1) : 0}% dari total`,
      icon: XCircle,
      trend: "negative",
    },
    {
      title: "Total PBB Terhutang",
      value: formatCurrency(data.total_pbb_terhutang),
      description: "Jumlah pajak yang harus dibayar",
      icon: DollarSign,
      trend: null,
    },
  ]

  const buildingStats = [
    {
      title: "Total Bangunan",
      value: formatNumber(data.total_bangunan),
      description: "Jumlah objek bangunan aktif",
      icon: Building2,
      trend: null,
    },
    {
      title: "Nilai Total Bangunan",
      value: formatCurrency(data.total_nilai_bangunan),
      description: "Total nilai sistem bangunan",
      icon: Calculator,
      trend: null,
    },
    {
      title: "Rata-rata Luas Bangunan",
      value: `${data.rata_rata_luas_bangunan.toFixed(1)} m²`,
      description: "Luas rata-rata per bangunan",
      icon: Ruler,
      trend: null,
    },
  ]

  const areaStats = [
    {
      title: "Provinsi",
      value: formatNumber(data.total_propinsi),
      description: "Jumlah provinsi",
      icon: Map,
      trend: null,
    },
    {
      title: "Kabupaten/Kota",
      value: formatNumber(data.total_dati2),
      description: "Jumlah dati2",
      icon: Navigation,
      trend: null,
    },
    {
      title: "Kecamatan",
      value: formatNumber(data.total_kecamatan),
      description: "Jumlah kecamatan",
      icon: Building,
      trend: null,
    },
    {
      title: "Kelurahan",
      value: formatNumber(data.total_kelurahan),
      description: "Jumlah kelurahan",
      icon: MapPin,
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filter Information */}
      {(data.filtered_by || data.year_filter) && (
        <div className="flex flex-wrap gap-2">
          {data.year_filter && (
            <Badge variant="outline">
              Tahun: {data.year_filter}
            </Badge>
          )}
          {data.filtered_by && data.filter_value && (
            <Badge variant="outline">
              {data.filtered_by}: {data.filter_value}
            </Badge>
          )}
        </div>
      )}

      {/* SPPT Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Statistik SPPT</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {spptStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${
                    stat.trend === 'positive' ? 'text-green-600' :
                    stat.trend === 'negative' ? 'text-red-600' :
                    'text-muted-foreground'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Building Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Statistik Bangunan</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildingStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Area Coverage Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cakupan Wilayah</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {areaStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}