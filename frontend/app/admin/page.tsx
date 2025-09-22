"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminGuard } from "@/components/admin-guard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useGetAllUsers, updateUser, deleteUser, createUser, type AdminUser, type UserCreateRequest, type PaginatedUserResponse, type AdminUserFilters } from "@/services/api/admin"
import { useAuthMe } from "@/services/api/endpoints/auth/auth"
import { IconTrash, IconUserCheck, IconUsers, IconPlus, IconSearch, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { mutate } from "swr"

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPageContent />
    </AdminGuard>
  )
}

function AdminPageContent() {
  const { data: currentUser } = useAuthMe()
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 10,
    search: ""
  })
  const { data: usersResponse, error, isLoading } = useGetAllUsers(filters)
  const { toast } = useToast()
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [newUser, setNewUser] = useState<UserCreateRequest>({
    email: "",
    full_name: "",
    password: "",
    is_admin: false,
    is_active: true,
  })

  const handleToggleAdmin = async (user: AdminUser) => {
    if (updatingUsers.has(user.id)) return

    try {
      setUpdatingUsers(prev => new Set([...prev, user.id]))
      await updateUser(user.id, { is_admin: !user.is_admin })
      await mutate(["/admin/users", JSON.stringify(filters)])
      toast({
        title: "Success",
        description: `User ${user.username} admin status updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(user.id)
        return newSet
      })
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchInput,
      page: 1 // Reset to first page when searching
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      await deleteUser(user.id)
      await mutate(["/admin/users", JSON.stringify(filters)])
      toast({
        title: "Success",
        description: `User ${user.username} deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      await createUser(newUser)
      await mutate(["/admin/users", JSON.stringify(filters)])
      setIsCreateDialogOpen(false)
      setNewUser({
        email: "",
        full_name: "",
        password: "",
        is_admin: false,
        is_active: true,
      })
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" user={currentUser} />
        <SidebarInset>
          <SiteHeader title="Admin - User Management" />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  {error.message || "Failed to load users"}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
      <AppSidebar variant="inset" user={currentUser} />
      <SidebarInset>
        <SiteHeader title="Admin - User Management" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconUsers className="h-5 w-5" />
                    Manajemen Pengguna
                  </CardTitle>
                  <CardDescription>
                    Kelola status admin untuk semua pengguna sistem
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      placeholder="Cari pengguna..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch()
                        }
                      }}
                      className="pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSearch}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      <IconSearch className="h-4 w-4" />
                    </Button>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <IconPlus className="h-4 w-4 mr-2" />
                      Tambah Pengguna
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                      <DialogDescription>
                        Buat akun pengguna baru untuk sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="Masukkan email"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fullName">Nama Lengkap</Label>
                        <Input
                          id="fullName"
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Masukkan password"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_admin"
                            checked={newUser.is_admin}
                            onCheckedChange={(checked) => setNewUser({ ...newUser, is_admin: checked })}
                          />
                          <Label htmlFor="is_admin">Admin</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isCreating}>
                        {isCreating ? "Membuat..." : "Buat Pengguna"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersResponse?.data?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.full_name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.is_admin && (
                              <Badge variant="default" className="text-xs">
                                <IconUserCheck className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            <Badge
                              variant={user.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {user.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={user.is_admin}
                            onCheckedChange={() => handleToggleAdmin(user)}
                            disabled={updatingUsers.has(user.id)}
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus pengguna <strong>{user.username}</strong>?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {usersResponse && usersResponse.total_pages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((usersResponse.page - 1) * usersResponse.limit) + 1} to {Math.min(usersResponse.page * usersResponse.limit, usersResponse.total_count)} of {usersResponse.total_count} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(usersResponse.page - 1)}
                      disabled={usersResponse.page <= 1}
                    >
                      <IconChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, usersResponse.total_pages) }, (_, i) => {
                        const pageNum = usersResponse.page <= 3
                          ? i + 1
                          : usersResponse.page + i - 2

                        if (pageNum > usersResponse.total_pages) return null

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === usersResponse.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(usersResponse.page + 1)}
                      disabled={usersResponse.page >= usersResponse.total_pages}
                    >
                      Next
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}