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
}

export function InformasiUtamaSection({ form }: InformasiUtamaSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Informasi Utama</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="NOP_ASAL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NOP Asal</FormLabel>
              <FormControl>
                <Input
                  placeholder="NOP Asal"
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