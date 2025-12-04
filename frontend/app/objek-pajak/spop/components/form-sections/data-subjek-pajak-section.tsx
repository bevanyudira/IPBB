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

interface DataSubjekPajakSectionProps {
  form: UseFormReturn<SpopFormData>;
}

export function DataSubjekPajakSection({ form }: DataSubjekPajakSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Data Subjek Objek Pajak</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="NO_KTP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. KTP</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nomor KTP"
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
          name="KD_STATUS_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Status Wajib Pajak"
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
          name="NAMA_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nama Wajib Pajak"
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
          name="STATUS_PEKERJAAN_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pekerjaan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Pekerjaan"
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
          name="JALAN_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jalan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jalan"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="RW_WP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RW</FormLabel>
                <FormControl>
                  <Input
                    placeholder="RW"
                    {...field}
                    value={field.value || ""}
                    maxLength={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="RT_WP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RT</FormLabel>
                <FormControl>
                  <Input
                    placeholder="RT"
                    {...field}
                    value={field.value || ""}
                    maxLength={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="BLOK_KAV_NO_WP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blok/Kav/No</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Blok/Kav/No"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="TELP_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telepon</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nomor Telepon"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="KD_POS_WP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Pos</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kode Pos"
                    {...field}
                    value={field.value || ""}
                    maxLength={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="NPWP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NPWP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NPWP"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="KOTA_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kota</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kota"
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
          name="KELURAHAN_WP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelurahan/Desa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kelurahan/Desa"
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