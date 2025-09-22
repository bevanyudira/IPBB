import useSWR from 'swr'
import { clientFetcher } from '@/lib/orval/mutator'

// Types for SPPT Report API
export interface SpptReportResponse {
  THN_PAJAK_SPPT: string
  KD_PROPINSI: string
  KD_DATI2: string
  KD_KECAMATAN: string
  KD_KELURAHAN: string
  NM_KECAMATAN?: string
  NM_KELURAHAN?: string
  LEMBAR_PBB: number
  LEMBAR_REALISASI?: number
  LEMBAR_TUNGGAKAN?: number
  LUAS_BUMI_SPPT?: number
  LUAS_BNG_SPPT?: number
  NJOP_BUMI_SPPT?: number
  NJOP_BNG_SPPT?: number
  NJOP_SPPT?: number
  PBB_TERHUTANG_SPPT?: number
  FAKTOR_PENGURANG_SPPT?: number
  PBB_YG_HARUS_DIBAYAR_SPPT?: number
  REALISASI?: number
  TUNGGAKAN?: number
}

export interface YearlyDataResponse {
  year: string
  pbb_harus_dibayar: number
  realisasi: number
  tunggakan: number
}

export interface SpptReportStatsResponse {
  total_kecamatan: number
  total_kelurahan: number
  total_luas_bumi: number
  total_luas_bangunan: number
  total_njop: number
  total_pbb_terhutang: number
  total_pbb_harus_dibayar: number
  total_realisasi: number
  total_tunggakan: number
  total_lembar_ketetapan: number
  total_lembar_realisasi: number
  total_lembar_tunggakan: number
  persentase_realisasi: number
  persentase_tunggakan: number
  yearly_data: YearlyDataResponse[]
  filtered_by_year?: string
  filtered_by_kecamatan?: string
}

export interface SpptReportTableResponse {
  data: SpptReportResponse[]
  total_count: number
  stats: SpptReportStatsResponse
}

export interface SpptReportFiltersResponse {
  available_years: string[]
  kecamatan_list: Array<{
    kd_kecamatan: string
    nm_kecamatan: string
  }>
  max_year?: string
}

export interface SpptReportFilters {
  year?: string
  kd_kecamatan?: string
  page?: number
  limit?: number
}

// API functions
export const getSpptReportFilters = () => {
  return clientFetcher<SpptReportFiltersResponse>({
    url: '/dashboard/sppt-report/filters',
    method: 'GET'
  })
}

export const getSpptReportData = (filters: SpptReportFilters = {}) => {
  const params = new URLSearchParams()

  if (filters.year) params.append('year', filters.year)
  if (filters.kd_kecamatan) params.append('kd_kecamatan', filters.kd_kecamatan)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const url = `/dashboard/sppt-report/data${params.toString() ? `?${params.toString()}` : ''}`
  return clientFetcher<SpptReportTableResponse>({ url, method: 'GET' })
}

// SWR hooks
export const useGetSpptReportFilters = () => {
  return useSWR<SpptReportFiltersResponse>(
    '/dashboard/sppt-report/filters',
    () => getSpptReportFilters(),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}

export const useGetSpptReportData = (filters: SpptReportFilters = {}) => {
  const filtersKey = JSON.stringify(filters)

  return useSWR<SpptReportTableResponse>(
    [`/dashboard/sppt-report/data`, filtersKey],
    () => getSpptReportData(filters),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}