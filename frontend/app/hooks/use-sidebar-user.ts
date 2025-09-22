import { useAuthMe } from "@/services/api/endpoints/auth/auth"

export const useSidebarUser = () => {
  const { data: user } = useAuthMe()
  return user
}