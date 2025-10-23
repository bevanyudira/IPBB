"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminGuard } from "@/components/admin-guard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { IconDeviceFloppy, IconArrowLeft, IconCalendar } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface SpopFormData {
  // NOP Components
  KD_PROPINSI: string
  KD_DATI2: string
  KD_KECAMATAN: string
  KD_KELURAHAN: string
  KD_BLOK: string
  NO_URUT: string
  KD_JNS_OP: string
  
  // Informasi Utama
  JNS_TRANSAKSI_OP: string
  NO_FORMULIR_SPOP: string
  
  // NOP Bersama
  NOP_BERSAMA: string
  
  // Data Letak Objek Pajak
  JALAN_OP: string
  RW_OP: string
  RT_OP: string
  BLOK_KAV_NO_OP: string
  KELURAHAN_OP: string
  
  // Data Subjek Pajak
  SUBJEK_PAJAK_ID: string
  KD_STATUS_WP: string
  
  // Identitas Pendata
  TGL_PENDATAAN_OP: Date | undefined
  NM_PENDATAAN_OP: string
  NIP_PENDATA: string
  
  // Identitas Pemeriksa
  TGL_PEMERIKSAAN_OP: Date | undefined
  NM_PEMERIKSAAN_OP: string
  NIP_PEMERIKSA_OP: string
  
  // Data Tanah
  LUAS_BUMI: string
  KD_ZNT: string
  JNS_BUMI: string
  NILAI_SISTEM_BUMI: string
  NO_PERSIL: string
}

// Mock hooks - nanti diganti dengan real API
function useGetSpopDetail(nop: string | null) {
  return {
    data: null,
    error: null,
    isLoading: false,
  }
}

function useCreateSpop() {
  return async (data: any) => {
    console.log("Creating SPOP:", data)
    // TODO: Implement real API call
  }
}

function useUpdateSpop() {
  return async (nop: string, data: any) => {
    console.log("Updating SPOP:", nop, data)
    // TODO: Implement real API call
  }
}

export default function AdminSpopFormPage() {
  return (
    <AdminGuard>
      <AdminSpopFormPageContent />
    </AdminGuard>
  )
}

function AdminSpopFormPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nop = searchParams.get("nop")
  const isEdit = !!nop
  const { toast } = useToast()

  const { data: spopDetail, isLoading } = useGetSpopDetail(nop)
  const createSpop = useCreateSpop()
  const updateSpop = useUpdateSpop()

  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<SpopFormData>({
    KD_PROPINSI: "",
    KD_DATI2: "",
    KD_KECAMATAN: "",
    KD_KELURAHAN: "",
    KD_BLOK: "",
    NO_URUT: "",
    KD_JNS_OP: "",
    JNS_TRANSAKSI_OP: "",
    NO_FORMULIR_SPOP: "",
    NOP_BERSAMA: "",
    JALAN_OP: "",
    RW_OP: "",
    RT_OP: "",
    BLOK_KAV_NO_OP: "",
    KELURAHAN_OP: "",
    SUBJEK_PAJAK_ID: "",
    KD_STATUS_WP: "",
    TGL_PENDATAAN_OP: undefined,
    NM_PENDATAAN_OP: "",
    NIP_PENDATA: "",
    TGL_PEMERIKSAAN_OP: undefined,
    NM_PEMERIKSAAN_OP: "",
    NIP_PEMERIKSA_OP: "",
    LUAS_BUMI: "",
    KD_ZNT: "",
    JNS_BUMI: "",
    NILAI_SISTEM_BUMI: "",
    NO_PERSIL: "",
  })

  useEffect(() => {
    if (spopDetail) {
      // Populate form with existing data
      // TODO: Map spopDetail to formData
    }
  }, [spopDetail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validasi NOP
      if (!isEdit) {
        const nopParts = [
          formData.KD_PROPINSI,
          formData.KD_DATI2,
          formData.KD_KECAMATAN,
          formData.KD_KELURAHAN,
          formData.KD_BLOK,
          formData.NO_URUT,
          formData.KD_JNS_OP,
        ]
        
        if (nopParts.some(part => !part)) {
          toast({
            title: "Error",
            description: "Semua komponen NOP harus diisi",
            variant: "destructive",
          })
          return
        }
      }

      // Prepare data untuk API
      const apiData = {
        ...formData,
        LUAS_BUMI: formData.LUAS_BUMI ? parseInt(formData.LUAS_BUMI) : null,
        NILAI_SISTEM_BUMI: formData.NILAI_SISTEM_BUMI ? parseInt(formData.NILAI_SISTEM_BUMI) : null,
        TGL_PENDATAAN_OP: formData.TGL_PENDATAAN_OP 
          ? format(formData.TGL_PENDATAAN_OP, "yyyy-MM-dd") 
          : null,
        TGL_PEMERIKSAAN_OP: formData.TGL_PEMERIKSAAN_OP 
          ? format(formData.TGL_PEMERIKSAAN_OP, "yyyy-MM-dd") 
          : null,
      }

      if (isEdit && nop) {
        await updateSpop(nop, apiData)
        toast({
          title: "Berhasil",
          description: "SPOP berhasil diupdate",
        })
      } else {
        await createSpop(apiData)
        toast({
          title: "Berhasil",
          description: "SPOP berhasil dibuat",
        })
      }

      router.push("/admin/spop")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan SPOP",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof SpopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <p>Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {isEdit ? "Edit SPOP" : "Surat Pemberitahuan Objek Pajak"}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? `NOP: ${nop}` : "Tambah data objek pajak baru"}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Utama */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Utama</CardTitle>
                <CardDescription>Data dasar objek pajak</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NOP Components */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nop_asal">NOP Asal</Label>
                    <Input
                      id="nop_asal"
                      placeholder="18 digit"
                      disabled={isEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  <div>
                    <Label htmlFor="kd_propinsi">Propinsi</Label>
                    <Input
                      id="kd_propinsi"
                      value={formData.KD_PROPINSI}
                      onChange={(e) => updateField("KD_PROPINSI", e.target.value)}
                      maxLength={2}
                      placeholder="XX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_dati2">Dati2</Label>
                    <Input
                      id="kd_dati2"
                      value={formData.KD_DATI2}
                      onChange={(e) => updateField("KD_DATI2", e.target.value)}
                      maxLength={2}
                      placeholder="XX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_kecamatan">Kecamatan</Label>
                    <Input
                      id="kd_kecamatan"
                      value={formData.KD_KECAMATAN}
                      onChange={(e) => updateField("KD_KECAMATAN", e.target.value)}
                      maxLength={3}
                      placeholder="XXX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_kelurahan">Kelurahan</Label>
                    <Input
                      id="kd_kelurahan"
                      value={formData.KD_KELURAHAN}
                      onChange={(e) => updateField("KD_KELURAHAN", e.target.value)}
                      maxLength={3}
                      placeholder="XXX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_blok">Blok</Label>
                    <Input
                      id="kd_blok"
                      value={formData.KD_BLOK}
                      onChange={(e) => updateField("KD_BLOK", e.target.value)}
                      maxLength={3}
                      placeholder="XXX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="no_urut">No Urut</Label>
                    <Input
                      id="no_urut"
                      value={formData.NO_URUT}
                      onChange={(e) => updateField("NO_URUT", e.target.value)}
                      maxLength={4}
                      placeholder="XXXX"
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_jns_op">Jns OP</Label>
                    <Input
                      id="kd_jns_op"
                      value={formData.KD_JNS_OP}
                      onChange={(e) => updateField("KD_JNS_OP", e.target.value)}
                      maxLength={1}
                      placeholder="X"
                      disabled={isEdit}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jns_transaksi">Jenis Transaksi</Label>
                    <Select
                      value={formData.JNS_TRANSAKSI_OP}
                      onValueChange={(value) => updateField("JNS_TRANSAKSI_OP", value)}
                    >
                      <SelectTrigger id="jns_transaksi">
                        <SelectValue placeholder="Pilih jenis transaksi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Pendaftaran Baru</SelectItem>
                        <SelectItem value="2">2 - Pemutakhiran</SelectItem>
                        <SelectItem value="3">3 - Pembatalan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="no_formulir">No. Formulir SPOP</Label>
                    <Input
                      id="no_formulir"
                      value={formData.NO_FORMULIR_SPOP}
                      onChange={(e) => updateField("NO_FORMULIR_SPOP", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nop_bersama">NOP Bersama</Label>
                  <Input
                    id="nop_bersama"
                    value={formData.NOP_BERSAMA}
                    onChange={(e) => updateField("NOP_BERSAMA", e.target.value)}
                    placeholder="18 digit (opsional)"
                    maxLength={18}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Letak Objek Pajak */}
            <Card>
              <CardHeader>
                <CardTitle>Data Letak Objek Pajak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jalan_op">Jalan</Label>
                  <Input
                    id="jalan_op"
                    value={formData.JALAN_OP}
                    onChange={(e) => updateField("JALAN_OP", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rw_op">RW</Label>
                    <Input
                      id="rw_op"
                      value={formData.RW_OP}
                      onChange={(e) => updateField("RW_OP", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rt_op">RT</Label>
                    <Input
                      id="rt_op"
                      value={formData.RT_OP}
                      onChange={(e) => updateField("RT_OP", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="blok_kav">Blok/Kav/No</Label>
                    <Input
                      id="blok_kav"
                      value={formData.BLOK_KAV_NO_OP}
                      onChange={(e) => updateField("BLOK_KAV_NO_OP", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="kelurahan_op">Kelurahan/Desa</Label>
                  <Input
                    id="kelurahan_op"
                    value={formData.KELURAHAN_OP}
                    onChange={(e) => updateField("KELURAHAN_OP", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Subjek Pajak */}
            <Card>
              <CardHeader>
                <CardTitle>Data Subjek Pajak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjek_pajak_id">No KTP</Label>
                    <Input
                      id="subjek_pajak_id"
                      value={formData.SUBJEK_PAJAK_ID}
                      onChange={(e) => updateField("SUBJEK_PAJAK_ID", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status_wp">Status</Label>
                    <Select
                      value={formData.KD_STATUS_WP}
                      onValueChange={(value) => updateField("KD_STATUS_WP", value)}
                    >
                      <SelectTrigger id="status_wp">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Pemilik</SelectItem>
                        <SelectItem value="2">2 - Penyewa</SelectItem>
                        <SelectItem value="3">3 - Pengelola</SelectItem>
                        <SelectItem value="4">4 - Pemakai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identitas Pendata/Pejabat Yang Berwenang */}
            <Card>
              <CardHeader>
                <CardTitle>Identitas Pendata / Pejabat Yang Berwenang</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Mengetahui Pajak</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tgl_pendata">Tanggal</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <IconCalendar className="mr-2 h-4 w-4" />
                            {formData.TGL_PENDATAAN_OP ? (
                              format(formData.TGL_PENDATAAN_OP, "PPP", { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.TGL_PENDATAAN_OP}
                            onSelect={(date) => updateField("TGL_PENDATAAN_OP", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="nm_pendata">Nama</Label>
                      <Input
                        id="nm_pendata"
                        value={formData.NM_PENDATAAN_OP}
                        onChange={(e) => updateField("NM_PENDATAAN_OP", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nip_pendata">NIP</Label>
                      <Input
                        id="nip_pendata"
                        value={formData.NIP_PENDATA}
                        onChange={(e) => updateField("NIP_PENDATA", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Mengetahui Pejabat Yang Berwenang</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tgl_pemeriksa">Tanggal</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <IconCalendar className="mr-2 h-4 w-4" />
                            {formData.TGL_PEMERIKSAAN_OP ? (
                              format(formData.TGL_PEMERIKSAAN_OP, "PPP", { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.TGL_PEMERIKSAAN_OP}
                            onSelect={(date) => updateField("TGL_PEMERIKSAAN_OP", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="nm_pemeriksa">Nama</Label>
                      <Input
                        id="nm_pemeriksa"
                        value={formData.NM_PEMERIKSAAN_OP}
                        onChange={(e) => updateField("NM_PEMERIKSAAN_OP", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nip_pemeriksa">NIP</Label>
                      <Input
                        id="nip_pemeriksa"
                        value={formData.NIP_PEMERIKSA_OP}
                        onChange={(e) => updateField("NIP_PEMERIKSA_OP", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Tanah */}
            <Card>
              <CardHeader>
                <CardTitle>Data Tanah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="luas_bumi">Luas Bumi (m²)</Label>
                    <Input
                      id="luas_bumi"
                      type="number"
                      value={formData.LUAS_BUMI}
                      onChange={(e) => updateField("LUAS_BUMI", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kd_znt">Kode ZNT</Label>
                    <Input
                      id="kd_znt"
                      value={formData.KD_ZNT}
                      onChange={(e) => updateField("KD_ZNT", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jns_bumi">Jenis Bumi</Label>
                    <Input
                      id="jns_bumi"
                      value={formData.JNS_BUMI}
                      onChange={(e) => updateField("JNS_BUMI", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nilai_sistem">Nilai Individu / Total (IDR)</Label>
                    <Input
                      id="nilai_sistem"
                      type="number"
                      value={formData.NILAI_SISTEM_BUMI}
                      onChange={(e) => updateField("NILAI_SISTEM_BUMI", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="no_persil">No Persil</Label>
                  <Input
                    id="no_persil"
                    value={formData.NO_PERSIL}
                    onChange={(e) => updateField("NO_PERSIL", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Foto Objek Pajak */}
            <Card>
              <CardHeader>
                <CardTitle>Foto Objek Pajak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    Fitur upload foto akan ditambahkan
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSaving ? "Menyimpan..." : isEdit ? "Simpan" : "Edit"}
              </Button>
              <Button type="button" variant="secondary" disabled={isSaving}>
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
