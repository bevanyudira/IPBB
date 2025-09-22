"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpptReportStatsResponse } from "@/services/api/sppt-report"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SpptReportStatsProps {
  data: SpptReportStatsResponse | undefined
  isLoading: boolean
}

export function SpptReportStats({ data, isLoading }: SpptReportStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>No statistics available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const statsCards = [
    // {
    //   title: "Jumlah total kecamatan",
    //   value: formatNumber(data.total_kecamatan),
    //   description: "Seluruh kecamatan dalam sistem",
    //   color: "text-blue-600",
    // },
    // {
    //   title: "Jumlah total kelurahan",
    //   value: formatNumber(data.total_kelurahan),
    //   description: "Seluruh kelurahan dalam sistem",
    //   color: "text-indigo-600",
    // },
    // {
    //   title: "PBB Terhutang",
    //   value: formatCurrency(data.total_pbb_terhutang),
    //   description: "Total PBB yang terhutang",
    //   color: "text-orange-600",
    // },
    {
      title: "Ketetapan",
      value: formatCurrency(data.total_pbb_harus_dibayar),
      description: "Total Ketetapan",
      color: "text-blue-400",
    },
    {
      title: "Terbayar",
      value: formatCurrency(data.total_realisasi),
      description: `${data.persentase_realisasi}% dari total`,
      color: "text-green-600",
    },
    {
      title: "Belum Terbayar",
      value: formatCurrency(data.total_tunggakan),
      description: `${data.persentase_tunggakan}% dari total`,
      color: "text-red-600",
    },
    {
      title: "Lembar Ketetapan",
      value: formatNumber(data.total_lembar_ketetapan) + " lembar",
      description: "Total lembar ketetapan PBB",
      color: "text-blue-400",
    },
    {
      title: "Lembar Terbayar",
      value: formatNumber(data.total_lembar_realisasi) + " lembar",
      description: "Lembar yang sudah terbayar",
      color: "text-green-400",
    },
    {
      title: "Lembar Belum Terbayar",
      value: formatNumber(data.total_lembar_tunggakan) + " lembar",
      description: "Lembar yang belum terbayar",
      color: "text-red-400",
    },
  ]

  // Prepare yearly data for line chart
  const yearlyChartData = data.yearly_data.map(item => ({
    tahun: item.year,
    "PBB Harus Dibayar": item.pbb_harus_dibayar,
    "Terbayar": item.realisasi,
    "Belum Terbayar": item.tunggakan,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">Tahun {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Yearly Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tren PBB per Tahun</CardTitle>
          <CardDescription>Perbandingan PBB Harus Dibayar, Terbayar, dan Belum Terbayar</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis tickFormatter={(value) => {
                if (value >= 1000000000) {
                  return `${(value / 1000000000).toFixed(1)}M`
                } else if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)}Jt`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}Rb`
                }
                return value.toString()
              }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="PBB Harus Dibayar"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Terbayar"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Belum Terbayar"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}