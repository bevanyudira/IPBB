import useSWR from 'swr'
import { clientFetcher } from '@/lib/orval/mutator'

// Types for the enhanced dashboard API
export interface DashboardStatsResponse {
  total_sppt: number
  total_sppt_lunas: number
  total_sppt_belum_lunas: number
  total_pbb_terhutang: number
  total_bangunan: number
  total_nilai_bangunan: number
  rata_rata_luas_bangunan: number
  total_propinsi: number
  total_dati2: number
  total_kecamatan: number
  total_kelurahan: number
  filtered_by?: string
  filter_value?: string
  year_filter?: string
}

export interface PropinsiResponse {
  KD_PROPINSI: string
  NM_PROPINSI: string
}

export interface Dati2Response {
  KD_PROPINSI: string
  KD_DATI2: string
  NM_DATI2: string
}

export interface KecamatanResponse {
  KD_PROPINSI: string
  KD_DATI2: string
  KD_KECAMATAN: string
  NM_KECAMATAN: string
}

export interface KelurahanResponse {
  KD_PROPINSI: string
  KD_DATI2: string
  KD_KECAMATAN: string
  KD_KELURAHAN: string
  KD_SEKTOR: string
  NM_KELURAHAN: string
  NO_KELURAHAN?: number
  KD_POS_KELURAHAN?: string
}

export interface DashboardFiltersResponse {
  propinsi: PropinsiResponse[]
  dati2: Dati2Response[]
  kecamatan: KecamatanResponse[]
  kelurahan: KelurahanResponse[]
  available_years: string[]
}

export interface DashboardFilters {
  year?: string
  kd_propinsi?: string
  kd_dati2?: string
  kd_kecamatan?: string
  kd_kelurahan?: string
}

// API functions
export const getDashboardStats = (filters: DashboardFilters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value)
    }
  })
  
  const url = `/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`
  return clientFetcher<DashboardStatsResponse>({ url, method: 'GET' })
}

export const getDashboardFilters = (hierarchicalFilters: Partial<DashboardFilters> = {}) => {
  const params = new URLSearchParams()
  if (hierarchicalFilters.kd_propinsi) params.append('kd_propinsi', hierarchicalFilters.kd_propinsi)
  if (hierarchicalFilters.kd_dati2) params.append('kd_dati2', hierarchicalFilters.kd_dati2)
  if (hierarchicalFilters.kd_kecamatan) params.append('kd_kecamatan', hierarchicalFilters.kd_kecamatan)
  
  const url = `/dashboard/filters${params.toString() ? `?${params.toString()}` : ''}`
  return clientFetcher<DashboardFiltersResponse>({ url, method: 'GET' })
}

// SWR hooks
export const useGetDashboardStats = (filters: DashboardFilters = {}) => {
  const filtersKey = JSON.stringify(filters)
  
  return useSWR<DashboardStatsResponse>(
    [`/dashboard/stats`, filtersKey],
    () => getDashboardStats(filters),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}

export const useGetDashboardFilters = (hierarchicalFilters: Partial<DashboardFilters> = {}) => {
  const filtersKey = JSON.stringify(hierarchicalFilters)
  
  return useSWR<DashboardFiltersResponse>(
    [`/dashboard/filters`, filtersKey],
    () => getDashboardFilters(hierarchicalFilters),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}