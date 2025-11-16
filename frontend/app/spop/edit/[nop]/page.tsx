"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SpopForm } from "@/components/spop/spop-form";
import { useToast } from "@/hooks/use-toast";

export default function EditSpopPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [spopData, setSpopData] = useState<any>(null);

  useEffect(() => {
    if (params.nop) {
      loadSpopData();
    }
  }, [params.nop]);

  const loadSpopData = async () => {
    setLoading(true);
    try {
      // Parse NOP from slug format: KD_PROPINSI-KD_DATI2-KD_KECAMATAN-KD_KELURAHAN-KD_BLOK-NO_URUT-KD_JNS_OP
      const nopParts = (params.nop as string).split("-");
      if (nopParts.length !== 7) {
        throw new Error("Format NOP tidak valid");
      }

      const [kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan, kd_blok, no_urut, kd_jns_op] = nopParts;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/${kd_propinsi}/${kd_dati2}/${kd_kecamatan}/${kd_kelurahan}/${kd_blok}/${no_urut}/${kd_jns_op}`
      );

      if (!response.ok) {
        throw new Error("SPOP tidak ditemukan");
      }

      const data = await response.json();
      
      // Format data untuk form (convert date)
      const formattedData = {
        ...data,
        TGL_PENDATAAN_OP: data.TGL_PENDATAAN_OP ? new Date(data.TGL_PENDATAAN_OP).toISOString().split("T")[0] : "",
        TGL_PEMERIKSAAN_OP: data.TGL_PEMERIKSAAN_OP ? new Date(data.TGL_PEMERIKSAAN_OP).toISOString().split("T")[0] : "",
        LUAS_BUMI: data.LUAS_BUMI?.toString() || "0",
        NILAI_SISTEM_BUMI: data.NILAI_SISTEM_BUMI?.toString() || "0",
      };

      setSpopData(formattedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data SPOP",
        variant: "destructive",
      });
      router.push("/spop");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push("/spop");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!spopData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">
          Data SPOP tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit SPOP
          </h1>
          <p className="text-muted-foreground">
            Update informasi objek pajak
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Edit SPOP</CardTitle>
        </CardHeader>
        <CardContent>
          <SpopForm mode="edit" initialData={spopData} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
