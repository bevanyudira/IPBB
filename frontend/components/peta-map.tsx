"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";

interface PetaMapProps {
  nop: string;
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    nop: string;
    luas: number;
    kd_propinsi: string;
    kd_dati2: string;
    kd_kecamatan: string;
    kd_kelurahan: string;
    kd_blok: string;
    no_urut: string;
    kd_jns_op: string;
  };
}

// Dynamic import komponen map untuk menghindari SSR
const MapView = dynamic(() => import("./peta-map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function PetaMap({ nop }: PetaMapProps) {
  const [geojson, setGeojson] = useState<GeoJSONFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeojson = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) {
          setError("Token tidak ditemukan");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/peta/nop/${nop}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Polygon tidak ditemukan untuk NOP ini");
          } else {
            setError("Gagal memuat data polygon");
          }
          setGeojson(null);
          return;
        }

        const data = await response.json();
        setGeojson(data);
      } catch (err) {
        console.error("Error fetching geojson:", err);
        setError("Terjadi kesalahan saat memuat data");
        setGeojson(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (nop) {
      fetchGeojson();
    }
  }, [nop]);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    );
  }

  if (error || !geojson) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">{error || "Tidak ada data untuk ditampilkan"}</p>
        </div>
      </div>
    );
  }

  return <MapView geojson={geojson} />;
}
