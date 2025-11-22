"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, ShieldAlert } from "lucide-react";
import type { UserRead } from "@/services/api/models/userRead";

// Dynamic import untuk Leaflet (tidak support SSR)
const MapComponent = dynamic(() => import("@/components/peta-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

interface NopOption {
  nop: string;
}

export default function PetaPage() {
  const router = useRouter();
  const [nopList, setNopList] = useState<NopOption[]>([]);
  const [filteredNopList, setFilteredNopList] = useState<NopOption[]>([]);
  const [selectedNop, setSelectedNop] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarUser, setSidebarUser] = useState<UserRead | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch user data for sidebar and check admin access
  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Check if user is admin
          if (!userData.is_admin) {
            router.push("/dashboard");
            return;
          }
          
          setSidebarUser(userData);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    // Fetch list of NOPs
    const fetchNopList = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/peta/nop-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNopList(data);
          setFilteredNopList(data);
          if (data.length > 0) {
            setSelectedNop(data[0].nop);
          }
        }
      } catch (error) {
        console.error("Error fetching NOP list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNopList();
  }, []);

  // Filter NOP list based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNopList(nopList);
    } else {
      const filtered = nopList.filter((item) =>
        item.nop.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNopList(filtered);
    }
  }, [searchQuery, nopList]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Prevent sidebar flash during initial load
  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Peta Objek Pajak</h1>
            <p className="text-muted-foreground">
              Visualisasi geografis objek pajak berdasarkan Nomor Objek Pajak (NOP)
            </p>
          </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Objek Pajak</CardTitle>
          <CardDescription>Pilih NOP untuk menampilkan polygon pada peta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="search">Cari NOP</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Ketik NOP untuk mencari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={isLoading}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Ditemukan {filteredNopList.length} dari {nopList.length} NOP
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nop">Nomor Objek Pajak (NOP)</Label>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Memuat data...</span>
                </div>
              ) : (
                <Select value={selectedNop} onValueChange={setSelectedNop}>
                  <SelectTrigger id="nop">
                    <SelectValue placeholder="Pilih NOP" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredNopList.length > 0 ? (
                      filteredNopList.map((item) => (
                        <SelectItem key={item.nop} value={item.nop}>
                          {item.nop}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Tidak ada NOP yang cocok
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peta Lokasi</CardTitle>
          <CardDescription>
            {selectedNop ? `Polygon untuk NOP: ${selectedNop}` : "Pilih NOP untuk menampilkan polygon"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedNop ? (
            <MapComponent nop={selectedNop} />
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Pilih NOP untuk menampilkan peta</p>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
