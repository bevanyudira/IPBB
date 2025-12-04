"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { UseFormReturn } from "react-hook-form";
import { SpopFormData } from "@/types/spop-types";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Dynamic import untuk Leaflet
const MapComponent = dynamic(() => import("@/components/peta-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

interface PetaSectionProps {
  form: UseFormReturn<SpopFormData>;
}

export function PetaSection({ form }: PetaSectionProps) {
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapNop, setMapNop] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate NOP dari form data
  const generateNopFromForm = useCallback(() => {
    try {
      const values = form.getValues();
      const { 
        KD_PROPINSI = '', 
        KD_DATI2 = '', 
        KD_KECAMATAN = '', 
        KD_KELURAHAN = '', 
        KD_BLOK = '', 
        NO_URUT = '', 
        KD_JNS_OP = '' 
      } = values;
      
      const nop = `${KD_PROPINSI}${KD_DATI2}${KD_KECAMATAN}${KD_KELURAHAN}${KD_BLOK}${NO_URUT}${KD_JNS_OP}`;
      
      // Validasi NOP lengkap (18 digit)
      if (nop.length === 18) {
        setMapNop(nop);
        setIsMapLoading(true);
        
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Trigger map refresh
        timeoutRef.current = setTimeout(() => {
          setIsMapLoading(false);
          timeoutRef.current = null;
        }, 100);
      } else {
        setMapNop("");
      }
    } catch (error) {
      console.error("Error generating NOP:", error);
      setMapNop("");
    }
  }, [form]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Auto-generate NOP ketika primary keys berubah
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Cek jika primary keys yang berubah
      const primaryKeys = [
        'KD_PROPINSI', 
        'KD_DATI2', 
        'KD_KECAMATAN', 
        'KD_KELURAHAN', 
        'KD_BLOK', 
        'NO_URUT', 
        'KD_JNS_OP'
      ];
      
      if (name && primaryKeys.includes(name)) {
        // Debounce untuk menghindari terlalu banyak render
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          generateNopFromForm();
        }, 500);
      }
    });
    
    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [form, generateNopFromForm]);

  // Generate NOP saat pertama kali load
  useEffect(() => {
    generateNopFromForm();
  }, [generateNopFromForm]);

//   const handleManualSearch = () => {
//     generateNopFromForm();
//   };

//   const displayNop = mapNop || "";
  const isNopValid = mapNop.length === 18;

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Denah Objek Pajak</h3>
        {/* <p className="text-sm text-muted-foreground">
          Tampilkan lokasi objek pajak berdasarkan data NOP
        </p> */}
      </div>
      
      <div className="space-y-4">
        {/* NOP Display */}
        {/* <div className="grid gap-2">
          <Label>NOP untuk Peta</Label>
          <div className="flex gap-2">
            <Input
              value={displayNop}
              readOnly
              className="font-mono"
              placeholder="NOP akan otomatis tergenerate"
            />
            <Button 
              onClick={handleManualSearch} 
              variant="outline"
              disabled={isMapLoading || !isNopValid}
            >
              <Search className="h-4 w-4 mr-2" />
              {isMapLoading ? "Memuat..." : "Refresh Peta"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            NOP dihasilkan otomatis dari: KD_PROPINSI + KD_DATI2 + KD_KECAMATAN + KD_KELURAHAN + KD_BLOK + NO_URUT + KD_JNS_OP
          </p>
        </div> */}

        {/* Map Container */}
        <div className="border rounded-lg overflow-hidden">
          {isNopValid ? (
            <div className="relative">
              {isMapLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <MapComponent nop={mapNop} />
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-muted">
              <p className="text-muted-foreground mb-2">
                Lengkapi data primary keys untuk menampilkan peta
              </p>
              <p className="text-sm text-muted-foreground">
                Pastikan semua field kunci telah diisi (total 18 digit)
              </p>
            </div>
          )}
        </div>

        {/* Legend/Info */}
        {/* <div className="text-sm text-muted-foreground space-y-1">
          <p>• Peta akan menampilkan polygon lokasi objek pajak</p>
          <p>• Pastikan koordinat telah terdaftar di sistem</p>
          <p>• Polygon berwarna hijau menunjukkan lokasi aktif</p>
        </div> */}
      </div>
    </div>
  );
}