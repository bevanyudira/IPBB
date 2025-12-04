/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SpopFormData } from "@/types/spop-types";
import { Input } from "@/components/ui/input";

interface DataTanahSectionProps {
  form: UseFormReturn<SpopFormData>;
}

export function DataTanahSection({ form }: DataTanahSectionProps) {
  function NumericInput({
    field,
    placeholder,
    step,
    min,
    required,
    className,
  }: any) {
    const [input, setInput] = useState<string>(
      field.value != null && field.value !== 0 ? String(field.value) : ""
    );

    useEffect(() => {
      const current = field.value != null ? String(field.value) : "";
      if (current !== input) setInput(current === "0" ? "" : current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [field.value]);

    return (
      <Input
        type="text"
        inputMode="decimal"
        step={step}
        min={min}
        placeholder={placeholder}
        className={className}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={() => {
          const v = input.trim();
          if (v === "") {
            field.onChange(0);
            return;
          }
          const parsed = parseFloat(v.replace(',', '.'));
          field.onChange(isNaN(parsed) ? 0 : parsed);
        }}
        required={required}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Data Tanah</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="LUAS_BUMI"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Luas Bumi (m²) *</FormLabel>
              <FormControl>
                <NumericInput
                  field={field}
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="KD_ZNT"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode ZNT *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kode ZNT"
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
          name="JNS_BUMI"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Bumi *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jenis Bumi"
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
          name="NILAI_SISTEM_BUMI"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nilai Sistem Bumi</FormLabel>
              <FormControl>
                <NumericInput field={field} min="0" placeholder="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="KELAS_BUMI"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas Bumi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kelas Bumi"
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
          name="NILAI_INDIVIDUAL_TOTAL"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nilai Individual Total</FormLabel>
              <FormControl>
                <NumericInput field={field} min="0" placeholder="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}