"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { useSidebarUser } from "../../../hooks/use-sidebar-user";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useOpGetSpptYears,
  useOpGetObjectInfo,
  opGetSpptDetail,
} from "@/services/api/endpoints/op/op";
import { clientFetcher } from "@/lib/orval/mutator";
import type { SpptYearResponse } from "@/services/api/models/spptYearResponse";
import {
  MapPin,
  Building,
  Calendar,
  User,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Printer,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getPaymentStatus,
} from "../utils/formatters";

// Interface for year summary data including SPPT details
interface YearSummaryData {
  THN_PAJAK_SPPT: string;
  count: number;
  NM_WP_SPPT?: string | null;
  TGL_JATUH_TEMPO_SPPT?: string | null;
  LUAS_BUMI_SPPT?: number | null;
  LUAS_BNG_SPPT?: number | null;
  NJOP_BUMI_SPPT?: number | null;
  NJOP_BNG_SPPT?: number | null;
  PBB_YG_HARUS_DIBAYAR_SPPT?: number | null;
  STATUS_PEMBAYARAN_SPPT?: boolean | null;
  total_dibayar?: number | null;
  tanggal_pembayaran?: string | null;
  loading?: boolean;
  error?: boolean;
}

// Manual API function for payment data
async function getPaymentDetail(year: string, nop: string) {
  try {
    return await clientFetcher({
      url: `/op/sppt/${year}/${nop}/payment`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return null;
  }
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const sidebarUser = useSidebarUser();
  const nop = params.nop as string;

  const [yearSummaries, setYearSummaries] = useState<YearSummaryData[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);

  // Fetch available years for selected NOP
  const { trigger: fetchYears } = useOpGetSpptYears();

  // Fetch comprehensive object info
  const { data: objectInfo, isLoading: objectInfoLoading, error: objectInfoError } = useOpGetObjectInfo(nop, {
    swr: {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
    }
  });

  // Load years first, then batch load details efficiently
  useEffect(() => {
    const loadYearsData = async () => {
      if (!nop) return;

      setYearsLoading(true);
      try {
        // Get available years first
        const res = await fetchYears({ nop });
        const availableYears = res.available_years || [];

        // Set basic year data immediately - shows UI fast
        const basicYearSummaries: YearSummaryData[] = availableYears.map(
          (year) => ({
            ...year,
            loading: true,
            error: false,
          })
        );
        setYearSummaries(basicYearSummaries);
        setYearsLoading(false);

        // Load details in parallel batches (5 at a time to avoid overwhelming)
        const batchSize = 5;
        for (let i = 0; i < availableYears.length; i += batchSize) {
          const batch = availableYears.slice(i, i + batchSize);

          // Process batch in parallel
          await Promise.allSettled(
            batch.map(async (year, batchIndex) => {
              const actualIndex = i + batchIndex;
              try {
                const data = await opGetSpptDetail(year.THN_PAJAK_SPPT, nop);
                const paymentData = await getPaymentDetail(year.THN_PAJAK_SPPT, nop);

                setYearSummaries(prev =>
                  prev.map((item, idx) =>
                    idx === actualIndex ? {
                      ...item,
                      NM_WP_SPPT: data.NM_WP_SPPT,
                      TGL_JATUH_TEMPO_SPPT: data.TGL_JATUH_TEMPO_SPPT,
                      LUAS_BUMI_SPPT: data.LUAS_BUMI_SPPT,
                      LUAS_BNG_SPPT: data.LUAS_BNG_SPPT,
                      NJOP_BUMI_SPPT: data.NJOP_BUMI_SPPT,
                      NJOP_BNG_SPPT: data.NJOP_BNG_SPPT,
                      PBB_YG_HARUS_DIBAYAR_SPPT: data.PBB_YG_HARUS_DIBAYAR_SPPT,
                      STATUS_PEMBAYARAN_SPPT: data.STATUS_PEMBAYARAN_SPPT,
                      total_dibayar: paymentData?.total_dibayar || 0,
                      total_denda: paymentData?.total_denda || 0,
                      tanggal_pembayaran: paymentData?.tanggal_pembayaran || null,
                      loading: false,
                      error: false,
                    } : item
                  )
                );
              } catch (error) {
                setYearSummaries(prev =>
                  prev.map((item, idx) =>
                    idx === actualIndex ? { ...item, loading: false, error: true } : item
                  )
                );
              }
            })
          );
        }
      } catch (e) {
        setYearSummaries([]);
        setYearsLoading(false);
      }
    };

    loadYearsData();
  }, [nop, fetchYears]);

  // Handle year selection - navigate directly to print page
  const handleSelectYear = (year: string) => {
    router.push(`/sppt-print?year=${year}&nop=${nop}`);
  };

  // Handle back to object selection
  const handleBackToObjects = () => {
    router.push("/objek-pajak/sppt");
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Calculate Denda (penalty) based on MySQL function logic
  const calculateDenda = (pbbAmount: number | null, dueDate: string | null, isPaid: boolean | null, objectInfo: any) => {
    if (!pbbAmount || !dueDate || isPaid) return 0;

    const due = new Date(dueDate);
    const now = new Date();

    // Calculate month difference using PERIOD_DIFF logic
    const dueDateYear = due.getFullYear();
    const dueDateMonth = due.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const selisihBulan = (currentYear * 100 + currentMonth) - (dueDateYear * 100 + dueDateMonth);
    const monthsDiff = Math.floor(selisihBulan / 100) * 12 + (selisihBulan % 100);

    if (monthsDiff <= 0) return 0;

    // Determine max months based on region and year
    let bulanMax = 24; // default
    const kdPropinsi = objectInfo?.KD_PROPINSI || '';
    const kdDati2 = objectInfo?.KD_DATI2 || '';
    const regionCode = kdPropinsi + kdDati2;

    if (regionCode === '2101' && dueDateYear >= 2012) {
      bulanMax = 15;
    }

    // Determine penalty rate based on region and year
    let dendaRate = 0.02; // default 2%
    if (regionCode === '5102' && dueDateYear >= 2024) {
      dendaRate = 0.01; // 1%
    }

    // Calculate effective months (capped at max)
    const bulanDenda = Math.min(monthsDiff, bulanMax);

    // Calculate denda
    const calculatedDenda = dendaRate * bulanDenda * pbbAmount;

    // Return 0 if calculated denda is negative, otherwise return the calculated amount
    return calculatedDenda < 0 ? 0 : Math.floor(calculatedDenda);
  };

  // Calculate Tagihan (total bill) - PBB + Denda
  const calculateTagihan = (pbbAmount: number | null | undefined | undefined, denda: number) => {
    if (!pbbAmount) return denda;
    return pbbAmount + denda;
  };

  // Format NOP for display
  const formatNop = (nop: string) => {
    if (nop.length >= 18) {
      return `${nop.slice(0, 2)}.${nop.slice(2, 4)}.${nop.slice(
        4,
        7
      )}.${nop.slice(7, 10)}.${nop.slice(10, 13)}.${nop.slice(
        13,
        17
      )}.${nop.slice(17, 18)}`;
    }
    return nop;
  };

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', serif !important;
            font-size: 12pt !important;
            line-height: 1.4 !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Hide sidebar and other UI elements when printing */
          [data-sidebar] {
            display: none !important;
          }

          /* Ensure content takes full width when printing */
          [data-sidebar-inset] {
            margin-left: 0 !important;
            width: 100% !important;
          }

          /* Hide all UI elements */
          button, .no-print {
            display: none !important;
          }

          /* Reset all colors to black and white */
          .bg-primary\\/5, .bg-primary\\/10, .border-primary\\/20,
          .text-primary, .text-green-600, .text-red-600,
          .text-green-400, .text-red-400, .text-blue-400,
          .bg-green-100, .bg-red-100, .bg-blue-50 {
            background: white !important;
            color: black !important;
            border-color: black !important;
          }

          /* Card styling for print */
          .card, [class*="card"] {
            background: white !important;
            border: 1px solid black !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin-bottom: 12pt !important;
          }

          /* Table styling for print */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            border: 1px solid black !important;
            page-break-inside: auto !important;
          }

          th, td {
            border: 1px solid black !important;
            padding: 6pt !important;
            text-align: left !important;
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
          }

          th {
            font-weight: bold !important;
            background: white !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          /* Typography for print */
          h1, h2, h3, h4, h5, h6 {
            color: black !important;
            font-weight: bold !important;
            margin: 6pt 0 !important;
          }

          h1 { font-size: 18pt !important; }
          h2 { font-size: 16pt !important; }
          h3 { font-size: 14pt !important; }

          /* Remove all background colors and effects */
          * {
            background-color: white !important;
            background-image: none !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Badge styling for print */
          .badge, [class*="badge"] {
            background: white !important;
            color: black !important;
            border: 1px solid black !important;
            border-radius: 0 !important;
            padding: 2pt 4pt !important;
            font-size: 9pt !important;
          }

          /* Summary section styling */
          .summary-section {
            border: 2px solid black !important;
            padding: 8pt !important;
            margin: 12pt 0 !important;
            background: white !important;
          }

          /* Page setup */
          @page {
            margin: 0.75in !important;
            size: A4 !important;
          }

          /* Content container */
          .print-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={sidebarUser} variant="inset" />
        <SidebarInset>
        <SiteHeader title="SPPT - Pilih Tahun Pajak" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 print-container">
            {/* Print Title - Only visible when printing */}
            <div className="hidden print:block mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2">REKAPITULASI SURAT PEMBERITAHUAN PAJAK TERHUTANG</h1>
              <h2 className="text-xl font-semibold mb-2">PAJAK BUMI DAN BANGUNAN</h2>
              <div className="text-lg font-semibold mb-4">
                NOP: {formatNop(nop)}
              </div>
              <div className="text-sm mb-6 border-t border-b border-black py-2">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Breadcrumb/Property Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="font-medium">Objek Pajak:</span>
                </div>
                <div className="font-mono text-lg font-semibold text-primary">
                  {formatNop(nop)}
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Object Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Objek dan Wajib Pajak
                </CardTitle>
              </CardHeader>
              <CardContent>
                {objectInfoLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(11)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : objectInfoError ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Gagal memuat informasi objek pajak.
                    </AlertDescription>
                  </Alert>
                ) : objectInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Nomor Objek Pajak:</span>
                      <span className="font-mono text-right w-3/5">{objectInfo.nomor_objek_pajak}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Nama Wajib Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.nama_wajib_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Telpon Wajib Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.telpon_wajib_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Alamat Wajib Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.alamat_wajib_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Alamat Objek Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.alamat_objek_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Kecamatan Objek Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.kecamatan_objek_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Kelurahan Objek Pajak:</span>
                      <span className="text-right w-3/5">{objectInfo.kelurahan_objek_pajak || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Luas Bumi:</span>
                      <span className="text-right w-3/5">{objectInfo.luas_bumi ? `${objectInfo.luas_bumi.toLocaleString()} m²` : '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">NJOP Bumi:</span>
                      <span className="text-right w-3/5">{objectInfo.njop_bumi ? formatCurrency(objectInfo.njop_bumi) : '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">Luas Bangunan:</span>
                      <span className="text-right w-3/5">{objectInfo.luas_bangunan ? `${objectInfo.luas_bangunan.toLocaleString()} m²` : '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-sm w-2/5">NJOP Bangunan:</span>
                      <span className="text-right w-3/5">{objectInfo.njop_bangunan ? formatCurrency(objectInfo.njop_bangunan) : '-'}</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Year selection */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToObjects}
                      className="flex items-center gap-2 print:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-xl">Pilih Tahun Pajak</CardTitle>
                      <CardDescription>
                        Pilih tahun pajak SPPT yang ingin Anda lihat untuk objek
                        pajak dengan NOP{" "}
                        <span className="font-mono font-medium text-primary">
                          {formatNop(nop)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2 print:hidden"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {yearsLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <span className="text-sm text-gray-600">
                        Memuat data tahun pajak...
                      </span>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Tahun</TableHead>
                            <TableHead className="text-right">
                              PBB Terhutang
                            </TableHead>
                            <TableHead className="text-right">
                              Denda
                            </TableHead>
                            <TableHead>Jatuh Tempo</TableHead>
                            <TableHead className="text-right">
                              Dibayar
                            </TableHead>
                            <TableHead className="text-right">
                              Tgl Bayar
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3].map((i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Skeleton className="h-4 w-16" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-4 w-24 ml-auto" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-4 w-20 ml-auto" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-4 w-24 ml-auto" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-4 w-20 ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {yearSummaries.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm">
                          Tersedia {yearSummaries.length} tahun pajak untuk
                          objek ini. Klik baris untuk melihat detail:
                        </p>

                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="h-14">
                                <TableHead className="w-[100px]">
                                  Tahun
                                </TableHead>
                                <TableHead className="text-right w-[80px]">
                                  Status
                                </TableHead>
                                <TableHead className="text-right">
                                  PBB
                                </TableHead>
                                <TableHead className="text-right">
                                  Denda
                                </TableHead>
                                <TableHead>
                                  Jatuh Tempo
                                </TableHead>
                                <TableHead className="text-right">
                                  Dibayar
                                </TableHead>
                                <TableHead className="text-right">
                                  Tgl Bayar
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {yearSummaries
                                .sort(
                                  (a, b) =>
                                    parseInt(b.THN_PAJAK_SPPT) -
                                    parseInt(a.THN_PAJAK_SPPT)
                                )
                                .map((yearData) => (
                                  <TableRow
                                    key={yearData.THN_PAJAK_SPPT}
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {yearData.THN_PAJAK_SPPT}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-20 ml-auto" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : (
                                        (() => {
                                          const payment = getPaymentStatus(
                                            yearData.STATUS_PEMBAYARAN_SPPT
                                          );
                                          return (
                                            <Badge variant={payment.variant}>
                                              {payment.text}
                                            </Badge>
                                          );
                                        })()
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-24 ml-auto" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : (
                                        <span className="font-semibold">
                                          {formatCurrency(
                                            yearData.PBB_YG_HARUS_DIBAYAR_SPPT
                                          )}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-20 ml-auto" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : (
                                        (() => {
                                          // Only show denda if STATUS_PEMBAYARAN_SPPT is not 1 (unpaid)
                                          const isPaid = yearData.STATUS_PEMBAYARAN_SPPT === 1;
                                          const denda = isPaid ? 0 : calculateDenda(
                                            yearData.PBB_YG_HARUS_DIBAYAR_SPPT,
                                            yearData.TGL_JATUH_TEMPO_SPPT,
                                            isPaid,
                                            objectInfo
                                          );
                                          return (
                                            <span className={`font-medium ${denda > 0 ? 'text-red-600' : ''}`}>
                                              {formatCurrency(denda)}
                                            </span>
                                          );
                                        })()
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-24" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : (
                                        formatDate(
                                          yearData.TGL_JATUH_TEMPO_SPPT
                                        ) || "-"
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-24 ml-auto" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : (
                                        <span className="font-semibold text-green-600">
                                          {formatCurrency(yearData.total_dibayar)}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {yearData.loading ? (
                                        <Skeleton className="h-4 w-24 ml-auto" />
                                      ) : yearData.error ? (
                                        <span className="text-red-500 text-sm">
                                          -
                                        </span>
                                      ) : yearData.tanggal_pembayaran ? (
                                        <span className="text-sm">
                                          {yearData.tanggal_pembayaran.split(',').map((date, idx) => (
                                            <div key={idx}>{formatDate(date.trim())}</div>
                                          ))}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button>
                                        Cetak SPPT
                                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Summary totals: Lunas vs Tunggakan with Denda and Tagihan */}
                        {(() => {
                          const totalLunas = yearSummaries.reduce((sum, y) => {
                            if (y.loading || y.error) return sum;
                            return y.STATUS_PEMBAYARAN_SPPT
                              ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0)
                              : sum;
                          }, 0);

                          const totalTunggakan = yearSummaries.reduce((sum, y) => {
                            if (y.loading || y.error) return sum;
                            return !y.STATUS_PEMBAYARAN_SPPT
                              ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0)
                              : sum;
                          }, 0);

                          const totalDenda = yearSummaries.reduce((sum, y) => {
                            if (y.loading || y.error) return sum;
                            // Only calculate denda if STATUS_PEMBAYARAN_SPPT is not 1 (unpaid)
                            const isPaid = y.STATUS_PEMBAYARAN_SPPT === 1;
                            const denda = isPaid ? 0 : calculateDenda(
                              y.PBB_YG_HARUS_DIBAYAR_SPPT,
                              y.TGL_JATUH_TEMPO_SPPT,
                              isPaid,
                              objectInfo
                            );
                            return sum + denda;
                          }, 0);

                          const totalTagihan = yearSummaries.reduce((sum, y) => {
                            if (y.loading || y.error) return sum;
                            // Only calculate denda if STATUS_PEMBAYARAN_SPPT is not 1 (unpaid)
                            const isPaid = y.STATUS_PEMBAYARAN_SPPT === 1;
                            const denda = isPaid ? 0 : calculateDenda(
                              y.PBB_YG_HARUS_DIBAYAR_SPPT,
                              y.TGL_JATUH_TEMPO_SPPT,
                              isPaid,
                              objectInfo
                            );
                            const tagihan = calculateTagihan(y.PBB_YG_HARUS_DIBAYAR_SPPT, denda);
                            return sum + tagihan;
                          }, 0);

                          return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-primary/10 border-primary/20 rounded-lg summary-section">
                              <div className="text-center">
                                <span className="text-sm font-medium block">
                                  Total Lunas
                                </span>
                                <div className="text-lg font-semibold text-green-600">
                                  {formatCurrency(totalLunas)}
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium block">
                                  Total Tunggakan
                                </span>
                                <div className="text-lg font-semibold text-red-600">
                                  {formatCurrency(totalTunggakan)}
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium block">
                                  Total Denda
                                </span>
                                <div className="text-lg font-semibold text-orange-600">
                                  {formatCurrency(totalDenda)}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Tidak Ada Data SPPT</AlertTitle>
                        <AlertDescription>
                          Tidak ada tahun pajak SPPT ditemukan untuk objek pajak
                          ini. Data SPPT mungkin belum tersedia atau sedang
                          dalam proses.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </>
  );
}
