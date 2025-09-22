"use client"

import { useState } from "react"
import { useAuthAdminWithRedirect } from "../hooks/use-auth-admin"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { SpptReportFiltersComponent } from "@/components/sppt-report-filters"
import { SpptReportStats } from "@/components/sppt-report-stats"
import { SpptReportTable } from "@/components/sppt-report-table"
import { SpptReportCharts } from "@/components/sppt-report-charts"
import { useGetSpptReportData, type SpptReportFilters } from "@/services/api/sppt-report"

export default function Page() {
  const { user, isAdmin, isLoading: authLoading } = useAuthAdminWithRedirect()
  const [filters, setFilters] = useState<SpptReportFilters>({})
  const { data: reportData, isLoading: dataLoading } = useGetSpptReportData(filters)

  // Show loading state while checking authentication
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // If user is not admin, the hook will redirect them, but show loading in the meantime
  if (!isAdmin) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>
  }

  const handleFiltersChange = (newFilters: SpptReportFilters) => {
    setFilters(newFilters)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard Admin - Laporan SPPT" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Filters Section */}
            <div>
              <SpptReportFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* Stats Section */}
            <div>
              <SpptReportStats
                data={reportData?.stats}
                isLoading={dataLoading}
              />
            </div>

            {/* Charts Section */}
            <div>
              <SpptReportCharts
                data={reportData}
                isLoading={dataLoading}
                filters={filters}
              />
            </div>

            {/* Table Section */}
            <div>
              <SpptReportTable
                data={reportData}
                isLoading={dataLoading}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
