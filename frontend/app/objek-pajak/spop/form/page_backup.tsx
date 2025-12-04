"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconArrowLeft, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react"
import { useOpGetSpopDetail, useOpCreateSpop, useOpUpdateSpop } from "@/services/api/endpoints/op/op"
import { useToast } from "@/hooks/use-toast"

export default function SpopFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nop = searchParams?.get("nop")
  const { toast } = useToast()

  // Fetch existing data if editing
  const { data: spopData, isLoading: isLoadingData } = useOpGetSpopDetail(
    nop || "",
    { swr: { enabled: !!nop } }
  )

  // Mutations
  const createMutation = useOpCreateSpop()
  const updateMutation = useOpUpdateSpop(nop || "")

  // Form state
  const [formData, setFormData] = useState<SpopSubmitData>({
    // Identifikasi
    KD_PROPINSI: "",
    KD_DATI2: "",
    KD_KECAMATAN: "",
    KD_KELURAHAN: "",
    KD_BLOK: "",
    NO_URUT: "",
    KD_JNS_OP: "",
    
    // Data Wajib Pajak
    NM_WP: "",
    JALAN_WP: "",
    BLOK_KAV_NO_WP: "",
    RW_WP: "",
    RT_WP: "",
    KELURAHAN_WP: "",
    KOTA_WP: "",
    KD_POS_WP: "",
    NPWP: "",
    
    // Data Objek Pajak
    JALAN_OP: "",
    BLOK_KAV_NO_OP: "",
    RW_OP: "",
    RT_OP: "",
    KELURAHAN_OP: "",
    
    // Luas Tanah
    LUAS_BUMI: "",
  })

  // Load data when editing
  useEffect(() => {
    if (spopData && !isLoadingData) {
      setFormData({
        KD_PROPINSI: spopData.KD_PROPINSI || "",
        KD_DATI2: spopData.KD_DATI2 || "",
        KD_KECAMATAN: spopData.KD_KECAMATAN || "",
        KD_KELURAHAN: spopData.KD_KELURAHAN || "",
        KD_BLOK: spopData.KD_BLOK || "",
        NO_URUT: spopData.NO_URUT || "",
        KD_JNS_OP: spopData.KD_JNS_OP || "",
        NM_WP: spopData.NM_WP || "",
        JALAN_WP: spopData.JALAN_WP || "",
        BLOK_KAV_NO_WP: spopData.BLOK_KAV_NO_WP || "",
        RW_WP: spopData.RW_WP || "",
        RT_WP: spopData.RT_WP || "",
        KELURAHAN_WP: spopData.KELURAHAN_WP || "",
        KOTA_WP: spopData.KOTA_WP || "",
        KD_POS_WP: spopData.KD_POS_WP || "",
        NPWP: spopData.NPWP || "",
        JALAN_OP: spopData.JALAN_OP || "",
        BLOK_KAV_NO_OP: spopData.BLOK_KAV_NO_OP || "",
        RW_OP: spopData.RW_OP || "",
        RT_OP: spopData.RT_OP || "",
        KELURAHAN_OP: spopData.KELURAHAN_OP || "",
        LUAS_BUMI: spopData.LUAS_BUMI?.toString() || "",
      })
    }
  }, [spopData, isLoadingData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (nop) {
        await updateMutation.trigger(formData)
        toast({
          title: "Berhasil",
          description: "Data SPOP berhasil diupdate",
        })
      } else {
        await createMutation.trigger(formData)
        toast({
          title: "Berhasil",
          description: "Data SPOP berhasil ditambahkan",
        })
      }
      router.push("/objek-pajak/spop")
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || "Terjadi kesalahan";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const isLoading = createMutation.isMutating || updateMutation.isMutating

  if (nop && isLoadingData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <IconLoader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="SPOP - Surat Pemberitahuan Objek"/>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {nop ? "Edit SPOP" : "Tambah SPOP"}
              </h1>
              <p className="text-muted-foreground">
                {nop ? `Mengedit data SPOP: ${nop}` : "Menambahkan data SPOP baru"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/objek-pajak/spop")}
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifikasi NOP */}
            <Card>
              <CardHeader>
                <CardTitle>Identifikasi NOP</CardTitle>
                <CardDescription>Kode identifikasi objek pajak (18 digit)</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-7">
                <div className="space-y-2">
                  <Label htmlFor="KD_PROPINSI">Provinsi</Label>
                  <Input
                    id="KD_PROPINSI"
                    value={formData.KD_PROPINSI}
                    onChange={(e) => setFormData({ ...formData, KD_PROPINSI: e.target.value })}
                    maxLength={2}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_DATI2">Kab/Kota</Label>
                  <Input
                    id="KD_DATI2"
                    value={formData.KD_DATI2}
                    onChange={(e) => setFormData({ ...formData, KD_DATI2: e.target.value })}
                    maxLength={2}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_KECAMATAN">Kecamatan</Label>
                  <Input
                    id="KD_KECAMATAN"
                    value={formData.KD_KECAMATAN}
                    onChange={(e) => setFormData({ ...formData, KD_KECAMATAN: e.target.value })}
                    maxLength={3}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_KELURAHAN">Kelurahan</Label>
                  <Input
                    id="KD_KELURAHAN"
                    value={formData.KD_KELURAHAN}
                    onChange={(e) => setFormData({ ...formData, KD_KELURAHAN: e.target.value })}
                    maxLength={3}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_BLOK">Blok</Label>
                  <Input
                    id="KD_BLOK"
                    value={formData.KD_BLOK}
                    onChange={(e) => setFormData({ ...formData, KD_BLOK: e.target.value })}
                    maxLength={3}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="NO_URUT">No Urut</Label>
                  <Input
                    id="NO_URUT"
                    value={formData.NO_URUT}
                    onChange={(e) => setFormData({ ...formData, NO_URUT: e.target.value })}
                    maxLength={4}
                    required
                    disabled={!!nop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_JNS_OP">Jenis OP</Label>
                  <Input
                    id="KD_JNS_OP"
                    value={formData.KD_JNS_OP}
                    onChange={(e) => setFormData({ ...formData, KD_JNS_OP: e.target.value })}
                    maxLength={1}
                    required
                    disabled={!!nop}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Wajib Pajak */}
            <Card>
              <CardHeader>
                <CardTitle>Data Wajib Pajak</CardTitle>
                <CardDescription>Informasi identitas dan alamat wajib pajak</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="NM_WP">Nama Wajib Pajak *</Label>
                  <Input
                    id="NM_WP"
                    value={formData.NM_WP}
                    onChange={(e) => setFormData({ ...formData, NM_WP: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="JALAN_WP">Alamat Jalan</Label>
                  <Textarea
                    id="JALAN_WP"
                    value={formData.JALAN_WP}
                    onChange={(e) => setFormData({ ...formData, JALAN_WP: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="BLOK_KAV_NO_WP">Blok/Kav/No</Label>
                  <Input
                    id="BLOK_KAV_NO_WP"
                    value={formData.BLOK_KAV_NO_WP}
                    onChange={(e) => setFormData({ ...formData, BLOK_KAV_NO_WP: e.target.value })}
                  />
                </div>
                <div className="space-y-2 grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="RT_WP">RT</Label>
                    <Input
                      id="RT_WP"
                      value={formData.RT_WP}
                      onChange={(e) => setFormData({ ...formData, RT_WP: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="RW_WP">RW</Label>
                    <Input
                      id="RW_WP"
                      value={formData.RW_WP}
                      onChange={(e) => setFormData({ ...formData, RW_WP: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KELURAHAN_WP">Kelurahan</Label>
                  <Input
                    id="KELURAHAN_WP"
                    value={formData.KELURAHAN_WP}
                    onChange={(e) => setFormData({ ...formData, KELURAHAN_WP: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KOTA_WP">Kota</Label>
                  <Input
                    id="KOTA_WP"
                    value={formData.KOTA_WP}
                    onChange={(e) => setFormData({ ...formData, KOTA_WP: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KD_POS_WP">Kode Pos</Label>
                  <Input
                    id="KD_POS_WP"
                    value={formData.KD_POS_WP}
                    onChange={(e) => setFormData({ ...formData, KD_POS_WP: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="NPWP">NPWP</Label>
                  <Input
                    id="NPWP"
                    value={formData.NPWP}
                    onChange={(e) => setFormData({ ...formData, NPWP: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Objek Pajak */}
            <Card>
              <CardHeader>
                <CardTitle>Data Objek Pajak</CardTitle>
                <CardDescription>Lokasi dan alamat objek pajak</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="JALAN_OP">Alamat Objek Pajak</Label>
                  <Textarea
                    id="JALAN_OP"
                    value={formData.JALAN_OP}
                    onChange={(e) => setFormData({ ...formData, JALAN_OP: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="BLOK_KAV_NO_OP">Blok/Kav/No</Label>
                  <Input
                    id="BLOK_KAV_NO_OP"
                    value={formData.BLOK_KAV_NO_OP}
                    onChange={(e) => setFormData({ ...formData, BLOK_KAV_NO_OP: e.target.value })}
                  />
                </div>
                <div className="space-y-2 grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="RT_OP">RT</Label>
                    <Input
                      id="RT_OP"
                      value={formData.RT_OP}
                      onChange={(e) => setFormData({ ...formData, RT_OP: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="RW_OP">RW</Label>
                    <Input
                      id="RW_OP"
                      value={formData.RW_OP}
                      onChange={(e) => setFormData({ ...formData, RW_OP: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="KELURAHAN_OP">Kelurahan</Label>
                  <Input
                    id="KELURAHAN_OP"
                    value={formData.KELURAHAN_OP}
                    onChange={(e) => setFormData({ ...formData, KELURAHAN_OP: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Luas Tanah */}
            <Card>
              <CardHeader>
                <CardTitle>Luas Tanah</CardTitle>
                <CardDescription>Luas bumi/tanah objek pajak</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="LUAS_BUMI">Luas Bumi (m²)</Label>
                  <Input
                    id="LUAS_BUMI"
                    type="number"
                    value={formData.LUAS_BUMI}
                    onChange={(e) => setFormData({ ...formData, LUAS_BUMI: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/objek-pajak/spop")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
