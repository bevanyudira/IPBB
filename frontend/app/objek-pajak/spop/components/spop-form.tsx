/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpopFormData } from "@/types/spop-types"
import { spopFormSchema, defaultFormValues, mapApiToFormValues } from "@/app/objek-pajak/spop/utils/formUtils"
import { InformasiUtamaSection } from "./form-sections/informasi-utama-section"
import { DataLetakObjekPajakSection } from "./form-sections/data-letak-objek-pajak-section"
import { DataSubjekPajakSection } from "./form-sections/data-subjek-pajak-section"
import { IdentitasPendataSection } from "./form-sections/identitas-pendata-section"
import { PetaSection } from "./form-sections/peta-section"
import { DataTanahSection } from "./form-sections/data-tanah-section"
import { Button } from "@/components/ui/button"
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { SubmitHandler } from "react-hook-form";

interface SpopFormProps {
  mode: "create" | "edit"
  initialData?: SpopFormData | null
  onSuccess: () => void
  onCancel: () => void
}

export function SpopForm({
  mode,
  initialData,
  onSuccess,
  onCancel
}: SpopFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hitung default values berdasarkan initialData
  const getDefaultValues = useCallback(() => {
    if (initialData && mode === "edit") {
      return mapApiToFormValues(initialData)
    }
    return defaultFormValues
  }, [initialData, mode])

  // Hitung dan gunakan default values (panggil fungsi), reset bila initialData berubah
  const defaultValues = useMemo(() => getDefaultValues(), [getDefaultValues])

  const form = useForm<SpopFormData>({
    resolver: zodResolver(spopFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset(mapApiToFormValues(initialData))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, mode])

  const onSubmit = async (data: SpopFormData) => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      
      if (!token) {
        toast({
          title: "Error",
          description: "Token tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        })
        return
      }

      // Format NOP dari komponen kunci (safely pad & coerce ke string)
      const pad = (v: any, len: number) => String(v ?? "").padStart(len, "0")
      const nop = `${pad(data.KD_PROPINSI,2)}${pad(data.KD_DATI2,2)}${pad(data.KD_KECAMATAN,3)}${pad(data.KD_KELURAHAN,3)}${pad(data.KD_BLOK,3)}${pad(data.NO_URUT,4)}${pad(data.KD_JNS_OP,1)}`

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) {
        toast({
          title: "Error",
          description: "Server URL tidak dikonfigurasi.",
          variant: "destructive",
        })
        return
      }

      const url = mode === "create" ? `${baseUrl}/spop` : `${baseUrl}/spop/${nop}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        onSuccess()
      } else {
        let errorMessage = "Gagal menyimpan data"
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          const errorData = await response.json().catch(() => null)
          if (errorData && typeof errorData === "object") {
            errorMessage = errorData.message ?? JSON.stringify(errorData)
          }
        } else {
          const text = await response.text().catch(() => "")
          if (text) errorMessage = text
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<SpopFormData>)} className="space-y-8">
          {/* Semua section menerima form dengan tipe UseFormReturn<SpopFormData> */}
          <InformasiUtamaSection form={form} />
          <DataLetakObjekPajakSection form={form} />
          <DataSubjekPajakSection form={form} />
          <IdentitasPendataSection form={form} />
          <DataTanahSection form={form} />
          {/* Peta section hanya ditampilkan saat edit mode */}
          {mode === "edit" && <PetaSection form={form} />}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
  )
}