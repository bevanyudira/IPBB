"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface SpopFiltersProps {
  filters: {
    kd_propinsi?: string;
    kd_dati2?: string;
    kd_kecamatan?: string;
    kd_kelurahan?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SpopFilters({ filters, onFiltersChange }: SpopFiltersProps) {
  const [propinsiList, setPropinsiList] = useState<any[]>([]);
  const [dati2List, setDati2List] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kelurahanList, setKelurahanList] = useState<any[]>([]);
  
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadProvinsi();
  }, []);

  useEffect(() => {
    if (localFilters.kd_propinsi) {
      loadDati2(localFilters.kd_propinsi);
    } else {
      setDati2List([]);
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [localFilters.kd_propinsi]);

  useEffect(() => {
    if (localFilters.kd_propinsi && localFilters.kd_dati2) {
      loadKecamatan(localFilters.kd_propinsi, localFilters.kd_dati2);
    } else {
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [localFilters.kd_propinsi, localFilters.kd_dati2]);

  useEffect(() => {
    if (localFilters.kd_propinsi && localFilters.kd_dati2 && localFilters.kd_kecamatan) {
      loadKelurahan(localFilters.kd_propinsi, localFilters.kd_dati2, localFilters.kd_kecamatan);
    } else {
      setKelurahanList([]);
    }
  }, [localFilters.kd_propinsi, localFilters.kd_dati2, localFilters.kd_kecamatan]);

  const loadProvinsi = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/propinsi`
      );
      if (response.ok) {
        const data = await response.json();
        setPropinsiList(data);
      }
    } catch (error) {
      console.error("Failed to load provinsi:", error);
    }
  };

  const loadDati2 = async (kdProvinsi: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/dati2/${kdProvinsi}`
      );
      if (response.ok) {
        const data = await response.json();
        setDati2List(data);
      }
    } catch (error) {
      console.error("Failed to load dati2:", error);
    }
  };

  const loadKecamatan = async (kdProvinsi: string, kdDati2: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kecamatan/${kdProvinsi}/${kdDati2}`
      );
      if (response.ok) {
        const data = await response.json();
        setKecamatanList(data);
      }
    } catch (error) {
      console.error("Failed to load kecamatan:", error);
    }
  };

  const loadKelurahan = async (
    kdProvinsi: string,
    kdDati2: string,
    kdKecamatan: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kelurahan/${kdProvinsi}/${kdDati2}/${kdKecamatan}`
      );
      if (response.ok) {
        const data = await response.json();
        setKelurahanList(data);
      }
    } catch (error) {
      console.error("Failed to load kelurahan:", error);
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      kd_propinsi: undefined,
      kd_dati2: undefined,
      kd_kecamatan: undefined,
      kd_kelurahan: undefined,
      search: undefined,
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Provinsi */}
        <div className="space-y-2">
          <Label>Provinsi</Label>
          <Select
            value={localFilters.kd_propinsi}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, kd_propinsi: value, kd_dati2: undefined, kd_kecamatan: undefined, kd_kelurahan: undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Provinsi" />
            </SelectTrigger>
            <SelectContent>
              {propinsiList.map((item) => (
                <SelectItem key={item.KD_PROPINSI} value={item.KD_PROPINSI}>
                  {item.NM_PROPINSI}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kabupaten/Kota */}
        <div className="space-y-2">
          <Label>Kabupaten/Kota</Label>
          <Select
            value={localFilters.kd_dati2}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, kd_dati2: value, kd_kecamatan: undefined, kd_kelurahan: undefined })
            }
            disabled={!localFilters.kd_propinsi}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              {dati2List.map((item) => (
                <SelectItem key={item.KD_DATI2} value={item.KD_DATI2}>
                  {item.NM_DATI2}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kecamatan */}
        <div className="space-y-2">
          <Label>Kecamatan</Label>
          <Select
            value={localFilters.kd_kecamatan}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, kd_kecamatan: value, kd_kelurahan: undefined })
            }
            disabled={!localFilters.kd_dati2}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              {kecamatanList.map((item) => (
                <SelectItem key={item.KD_KECAMATAN} value={item.KD_KECAMATAN}>
                  {item.NM_KECAMATAN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kelurahan */}
        <div className="space-y-2">
          <Label>Kelurahan</Label>
          <Select
            value={localFilters.kd_kelurahan}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, kd_kelurahan: value })
            }
            disabled={!localFilters.kd_kecamatan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Kelurahan" />
            </SelectTrigger>
            <SelectContent>
              {kelurahanList.map((item) => (
                <SelectItem key={item.KD_KELURAHAN} value={item.KD_KELURAHAN}>
                  {item.NM_KELURAHAN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2 md:col-span-2">
          <Label>Pencarian</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Cari berdasarkan alamat, subjek pajak, atau nomor formulir..."
              value={localFilters.search || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, search: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>
          <Search className="mr-2 h-4 w-4" />
          Terapkan Filter
        </Button>
        <Button variant="outline" onClick={handleResetFilters}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
