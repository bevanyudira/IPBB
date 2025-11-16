"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Schema validation
const spopFormSchema = z.object({
  // Primary Keys
  KD_PROPINSI: z.string().min(1, "Provinsi harus dipilih"),
  KD_DATI2: z.string().min(1, "Kabupaten/Kota harus dipilih"),
  KD_KECAMATAN: z.string().min(1, "Kecamatan harus dipilih"),
  KD_KELURAHAN: z.string().min(1, "Kelurahan harus dipilih"),
  KD_BLOK: z.string().min(1, "Kode Blok harus diisi"),
  NO_URUT: z.string().min(1, "Nomor Urut harus diisi"),
  KD_JNS_OP: z.string().min(1, "Jenis Objek Pajak harus diisi"),
  
  // Required fields
  // SUBJEK_PAJAK_ID will be auto-assigned by backend based on logged-in user
  SUBJEK_PAJAK_ID: z.string().optional(), // Changed to optional, will be set by backend
  JNS_TRANSAKSI_OP: z.string().min(1, "Jenis Transaksi harus diisi"),
  JALAN_OP: z.string().min(1, "Alamat/Jalan harus diisi"),
  KD_STATUS_WP: z.string().min(1, "Status WP harus diisi"),
  LUAS_BUMI: z.string().min(1, "Luas Tanah harus diisi"),
  JNS_BUMI: z.string().min(1, "Jenis Tanah harus diisi"),
  TGL_PENDATAAN_OP: z.string().min(1, "Tanggal Pendataan harus diisi"),
  TGL_PEMERIKSAAN_OP: z.string().min(1, "Tanggal Pemeriksaan harus diisi"),
  
  // Optional fields
  NO_FORMULIR_SPOP: z.string().optional(),
  BLOK_KAV_NO_OP: z.string().optional(),
  KELURAHAN_OP: z.string().optional(),
  RW_OP: z.string().optional(),
  RT_OP: z.string().optional(),
  KD_ZNT: z.string().max(2, "Kode ZNT maksimal 2 karakter").optional(),
  NILAI_SISTEM_BUMI: z.string().optional(),
  NM_PENDATAAN_OP: z.string().optional(),
  NIP_PENDATA: z.string().optional(),
  NM_PEMERIKSAAN_OP: z.string().optional(),
  NIP_PEMERIKSA_OP: z.string().optional(),
  NO_PERSIL: z.string().optional(),
  
  // Optional - Bersama
  KD_PROPINSI_BERSAMA: z.string().optional(),
  KD_DATI2_BERSAMA: z.string().optional(),
  KD_KECAMATAN_BERSAMA: z.string().optional(),
  KD_KELURAHAN_BERSAMA: z.string().optional(),
  KD_BLOK_BERSAMA: z.string().optional(),
  NO_URUT_BERSAMA: z.string().optional(),
  KD_JNS_OP_BERSAMA: z.string().optional(),
  
  // Optional - Asal
  KD_PROPINSI_ASAL: z.string().optional(),
  KD_DATI2_ASAL: z.string().optional(),
  KD_KECAMATAN_ASAL: z.string().optional(),
  KD_KELURAHAN_ASAL: z.string().optional(),
  KD_BLOK_ASAL: z.string().optional(),
  NO_URUT_ASAL: z.string().optional(),
  KD_JNS_OP_ASAL: z.string().optional(),
  NO_SPPT_LAMA: z.string().optional(),
});

type SpopFormValues = z.infer<typeof spopFormSchema>;

