"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SpopDataTable } from "@/components/spop/spop-data-table";
import { SpopFilters } from "@/components/spop/spop-filters";

export default function SpopPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    kd_propinsi: undefined,
    kd_dati2: undefined,
    kd_kecamatan: undefined,
    kd_kelurahan: undefined,
    search: undefined,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Data SPOP
          </h1>
          <p className="text-muted-foreground">
            Kelola Surat Pemberitahuan Objek Pajak
          </p>
        </div>
        <Button onClick={() => router.push("/spop/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah SPOP
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>
            Filter data SPOP berdasarkan wilayah atau pencarian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SpopFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar SPOP</CardTitle>
        </CardHeader>
        <CardContent>
          <SpopDataTable filters={filters} />
        </CardContent>
      </Card>
    </div>
  );
}
