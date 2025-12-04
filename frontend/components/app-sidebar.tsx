/* eslint-disable @typescript-eslint/no-explicit-any */
// components/app-sidebar.tsx - VERSI SIMPLE
"use client"

import {
  IconDashboard,
  IconFileDescription,
  IconChartBar,
  IconMap,
  IconListDetails,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar({ user, ...props }: any) {
  const menuItems = [
    ...(user?.is_admin ? [{
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    }] : []),
    {
      title: "Profil",
      url: "/profile", 
      icon: IconListDetails,
    },
    {
      title: "SPPT",
      url: "/objek-pajak/sppt",
      icon: IconChartBar,
    },
    ...(user?.is_admin ? [{
      title: "Peta",
      url: "/peta",
      icon: IconMap,
    }] : []),
    ...(user?.is_admin ? [{
      title: "SPOP", 
      url: "/objek-pajak/spop",
      icon: IconFileDescription,
    }] : []),
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3 p-2">
          <IconInnerShadowTop className="size-6" />
          <span className="text-lg font-bold">SIMPBB</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <NavMain items={menuItems} />
      </SidebarContent>
    </Sidebar>
  )
}