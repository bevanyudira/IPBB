"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpptReportTableResponse, SpptReportFilters } from "@/services/api/sppt-report"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SpptReportChartsProps {
  data: SpptReportTableResponse | undefined
  isLoading: boolean
  filters: SpptReportFilters
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function SpptReportCharts({ data, isLoading, filters }: SpptReportChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafik</CardTitle>
          <CardDescription>Tidak ada data untuk visualisasi</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Prepare data for Terbayar vs Belum Terbayar pie chart
  const realisasiTunggakanData = [
    {
      name: 'Terbayar',
      value: data.stats.total_realisasi,
      percentage: data.stats.persentase_realisasi,
    },
    {
      name: 'Belum Terbayar',
      value: data.stats.total_tunggakan,
      percentage: data.stats.persentase_tunggakan,
    },
  ]

  // Check if a specific kecamatan is selected
  const isKecamatanSelected = filters.kd_kecamatan && filters.kd_kecamatan !== 'all'

  // Prepare data for kecamatan analysis (only when no specific kecamatan is selected)
  const kecamatanNjopData = !isKecamatanSelected ? data.data
    .reduce((acc, item) => {
      const existing = acc.find(x => x.kecamatan === item.NM_KECAMATAN)
      if (existing) {
        existing.njop += item.NJOP_SPPT || 0
        existing.pbb_harus_dibayar += item.PBB_YG_HARUS_DIBAYAR_SPPT || 0
        existing.realisasi += item.REALISASI || 0
      } else {
        acc.push({
          kecamatan: item.NM_KECAMATAN || 'Unknown',
          njop: item.NJOP_SPPT || 0,
          pbb_harus_dibayar: item.PBB_YG_HARUS_DIBAYAR_SPPT || 0,
          realisasi: item.REALISASI || 0,
        })
      }
      return acc
    }, [] as Array<{ kecamatan: string; njop: number; pbb_harus_dibayar: number; realisasi: number }>)
    .sort((a, b) => b.njop - a.njop)
    .slice(0, 10) : []

  // Prepare data for kelurahan analysis (when specific kecamatan is selected)
  const kelurahanData = isKecamatanSelected ? data.data
    .reduce((acc, item) => {
      const existing = acc.find(x => x.kelurahan === item.NM_KELURAHAN)
      if (existing) {
        existing.njop += item.NJOP_SPPT || 0
        existing.pbb_harus_dibayar += item.PBB_YG_HARUS_DIBAYAR_SPPT || 0
        existing.realisasi += item.REALISASI || 0
        existing.luas_bumi += item.LUAS_BUMI_SPPT || 0
        existing.luas_bangunan += item.LUAS_BNG_SPPT || 0
      } else {
        acc.push({
          kelurahan: item.NM_KELURAHAN || 'Unknown',
          njop: item.NJOP_SPPT || 0,
          pbb_harus_dibayar: item.PBB_YG_HARUS_DIBAYAR_SPPT || 0,
          realisasi: item.REALISASI || 0,
          luas_bumi: item.LUAS_BUMI_SPPT || 0,
          luas_bangunan: item.LUAS_BNG_SPPT || 0,
        })
      }
      return acc
    }, [] as Array<{ kelurahan: string; njop: number; pbb_harus_dibayar: number; realisasi: number; luas_bumi: number; luas_bangunan: number }>)
    .sort((a, b) => b.njop - a.njop) : []

  // Prepare data for luas bumi vs luas bangunan (different based on selection)
  const luasData = !isKecamatanSelected ? data.data
    .reduce((acc, item) => {
      const existing = acc.find(x => x.area === item.NM_KECAMATAN)
      if (existing) {
        existing.luas_bumi += item.LUAS_BUMI_SPPT || 0
        existing.luas_bangunan += item.LUAS_BNG_SPPT || 0
      } else {
        acc.push({
          area: item.NM_KECAMATAN || 'Unknown',
          luas_bumi: item.LUAS_BUMI_SPPT || 0,
          luas_bangunan: item.LUAS_BNG_SPPT || 0,
        })
      }
      return acc
    }, [] as Array<{ area: string; luas_bumi: number; luas_bangunan: number }>)
    .sort((a, b) => (b.luas_bumi + b.luas_bangunan) - (a.luas_bumi + a.luas_bangunan))
    .slice(0, 10) : kelurahanData.map(item => ({
      area: item.kelurahan,
      luas_bumi: item.luas_bumi,
      luas_bangunan: item.luas_bangunan,
    })).slice(0, 10)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Luas') ? formatNumber(entry.value) + ' m²' : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.value)}</p>
          <p>{data.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Terbayar vs Belum Terbayar Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status Pembayaran</CardTitle>
          <CardDescription>Perbandingan terbayar vs belum terbayar</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={realisasiTunggakanData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {realisasiTunggakanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF8042'} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conditional Charts based on Kecamatan Selection */}
      {!isKecamatanSelected ? (
        <>
          {/* Top Kecamatan by NJOP */}
          {/* <Card>
            <CardHeader>
              <CardTitle>10 Kecamatan Teratas berdasar NJOP</CardTitle>
              <CardDescription>Wilayah dengan nilai NJOP tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kecamatanNjopData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
                  <YAxis type="category" dataKey="kecamatan" width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="njop" fill="#0088FE" name="NJOP" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* PBB vs Realisasi by Kecamatan */}
          <Card>
            <CardHeader>
              <CardTitle>PBB vs Terbayar per Kecamatan</CardTitle>
              <CardDescription>Perbandingan pajak terhutang vs terkumpul per wilayah</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kecamatanNjopData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kecamatan" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="pbb_harus_dibayar" fill="#FFBB28" name="PBB Harus Dibayar" />
                  <Bar dataKey="realisasi" fill="#00C49F" name="Terbayar" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Land vs Building Area by Kecamatan */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Luas Tanah vs Bangunan per Kecamatan</CardTitle>
              <CardDescription>Perbandingan luas tanah dan bangunan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={luasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatNumber(value) + ' m²'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="luas_bumi" fill="#82CA9D" name="Luas Bumi" />
                  <Bar dataKey="luas_bangunan" fill="#8884D8" name="Luas Bangunan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
        </>
      ) : (
        <>
          {/* Kelurahan Analysis when Kecamatan is selected */}
          {/* <Card>
            <CardHeader>
              <CardTitle>NJOP per Kelurahan</CardTitle>
              <CardDescription>Nilai NJOP masing-masing kelurahan dalam kecamatan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kelurahanData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
                  <YAxis type="category" dataKey="kelurahan" width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="njop" fill="#0088FE" name="NJOP" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* PBB vs Realisasi by Kelurahan */}
          <Card>
            <CardHeader>
              <CardTitle>PBB vs Terbayar per Kelurahan</CardTitle>
              <CardDescription>Perbandingan pajak terhutang vs terkumpul per kelurahan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kelurahanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kelurahan" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="pbb_harus_dibayar" fill="#FFBB28" name="PBB Harus Dibayar" />
                  <Bar dataKey="realisasi" fill="#00C49F" name="Terbayar" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Land vs Building Area by Kelurahan */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Luas Tanah vs Bangunan per Kelurahan</CardTitle>
              <CardDescription>Perbandingan luas tanah dan bangunan per kelurahan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={luasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatNumber(value) + ' m²'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="luas_bumi" fill="#82CA9D" name="Luas Bumi" />
                  <Bar dataKey="luas_bangunan" fill="#8884D8" name="Luas Bangunan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* Additional chart for Kelurahan - Collection Rate */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Tingkat Penagihan per Kelurahan</CardTitle>
              <CardDescription>Persentase realisasi dibanding PBB yang harus dibayar</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kelurahanData.map(item => ({
                  kelurahan: item.kelurahan,
                  tingkat_penagihan: item.pbb_harus_dibayar > 0 ? (item.realisasi / item.pbb_harus_dibayar * 100) : 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kelurahan" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => value.toFixed(1) + '%'} />
                  <Tooltip
                    formatter={(value: any) => [value.toFixed(2) + '%', 'Tingkat Penagihan']}
                    labelFormatter={(label) => `Kelurahan ${label}`}
                  />
                  <Bar dataKey="tingkat_penagihan" fill="#10b981" name="Tingkat Penagihan (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
        </>
      )}
    </div>
  )
}