/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SpopFormData } from "@/types/spop-types";
import { Input } from "@/components/ui/input";

interface InformasiUtamaSectionProps {
  form: UseFormReturn<SpopFormData>;
  mode: "create" | "edit";
}

export function InformasiUtamaSection({
  form,
  mode,
}: InformasiUtamaSectionProps) {
  // Fungsi untuk memecah NOP 18 digit menjadi komponen
  const parseNOP = (nop: string) => {
    if (nop.length !== 18) return null;
    return {
      KD_PROPINSI: nop.substring(0, 2),
      KD_DATI2: nop.substring(2, 4),
      KD_KECAMATAN: nop.substring(4, 7),
      KD_KELURAHAN: nop.substring(7, 10),
      KD_BLOK: nop.substring(10, 13),
      NO_URUT: nop.substring(13, 17),
      KD_JNS_OP: nop.substring(17, 18),
    };
  };

  // Effect untuk memantau perubahan NOP_ASAL
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Jika NOP_ASAL diubah, otomatis pecah menjadi field-field KD
      if (name === "NOP_ASAL" && value.NOP_ASAL) {
        const nop = value.NOP_ASAL;

        // Jika NOP 18 digit, pecah menjadi komponen
        if (nop.length === 18) {
          const parsed = parseNOP(nop);
          if (parsed) {
            console.log("🔧 Memecah NOP_ASAL:", nop, "menjadi:", parsed);

            // Set nilai ke masing-masing field
            form.setValue("KD_PROPINSI", parsed.KD_PROPINSI, {
              shouldValidate: true,
            });
            form.setValue("KD_DATI2", parsed.KD_DATI2, {
              shouldValidate: true,
            });
            form.setValue("KD_KECAMATAN", parsed.KD_KECAMATAN, {
              shouldValidate: true,
            });
            form.setValue("KD_KELURAHAN", parsed.KD_KELURAHAN, {
              shouldValidate: true,
            });
            form.setValue("KD_BLOK", parsed.KD_BLOK, { shouldValidate: true });
            form.setValue("NO_URUT", parsed.NO_URUT, { shouldValidate: true });
            form.setValue("KD_JNS_OP", parsed.KD_JNS_OP, {
              shouldValidate: true,
            });

            // SUBJEK_PAJAK_ID sama dengan NOP_ASAL (18 digit)
            form.setValue("SUBJEK_PAJAK_ID", nop, { shouldValidate: true });
          }
        } else if (nop.length > 0 && nop.length < 18) {
          // Reset field jika NOP tidak lengkap
          form.setValue("SUBJEK_PAJAK_ID", "", { shouldValidate: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Effect untuk membuat NOP_ASAL dari field-field KD saat mode edit
  useEffect(() => {
    if (mode === "edit") {
      const values = form.getValues();
      const pad = (v: any, len: number) => String(v ?? "").padStart(len, "0");

      // Cek apakah field-field KD sudah terisi
      if (
        values.KD_PROPINSI &&
        values.KD_DATI2 &&
        values.KD_KECAMATAN &&
        values.KD_KELURAHAN &&
        values.KD_BLOK &&
        values.NO_URUT &&
        values.KD_JNS_OP
      ) {
        // Buat NOP_ASAL dari field-field KD
        const nop = `${pad(values.KD_PROPINSI, 2)}${pad(
          values.KD_DATI2,
          2
        )}${pad(values.KD_KECAMATAN, 3)}${pad(values.KD_KELURAHAN, 3)}${pad(
          values.KD_BLOK,
          3
        )}${pad(values.NO_URUT, 4)}${pad(values.KD_JNS_OP, 1)}`;

        form.setValue("NOP_ASAL", nop, { shouldValidate: true });

        // SUBJEK_PAJAK_ID sama dengan NOP_ASAL
        form.setValue("SUBJEK_PAJAK_ID", nop, { shouldValidate: true });
      }
    }
  }, [form, mode]);

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Informasi Utama</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Field NOP_ASAL - input utama */}
        <FormField
          control={form.control}
          name="NOP_ASAL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NOP Asal *</FormLabel>
              <FormControl>
                <Input
                  placeholder="510200201500000087"
                  {...field}
                  value={field.value || ""}
                  maxLength={18}
                  readOnly={mode === "edit"}
                  className={mode === "edit" ? "bg-gray-50" : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Hanya angka yang diizinkan
                    if (/^\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="NO_FORMULIR_SPOP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. Formulir SPOP *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nomor Formulir SPOP"
                  {...field}
                  value={field.value || ""}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="NO_SPPT_LAMA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. SPPT Lama</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nomor SPPT Lama"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="NOP_BERSAMA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NOP Bersama</FormLabel>
              <FormControl>
                <Input
                  placeholder="NOP Bersama"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
