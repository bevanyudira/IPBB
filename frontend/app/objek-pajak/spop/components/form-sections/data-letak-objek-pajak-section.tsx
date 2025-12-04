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

interface DataLetakObjekPajakSectionProps {
  form: UseFormReturn<SpopFormData>;
}

export function DataLetakObjekPajakSection({ form }: DataLetakObjekPajakSectionProps) {
  return (
    <div className="space-y-4">
      {/* Judul Section */}
      <h3 className="text-lg font-semibold">Data Letak Objek Pajak</h3>
      
      {/* Form Fields dalam Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* JALAN_OP */}
        <FormField
          control={form.control}
          name="JALAN_OP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>JALAN *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jl. Contoh No. 123"
                  {...field}
                  value={field.value || ""}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Container untuk RT dan RW */}
        <div className="grid grid-cols-2 gap-2">
          {/* RT_OP */}
          <FormField
            control={form.control}
            name="RT_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RT</FormLabel>
                <FormControl>
                  <Input
                    placeholder="001"
                    {...field}
                    value={field.value || ""}
                    maxLength={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RW_OP */}
          <FormField
            control={form.control}
            name="RW_OP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RW</FormLabel>
                <FormControl>
                  <Input
                    placeholder="01"
                    {...field}
                    value={field.value || ""}
                    maxLength={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* KELURAHAN_OP */}
        <FormField
          control={form.control}
          name="KELURAHAN_OP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelurahan/Desa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kelurahan"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BLOK_KAV_NO_OP */}
        <FormField
          control={form.control}
          name="BLOK_KAV_NO_OP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blok/Kav/No</FormLabel>
              <FormControl>
                <Input
                  placeholder="A-12"
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