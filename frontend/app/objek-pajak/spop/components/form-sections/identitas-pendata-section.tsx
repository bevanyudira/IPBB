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

interface IdentitasPendataSectionProps {
  form: UseFormReturn<SpopFormData>;
}

export function IdentitasPendataSection({ form }: IdentitasPendataSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Identitas Pendata / Pejabat Yang Berwenang</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Petugas Pendata</h4>
          
          <FormField
            control={form.control}
            name="TGL_PENDATAAN_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
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
            name="NM_PENDATAAN_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Pendata"
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
            name="NIP_PENDATA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NIP Pendata"
                    {...field}
                    value={field.value || ""}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Mengetahui Pejabat yang Berwenang</h4>
          
          <FormField
            control={form.control}
            name="TGL_PEMERIKSAAN_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
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
            name="NM_PEMERIKSAAN_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Pejabat"
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
            name="NIP_PEMERIKSA_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NIP Pejabat"
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
    </div>
  );
}