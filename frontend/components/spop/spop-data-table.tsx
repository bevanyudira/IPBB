"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SpopDataTableProps {
  filters: {
    kd_propinsi?: string;
    kd_dati2?: string;
    kd_kecamatan?: string;
    kd_kelurahan?: string;
    search?: string;
  };
}

export function SpopDataTable({ filters }: SpopDataTableProps) {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        page_size: pagination.page_size.toString(),
      });

      if (filters.kd_propinsi) params.append("kd_propinsi", filters.kd_propinsi);
      if (filters.kd_dati2) params.append("kd_dati2", filters.kd_dati2);
      if (filters.kd_kecamatan) params.append("kd_kecamatan", filters.kd_kecamatan);
      if (filters.kd_kelurahan) params.append("kd_kelurahan", filters.kd_kelurahan);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spop/list?${params}`
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setPagination({
          ...pagination,
          total: result.total,
          total_pages: result.total_pages,
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    const nop = `${item.KD_PROPINSI}-${item.KD_DATI2}-${item.KD_KECAMATAN}-${item.KD_KELURAHAN}-${item.KD_BLOK}-${item.NO_URUT}-${item.KD_JNS_OP}`;
    router.push(`/spop/edit/${nop}`);
  };

  const handleView = (item: any) => {
    const nop = `${item.KD_PROPINSI}-${item.KD_DATI2}-${item.KD_KECAMATAN}-${item.KD_KELURAHAN}-${item.KD_BLOK}-${item.NO_URUT}-${item.KD_JNS_OP}`;
    router.push(`/spop/view/${nop}`);
  };

  const formatNOP = (item: any) => {
    return `${item.KD_PROPINSI}.${item.KD_DATI2}.${item.KD_KECAMATAN}.${item.KD_KELURAHAN}.${item.KD_BLOK}.${item.NO_URUT}.${item.KD_JNS_OP}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Tidak ada data SPOP ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOP</TableHead>
              <TableHead>Subjek Pajak ID</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Luas Tanah (m²)</TableHead>
              <TableHead>Status WP</TableHead>
              <TableHead>Tgl Pendataan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-xs">
                  {formatNOP(item)}
                </TableCell>
                <TableCell>{item.SUBJEK_PAJAK_ID}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {item.JALAN_OP}
                </TableCell>
                <TableCell className="text-right">
                  {item.LUAS_BUMI?.toLocaleString()}
                </TableCell>
                <TableCell>
                  {item.KD_STATUS_WP === "0"
                    ? "Pemilik"
                    : item.KD_STATUS_WP === "1"
                    ? "Penyewa"
                    : item.KD_STATUS_WP === "2"
                    ? "Pengelola"
                    : "Pemakai"}
                </TableCell>
                <TableCell>
                  {new Date(item.TGL_PENDATAAN_OP).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })
                }
                className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setPagination({ ...pagination, page })}
                    isActive={pagination.page === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {pagination.total_pages > 5 && <PaginationEllipsis />}
            
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.min(pagination.total_pages, pagination.page + 1),
                  })
                }
                className={
                  pagination.page === pagination.total_pages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Menampilkan {data.length} dari {pagination.total} data
      </div>
    </div>
  );
}
