/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpopFormData } from "@/types/spop-types";
import {
  spopFormSchema,
  defaultFormValues,
  mapApiToFormValues,
} from "@/app/objek-pajak/spop/utils/formUtils";
import { InformasiUtamaSection } from "./form-sections/informasi-utama-section";
import { DataLetakObjekPajakSection } from "./form-sections/data-letak-objek-pajak-section";
import { DataSubjekPajakSection } from "./form-sections/data-subjek-pajak-section";
import { IdentitasPendataSection } from "./form-sections/identitas-pendata-section";
import { PetaSection } from "./form-sections/peta-section";
import { DataTanahSection } from "./form-sections/data-tanah-section";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { SubmitHandler } from "react-hook-form";

interface SpopFormProps {
  mode: "create" | "edit";
  initialData?: SpopFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpopForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: SpopFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup dengan reset saat initialData berubah
  const form = useForm<SpopFormData>({
    resolver: zodResolver(spopFormSchema),
    defaultValues: useMemo(() => {
      if (initialData && mode === "edit") {
        return mapApiToFormValues(initialData);
      }
      return defaultFormValues;
    }, [initialData, mode]),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Reset form saat initialData berubah
  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("Resetting form with initial data");
      form.reset(mapApiToFormValues(initialData));
    } else if (mode === "create") {
      form.reset(defaultFormValues);
    }
  }, [initialData, mode, form]);

  // Handle form submission
  const onSubmit = async (data: SpopFormData) => {
    console.log("🚀 Form submission started");

    // Validasi cepat sebelum submit
    const validationResult = await form.trigger();
    if (!validationResult) {
      console.log("❌ Form validation failed, aborting submission");

      // Temukan field pertama yang error
      const firstErrorKey = Object.keys(form.formState.errors)[0];
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast({
        title: "Validasi Gagal",
        description:
          "Harap periksa kembali data yang diisi. Ada field yang belum valid.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        return;
      }

      // Format NOP dari komponen kunci
      const pad = (v: any, len: number) => String(v ?? "").padStart(len, "0");
      const nop = `${pad(data.KD_PROPINSI, 2)}${pad(data.KD_DATI2, 2)}${pad(
        data.KD_KECAMATAN,
        3
      )}${pad(data.KD_KELURAHAN, 3)}${pad(data.KD_BLOK, 3)}${pad(
        data.NO_URUT,
        4
      )}${pad(data.KD_JNS_OP, 1)}`;

      console.log("Generated NOP:", nop);

      // ========== CLEANING DATA ==========
      const cleanedData = { ...data };

      // 1. Pastikan field yang NOT NULL di database tidak kosong
      if (!cleanedData.TGL_PEMERIKSAAN_OP) {
        cleanedData.TGL_PEMERIKSAAN_OP =
          data.TGL_PENDATAAN_OP || new Date().toISOString().split("T")[0];
      }

      if (
        !cleanedData.NM_PEMERIKSAAN_OP ||
        cleanedData.NM_PEMERIKSAAN_OP.trim() === ""
      ) {
        cleanedData.NM_PEMERIKSAAN_OP = "Tidak Ada";
      }

      if (
        !cleanedData.NIP_PEMERIKSA_OP ||
        cleanedData.NIP_PEMERIKSA_OP.trim() === ""
      ) {
        cleanedData.NIP_PEMERIKSA_OP = "000000";
      }

      // 2. Format tanggal ke ISO (YYYY-MM-DD)
      const formatDateToISO = (dateStr: string): string => {
        if (!dateStr || dateStr.trim() === "") return "";

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }

        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.warn("Gagal parse date:", dateStr);
        }

        return dateStr;
      };

      // Format field tanggal
      cleanedData.TGL_PENDATAAN_OP = formatDateToISO(
        data.TGL_PENDATAAN_OP || ""
      );
      cleanedData.TGL_PEMERIKSAAN_OP = formatDateToISO(
        cleanedData.TGL_PEMERIKSAAN_OP || ""
      );

      // 3. Convert empty strings to null untuk field yang BOLEH null
      const nullableFields = [
        "NO_SPPT_LAMA",
        "NOP_BERSAMA",
        "BLOK_KAV_NO_OP",
        "KELURAHAN_OP",
        "RW_OP",
        "RT_OP",
        "NO_PERSIL",
        "NO_KTP",
        "NAMA_WP",
        "JALAN_WP",
        "TELP_WP",
        "KOTA_WP",
        "STATUS_PEKERJAAN_WP",
        "RT_WP",
        "RW_WP",
        "BLOK_KAV_NO_WP",
        "KD_POS_WP",
        "NPWP",
        "KELURAHAN_WP",
        "KELAS_BUMI",
        "KD_PROPINSI_BERSAMA",
        "KD_DATI2_BERSAMA",
        "KD_KECAMATAN_BERSAMA",
        "KD_KELURAHAN_BERSAMA",
        "KD_BLOK_BERSAMA",
        "NO_URUT_BERSAMA",
        "KD_JNS_OP_BERSAMA",
        "KD_PROPINSI_ASAL",
        "KD_DATI2_ASAL",
        "KD_KECAMATAN_ASAL",
        "KD_KELURAHAN_ASAL",
        "KD_BLOK_ASAL",
        "NO_URUT_ASAL",
        "KD_JNS_OP_ASAL",
      ];

      nullableFields.forEach((field) => {
        if ((cleanedData as any)[field] === "") {
          (cleanedData as any)[field] = null;
        }
      });

      // 4. Pastikan NOP_ASAL ada untuk create mode
      if (mode === "create" && !cleanedData.NOP_ASAL) {
        cleanedData.NOP_ASAL = nop;
      }

      // ========== END CLEANING ==========

      // API call
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
        /\/+$/,
        ""
      );
      const url =
        mode === "create" ? `${apiBase}/spop/create` : `${apiBase}/spop/update`;

      console.log("📤 Mengirim ke URL:", url);

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log("✅ BERHASIL! Data dibuat dengan NOP:", nop);
        toast({
          title: "Sukses! 🎉",
          description: `Data berhasil ${
            mode === "create" ? "ditambahkan" : "diperbarui"
          } dengan NOP: ${nop}`,
        });

        // Reset form dan callback
        if (mode === "create") {
          form.reset(defaultFormValues);
        }
        onSuccess();
      } else {
        console.log("❌ Request failed!");
        let errorMessage = "Gagal menyimpan data";

        try {
          const errorData = JSON.parse(responseText);
          if (errorData?.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = `Backend Error: ${errorData.detail}`;
            } else if (Array.isArray(errorData.detail)) {
              const errorDetails = errorData.detail.map((err: any) => {
                const field = err.loc?.join(".") || "unknown";
                return `• ${field}: ${err.msg}`;
              });
              errorMessage = `Validasi Error:\n${errorDetails.join("\n")}`;
            }
          } else if (errorData?.message) {
            errorMessage = `Backend Error: ${errorData.message}`;
          }
        } catch {
          if (responseText) {
            errorMessage = `Server Error (${
              response.status
            }): ${responseText.substring(0, 200)}`;
          } else {
            errorMessage = `Server Error: ${response.status} ${response.statusText}`;
          }
        }

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("🔥 Error:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form terlebih dahulu
    const isValid = await form.trigger();
    if (!isValid) {
      // Temukan dan scroll ke error pertama
      const firstErrorKey = Object.keys(form.formState.errors)[0];
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast({
        title: "Validasi Gagal",
        description: "Harap periksa kembali data yang diisi.",
        variant: "destructive",
      });
      return;
    }

    // Jika valid, submit form
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-lg font-semibold">
        {mode === "create" ? "Tambah Data SPOP" : "Edit Data SPOP"}
      </h2>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form sections */}
          <InformasiUtamaSection form={form} mode={mode} />
          <DataLetakObjekPajakSection form={form} />
          <DataSubjekPajakSection form={form} />
          <IdentitasPendataSection form={form} />
          <DataTanahSection form={form} />
          {mode === "edit" && <PetaSection form={form} />}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
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
      </Form>
    </div>
  );
}
