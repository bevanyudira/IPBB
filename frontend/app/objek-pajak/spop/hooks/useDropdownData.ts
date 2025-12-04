/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";

// Interface untuk data response
interface WilayahData {
  kode: string;
  nama: string;
  [key: string]: any; // Untuk property lain yang mungkin ada
}

// Interface untuk hook return
interface UseDropdownDataReturn {
  propinsiList: WilayahData[];
  dati2List: WilayahData[];
  kecamatanList: WilayahData[];
  kelurahanList: WilayahData[];
  loadingProvinsi: boolean;
  loadingDati2: boolean;
  loadingKecamatan: boolean;
  loadingKelurahan: boolean;
  error: string | null;
  refetchProvinsi: () => Promise<void>;
}

// Interface untuk props
interface UseDropdownDataProps {
  watchProvinsi?: string;
  watchDati2?: string;
  watchKecamatan?: string;
}

export const useDropdownData = ({
  watchProvinsi,
  watchDati2,
  watchKecamatan
}: UseDropdownDataProps = {}): UseDropdownDataReturn => {
  // State untuk data
  const [propinsiList, setPropinsiList] = useState<WilayahData[]>([]);
  const [dati2List, setDati2List] = useState<WilayahData[]>([]);
  const [kecamatanList, setKecamatanList] = useState<WilayahData[]>([]);
  const [kelurahanList, setKelurahanList] = useState<WilayahData[]>([]);
  
  // State untuk loading
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingDati2, setLoadingDati2] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);
  
  // State untuk error handling
  const [error, setError] = useState<string | null>(null);
  
  // Refs untuk abort controllers
  const abortControllersRef = useRef<AbortController[]>([]);

  // Cleanup abort controllers
  const cleanupAbortControllers = useCallback(() => {
    abortControllersRef.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    abortControllersRef.current = [];
  }, []);

  // Get token from localStorage
  const getToken = useCallback((): string | null => {
    return localStorage.getItem("token") || localStorage.getItem("access_token");
  }, []);

  // Generic fetch function dengan abort controller
  const fetchData = useCallback(async <T>(
    url: string,
    setData: (data: T[]) => void,
    setLoading: (loading: boolean) => void
  ): Promise<void> => {
    // Cleanup previous requests
    cleanupAbortControllers();
    
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: T[] = await response.json();
      setData(data);
      
    } catch (err: any) {
      // Hanya handle error jika bukan abort error
      if (err.name !== 'AbortError') {
        console.error("Fetch error:", err);
        setError(`Gagal memuat data: ${err.message}`);
      }
    } finally {
      setLoading(false);
      
      // Remove controller dari list setelah selesai
      abortControllersRef.current = abortControllersRef.current.filter(
        c => c !== controller
      );
    }
  }, [getToken, cleanupAbortControllers]);

  // Load provinsi
  const loadProvinsi = useCallback(async (): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/propinsi`;
    await fetchData<WilayahData>(url, setPropinsiList, setLoadingProvinsi);
  }, [fetchData]);

  // Load dati2
  const loadDati2 = useCallback(async (kdProvinsi: string): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/dati2/${kdProvinsi}`;
    await fetchData<WilayahData>(url, setDati2List, setLoadingDati2);
  }, [fetchData]);

  // Load kecamatan
  const loadKecamatan = useCallback(async (
    kdProvinsi: string, 
    kdDati2: string
  ): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kecamatan/${kdProvinsi}/${kdDati2}`;
    await fetchData<WilayahData>(url, setKecamatanList, setLoadingKecamatan);
  }, [fetchData]);

  // Load kelurahan
  const loadKelurahan = useCallback(async (
    kdProvinsi: string, 
    kdDati2: string, 
    kdKecamatan: string
  ): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/reference/kelurahan/${kdProvinsi}/${kdDati2}/${kdKecamatan}`;
    await fetchData<WilayahData>(url, setKelurahanList, setLoadingKelurahan);
  }, [fetchData]);

  // Effect untuk load provinsi saat pertama kali
  useEffect(() => {
    loadProvinsi();
    
    // Cleanup pada unmount
    return () => {
      cleanupAbortControllers();
    };
  }, [loadProvinsi, cleanupAbortControllers]);

  // Effect untuk load dati2 ketika provinsi berubah
  useEffect(() => {
    if (watchProvinsi) {
      loadDati2(watchProvinsi);
    } else {
      // Reset data jika provinsi dihapus
      setDati2List([]);
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [watchProvinsi, loadDati2]);

  // Effect untuk load kecamatan ketika dati2 berubah
  useEffect(() => {
    if (watchProvinsi && watchDati2) {
      loadKecamatan(watchProvinsi, watchDati2);
    } else {
      // Reset data jika dati2 dihapus
      setKecamatanList([]);
      setKelurahanList([]);
    }
  }, [watchProvinsi, watchDati2, loadKecamatan]);

  // Effect untuk load kelurahan ketika kecamatan berubah
  useEffect(() => {
    if (watchProvinsi && watchDati2 && watchKecamatan) {
      loadKelurahan(watchProvinsi, watchDati2, watchKecamatan);
    } else {
      // Reset data jika kecamatan dihapus
      setKelurahanList([]);
    }
  }, [watchProvinsi, watchDati2, watchKecamatan, loadKelurahan]);

  // Function untuk manual refetch provinsi
  const refetchProvinsi = useCallback(async (): Promise<void> => {
    await loadProvinsi();
  }, [loadProvinsi]);

  return {
    propinsiList,
    dati2List,
    kecamatanList,
    kelurahanList,
    loadingProvinsi,
    loadingDati2,
    loadingKecamatan,
    loadingKelurahan,
    error,
    refetchProvinsi
  };
};