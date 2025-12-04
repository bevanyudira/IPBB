// components/nav-main.tsx - VERSI SIMPLE & CLEAN
"use client"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import type { Icon } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Cek apakah halaman aktif
            const isActive = pathname === item.url || 
                            pathname.startsWith(item.url + "/")
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  onClick={() => router.push(item.url)}
                  isActive={isActive}
                  className={cn(
                    // Base styling untuk semua button
                    "transition-all duration-200",
                    
                    // Styling untuk state normal
                    "hover:bg-gray-300 hover:text-gray-900",
                    "dark:hover:bg-gray-800 dark:hover:text-gray-100",
                    
                    // Styling untuk state aktif - menggunakan !important untuk override data-[active=true]
                    isActive && "!bg-blue-500 !text-white !font-semibold",
                    isActive && "hover:!bg-blue-600 hover:!text-white",
                  )}
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}