interface SpopFormProps {
  mode: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

export function SpopForm({ mode, initialData, onSuccess }: SpopFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dropdown data
  const [propinsiList, setPropinsiList] = useState<any[]>([]);
  const [dati2List, setDati2List] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kelurahanList, setKelurahanList] = useState<any[]>([]);
  
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingDati2, setLoadingDati2] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);

  // Convert null values to empty strings
  const cleanInitialData = initialData ? Object.entries(initialData).reduce((acc, [key, value]) => {
    acc[key] = value === null || value === undefined ? "" : value;
    return acc;
  }, {} as any) : null;

  const form = useForm<SpopFormValues>({
    resolver: zodResolver(spopFormSchema),
    defaultValues: cleanInitialData || {
      // Primary Keys
      KD_PROPINSI: "",
      KD_DATI2: "",
      KD_KECAMATAN: "",
      KD_KELURAHAN: "",
      KD_BLOK: "",
      NO_URUT: "",
      KD_JNS_OP: "",
      
      // Required fields
      SUBJEK_PAJAK_ID: "",
      JNS_TRANSAKSI_OP: "",
      JALAN_OP: "",
      KD_STATUS_WP: "",
      LUAS_BUMI: "0",
      JNS_BUMI: "",
      TGL_PENDATAAN_OP: new Date().toISOString().split("T")[0],
      TGL_PEMERIKSAAN_OP: new Date().toISOString().split("T")[0],
      
      // Optional fields - set to empty string to prevent undefined
      NO_FORMULIR_SPOP: "",
      BLOK_KAV_NO_OP: "",
      KELURAHAN_OP: "",
      RW_OP: "",
      RT_OP: "",
      KD_ZNT: "",
      NILAI_SISTEM_BUMI: "0",
      NM_PENDATAAN_OP: "",
      NIP_PENDATA: "",
      NM_PEMERIKSAAN_OP: "",
      NIP_PEMERIKSA_OP: "",
      NO_PERSIL: "",
      
      // Optional - Bersama
      KD_PROPINSI_BERSAMA: "",
      KD_DATI2_BERSAMA: "",
      KD_KECAMATAN_BERSAMA: "",
      KD_KELURAHAN_BERSAMA: "",
      KD_BLOK_BERSAMA: "",
      NO_URUT_BERSAMA: "",
      KD_JNS_OP_BERSAMA: "",
      
      // Optional - Asal
      KD_PROPINSI_ASAL: "",
      KD_DATI2_ASAL: "",
      KD_KECAMATAN_ASAL: "",
      KD_KELURAHAN_ASAL: "",
      KD_BLOK_ASAL: "",
      NO_URUT_ASAL: "",
      KD_JNS_OP_ASAL: "",
      NO_SPPT_LAMA: "",
    },
  });

  // Load Provinsi on mount
  useEffect(() => {
    loadProvinsi();
  }, []);

  // Watch for changes in location fields
  const watchProvinsi = form.watch("KD_PROPINSI");
  const watchDati2 = form.watch("KD_DATI2");
  const watchKecamatan = form.watch("KD_KECAMATAN");

  useEffect(() => {
    if (watchProvinsi) {
      loadDati2(watchProvinsi);
    } else {
      setDati2List([]);
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [watchProvinsi]);

  useEffect(() => {
    if (watchProvinsi && watchDati2) {
      loadKecamatan(watchProvinsi, watchDati2);
    } else {
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [watchProvinsi, watchDati2]);

  useEffect(() => {
    if (watchProvinsi && watchDati2 && watchKecamatan) {
      loadKelurahan(watchProvinsi, watchDati2, watchKecamatan);
    } else {
      setKelurahanList([]);
    }
  }, [watchProvinsi, watchDati2, watchKecamatan]);

  const loadProvinsi = async () => {
    setLoadingProvinsi(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/propinsi`,
        {
          headers: token ? {
            "Authorization": `Bearer ${token}`,
          } : {},
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPropinsiList(data);
      }
    } catch (error) {
      console.error("Failed to load provinsi:", error);
    } finally {
      setLoadingProvinsi(false);
    }
  };

  const loadDati2 = async (kdProvinsi: string) => {
    setLoadingDati2(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/dati2/${kdProvinsi}`,
        {
          headers: token ? {
            "Authorization": `Bearer ${token}`,
          } : {},
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDati2List(data);
      }
    } catch (error) {
      console.error("Failed to load dati2:", error);
    } finally {
      setLoadingDati2(false);
    }
  };

  const loadKecamatan = async (kdProvinsi: string, kdDati2: string) => {
    setLoadingKecamatan(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kecamatan/${kdProvinsi}/${kdDati2}`,
        {
          headers: token ? {
            "Authorization": `Bearer ${token}`,
          } : {},
        }
      );
      if (response.ok) {
        const data = await response.json();
        setKecamatanList(data);
      }
    } catch (error) {
      console.error("Failed to load kecamatan:", error);
    } finally {
      setLoadingKecamatan(false);
    }
  };

  const loadKelurahan = async (
    kdProvinsi: string,
    kdDati2: string,
    kdKecamatan: string
  ) => {
    setLoadingKelurahan(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kelurahan/${kdProvinsi}/${kdDati2}/${kdKecamatan}`,
        {
          headers: token ? {
            "Authorization": `Bearer ${token}`,
          } : {},
        }
      );
      if (response.ok) {
        const data = await response.json();
        setKelurahanList(data);
      }
    } catch (error) {
      console.error("Failed to load kelurahan:", error);
    } finally {
      setLoadingKelurahan(false);
    }
  };

  const onSubmit = async (values: SpopFormValues) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan, silakan login kembali",
          variant: "destructive",
        });
        return;
      }

      // Convert string to number for numeric fields
      // Keep empty strings for required fields, remove only for optional fields
      const requiredFields = [
        'KD_PROPINSI', 'KD_DATI2', 'KD_KECAMATAN', 'KD_KELURAHAN', 
        'KD_BLOK', 'NO_URUT', 'KD_JNS_OP', 'SUBJEK_PAJAK_ID',
        'JNS_TRANSAKSI_OP', 'JALAN_OP', 'KD_STATUS_WP', 
        'LUAS_BUMI', 'JNS_BUMI', 'NILAI_SISTEM_BUMI',
        'TGL_PENDATAAN_OP', 'TGL_PEMERIKSAAN_OP'
      ];

      const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
        // For required fields, always include them
        if (requiredFields.includes(key)) {
          acc[key] = value;
        } 
        // For optional fields, skip empty strings
        else if (value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const payload = {
        ...cleanedValues,
        LUAS_BUMI: parseInt(cleanedValues.LUAS_BUMI || "0"),
        NILAI_SISTEM_BUMI: parseInt(cleanedValues.NILAI_SISTEM_BUMI || "0"),
      };

      const endpoint =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/create`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/update`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Backend error:", error);
        throw new Error(error.detail || "Gagal menyimpan data");
      }

      toast({
        title: "Berhasil",
        description: `SPOP berhasil ${mode === "create" ? "dibuat" : "diupdate"}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Info Alert */}
        {mode === "create" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informasi Penting
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    <strong>ID Subjek Pajak</strong> akan otomatis diisi berdasarkan akun yang sedang login. 
                    Anda tidak perlu memasukkan ID Subjek Pajak secara manual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Lokasi Objek Pajak */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lokasi Objek Pajak</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provinsi */}
            <FormField
              control={form.control}
              name="KD_PROPINSI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provinsi *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit" || loadingProvinsi}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Provinsi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propinsiList.map((item) => (
                        <SelectItem key={item.KD_PROPINSI} value={item.KD_PROPINSI}>
                          {item.NM_PROPINSI}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kabupaten/Kota */}
            <FormField
              control={form.control}
              name="KD_DATI2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kabupaten/Kota *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit" || !watchProvinsi || loadingDati2}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kabupaten/Kota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dati2List.map((item) => (
                        <SelectItem key={item.KD_DATI2} value={item.KD_DATI2}>
                          {item.NM_DATI2}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kecamatan */}
            <FormField
              control={form.control}
              name="KD_KECAMATAN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kecamatan *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit" || !watchDati2 || loadingKecamatan}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kecamatan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kecamatanList.map((item) => (
                        <SelectItem key={item.KD_KECAMATAN} value={item.KD_KECAMATAN}>
                          {item.NM_KECAMATAN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kelurahan */}
            <FormField
              control={form.control}
              name="KD_KELURAHAN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelurahan *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit" || !watchKecamatan || loadingKelurahan}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelurahan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kelurahanList.map((item) => (
                        <SelectItem key={item.KD_KELURAHAN} value={item.KD_KELURAHAN}>
                          {item.NM_KELURAHAN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blok */}
            <FormField
              control={form.control}
              name="KD_BLOK"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Blok *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="001"
                      {...field}
                      disabled={mode === "edit"}
                      maxLength={9}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nomor Urut */}
            <FormField
              control={form.control}
              name="NO_URUT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Urut *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0001"
                      {...field}
                      disabled={mode === "edit"}
                      maxLength={12}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Objek Pajak */}
            <FormField
              control={form.control}
              name="KD_JNS_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Objek Pajak *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis OP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Tanah</SelectItem>
                      <SelectItem value="2">Bangunan</SelectItem>
                      <SelectItem value="3">Tanah + Bangunan</SelectItem>
                      <SelectItem value="4">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Data Subjek & Transaksi */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Subjek & Transaksi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SUBJEK_PAJAK_ID is hidden - will be auto-assigned by backend based on logged-in user */}
            
            <FormField
              control={form.control}
              name="NO_FORMULIR_SPOP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Formulir SPOP</FormLabel>
                  <FormControl>
                    <Input placeholder="SPOP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="JNS_TRANSAKSI_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis Transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Pendaftaran Baru</SelectItem>
                      <SelectItem value="2">Pemecahan</SelectItem>
                      <SelectItem value="3">Penggabungan</SelectItem>
                      <SelectItem value="4">Mutasi</SelectItem>
                      <SelectItem value="5">Perubahan Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="KD_STATUS_WP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Wajib Pajak *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status WP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Pemilik</SelectItem>
                      <SelectItem value="1">Penyewa</SelectItem>
                      <SelectItem value="2">Pengelola</SelectItem>
                      <SelectItem value="3">Pemakai</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Alamat Objek Pajak */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alamat Objek Pajak</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="JALAN_OP"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Jalan/Alamat *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jl. Contoh No. 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="BLOK_KAV_NO_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blok/Kavling/Nomor</FormLabel>
                  <FormControl>
                    <Input placeholder="A-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="KELURAHAN_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelurahan OP</FormLabel>
                  <FormControl>
                    <Input placeholder="Kelurahan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="RT_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RT</FormLabel>
                  <FormControl>
                    <Input placeholder="001" {...field} maxLength={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="RW_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RW</FormLabel>
                  <FormControl>
                    <Input placeholder="01" {...field} maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Data Tanah */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Tanah</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="LUAS_BUMI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luas Tanah (m²) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="JNS_BUMI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Tanah *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis Tanah" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Sawah</SelectItem>
                      <SelectItem value="2">Tegalan</SelectItem>
                      <SelectItem value="3">Pekarangan</SelectItem>
                      <SelectItem value="4">Tambak</SelectItem>
                      <SelectItem value="5">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="KD_ZNT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode ZNT</FormLabel>
                  <FormControl>
                    <Input placeholder="01" {...field} />
                  </FormControl>
                  <FormDescription>Zona Nilai Tanah</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NILAI_SISTEM_BUMI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai Sistem Tanah (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NO_PERSIL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Persil</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Pendataan & Pemeriksaan */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pendataan & Pemeriksaan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="TGL_PENDATAAN_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pendataan *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NM_PENDATAAN_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Petugas Pendataan</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Petugas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NIP_PENDATA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP Petugas Pendataan</FormLabel>
                  <FormControl>
                    <Input placeholder="19XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="TGL_PEMERIKSAAN_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pemeriksaan *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NM_PEMERIKSAAN_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pemeriksa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Pemeriksa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NIP_PEMERIKSA_OP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP Pemeriksa</FormLabel>
                  <FormControl>
                    <Input placeholder="19XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Simpan" : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
