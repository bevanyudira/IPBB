// hooks/use-spop-submit.ts
import { useRouter } from "next/navigation";
import { SpopFormData } from "@/types/spop-types";
import { useToast } from "@/hooks/use-toast";

// Define proper types untuk mutations
interface MutationResult {
  mutateAsync: (data: SpopFormData) => Promise<unknown>;
  isPending: boolean;
}

interface UseSpopSubmitProps {
  formData: SpopFormData;
  nop: string | null;
  createMutation: MutationResult;
  updateMutation: MutationResult;
}

export function useSpopSubmit({
  formData,
  nop,
  createMutation,
  updateMutation
}: UseSpopSubmitProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!nop;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit) {
        // Update existing data
        await updateMutation.mutateAsync(formData);
        toast({
          title: "Berhasil",
          description: "Data SPOP berhasil diperbarui",
          variant: "default",
        });
      } else {
        // Create new data
        await createMutation.mutateAsync(formData);
        toast({
          title: "Berhasil",
          description: "Data SPOP berhasil dibuat",
          variant: "default",
        });
      }

      // Redirect ke halaman list
      router.push("/objek-pajak/spop");
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";
      
      toast({
        title: "Error",
        description: `Gagal menyimpan data SPOP: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending
  };
}