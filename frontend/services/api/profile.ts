import useSWR from 'swr'
import { clientFetcher } from '@/lib/orval/mutator'

export interface DatSubjekPajakData {
  SUBJEK_PAJAK_ID: string
  NM_WP?: string | null
  JALAN_WP?: string | null
  BLOK_KAV_NO_WP?: string | null
  RW_WP?: string | null
  RT_WP?: string | null
  KELURAHAN_WP?: string | null
  KOTA_WP?: string | null
  KD_POS_WP?: string | null
  TELP_WP?: string | null
  NPWP?: string | null
  STATUS_PEKERJAAN_WP?: string | null
  EMAIL_WP?: string | null
}

export interface ProfileUser {
  id: string
  email: string
  nama?: string | null
  telepon?: string | null
  alamat?: string | null
  is_active: boolean
  is_verified: boolean
  is_admin: boolean
}

export interface DatSubjekPajakResponse {
  user: ProfileUser
  taxpayer: DatSubjekPajakData | null
}

export const useGetMyProfile = () => {
  return useSWR<DatSubjekPajakResponse>(
    '/profile/me',
    (url: string) => clientFetcher({ url, method: 'GET' }),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}

export const getMyProfile = () => {
  return clientFetcher<DatSubjekPajakResponse>({
    url: '/profile/me',
    method: 'GET',
  })
}
