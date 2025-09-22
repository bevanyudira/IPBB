import useSWR from "swr"
import { clientFetcher } from "@/lib/orval/mutator"

export interface AdminUser {
  id: string
  username: string
  email?: string
  full_name?: string
  is_admin: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface UserUpdateRequest {
  is_admin?: boolean
  is_active?: boolean
}

export interface UserCreateRequest {
  email: string
  full_name?: string
  password: string
  is_admin?: boolean
  is_active?: boolean
}

export interface PaginatedUserResponse {
  data: AdminUser[]
  total_count: number
  page: number
  limit: number
  total_pages: number
}

export interface AdminUserFilters {
  page?: number
  limit?: number
  search?: string
}

export function useGetAllUsers(filters: AdminUserFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.search) params.append('search', filters.search)

  const url = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`
  const filtersKey = JSON.stringify(filters)

  return useSWR<PaginatedUserResponse>(["/admin/users", filtersKey], () =>
    clientFetcher<PaginatedUserResponse>({
      url,
      method: "GET"
    })
  )
}

export async function updateUser(userId: string, data: UserUpdateRequest): Promise<{ message: string }> {
  return clientFetcher<{ message: string }>({
    url: `/admin/users/${userId}`,
    method: "PATCH",
    data
  })
}

export async function deleteUser(userId: string): Promise<{ message: string }> {
  return clientFetcher<{ message: string }>({
    url: `/admin/users/${userId}`,
    method: "DELETE"
  })
}

export async function createUser(data: UserCreateRequest): Promise<AdminUser> {
  return clientFetcher<AdminUser>({
    url: "/admin/users",
    method: "POST",
    data
  })
}