"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SpopForm } from "@/components/spop/spop-form";

export default function CreateSpopPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/spop");
  };

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
            Tambah SPOP Baru
          </h1>
          <p className="text-muted-foreground">
            Isi semua informasi objek pajak dengan lengkap
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir SPOP</CardTitle>
        </CardHeader>
        <CardContent>
          <SpopForm mode="create" onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
