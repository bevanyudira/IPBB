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
  useOpGetObjectInfo,
} from "@/services/api/endpoints/op/op";
import { clientFetcher } from "@/lib/orval/mutator";
import type { ObjectInfoResponse } from "@/services/api/models/objectInfoResponse";
import {
  Building,
  Calendar,
  User,
  AlertCircle,
  ArrowLeft,
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
  STATUS_PEMBAYARAN_SPPT?: number | boolean | null;
  total_dibayar?: number | null;
  total_denda?: number | null;
  tanggal_pembayaran?: string | null;
  loading?: boolean;
  error?: boolean;
}

// Manual API function for complete SPPT data with payments (optimized single query)
async function getCompleteSpptData(nop: string): Promise<YearSummaryData[] | null> {
  try {
    return await clientFetcher({
      url: `/op/sppt/batch/${nop}/complete`,
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching complete SPPT data:', error);
    return null;
  }
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const sidebarUser = useSidebarUser();
  const nop = params.nop as string;

  const [yearSummaries, setYearSummaries] = useState<YearSummaryData[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'summary' | 'detail' | null>(null);
  const [selectedYearData, setSelectedYearData] = useState<YearSummaryData | null>(
    null
  );

  // Fetch comprehensive object info
  const { data: objectInfo, isLoading: objectInfoLoading, error: objectInfoError } = useOpGetObjectInfo(nop, {
    swr: {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
    }
  });

  // Load complete SPPT data with payments in ONE optimized query
  useEffect(() => {
    const loadCompleteData = async () => {
      setYearsLoading(true);

      // Fetch ALL data (SPPT + payments) in a single optimized query
      const completeData = await getCompleteSpptData(nop);

      if (completeData) {
        // Data already includes payment information from the backend
        const formattedData: YearSummaryData[] = completeData.map((spptData) => ({
          ...spptData,
          count: 1,
          loading: false,
          error: false,
        }));
        setYearSummaries(formattedData);
      }

      setYearsLoading(false);
    };

    loadCompleteData();
  }, [nop]);


  // Handle back to object selection
  const handleBackToObjects = () => {
    router.push("/objek-pajak/sppt");
  };

  // Handle print summary (Cetak button)
  const handlePrint = () => {
    setPrintMode('summary');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  // Handle print SPPT for specific year (Cetak SPPT button)
  const handlePrintSppt = (year: string) => {
    const yearData = yearSummaries.find(y => y.THN_PAJAK_SPPT === year);
    if (yearData && !yearData.loading && !yearData.error) {
      setSelectedYearData(yearData);
      setPrintMode('detail');
      setTimeout(() => {
        window.print();
        setPrintMode(null);
        setSelectedYearData(null);
      }, 100);
    }
  };

  // Calculate Denda (penalty) based on MySQL function logic
  const calculateDenda = (pbbAmount: number | null, dueDate: string | null, objectInfo: ObjectInfoResponse | null | undefined) => {
    if (!pbbAmount || !dueDate) return 0;

    const due = new Date(dueDate);
    const now = new Date();

    // Calculate month difference using PERIOD_DIFF logic
    const dueDateYear = due.getFullYear();
    const dueDateMonth = due.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const selisihBulan = (currentYear * 100 + currentMonth) - (dueDateYear * 100 + dueDateMonth);
    const monthsDiff = Math.floor(selisihBulan / 100) * 12 + (selisihBulan % 100);

    // Determine max months based on region and year
    let bulanMax = 24; // default
    const kdPropinsi = objectInfo?.KD_PROPINSI || '';
    const kdDati2 = objectInfo?.KD_DATI2 || '';
    const regionCode = kdPropinsi + kdDati2;

    if (regionCode === '2101' && dueDateYear >= 2012) {
      bulanMax = 15;
    }

    // Determine penalty rate based on DATEDIFF - only if past due date
    let dendaRate = 0;
    const daysDiff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) {
      if (regionCode === '5102' && dueDateYear >= 2024) {
        dendaRate = 0.01; // 1%
      } else {
        dendaRate = 0.02; // 2%
      }
    }

    // Calculate effective months (capped at max)
    const bulanDenda = monthsDiff > bulanMax ? bulanMax : (monthsDiff > 0 ? monthsDiff : 0);

    // Calculate denda: (denda * bulan_denda) * pbb
    const calculatedDenda = (dendaRate * bulanDenda) * pbbAmount;

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
          /* Force light mode and white background everywhere */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            background-color: white !important;
            background-image: none !important;
          }

          html, body {
            background: white !important;
            background-color: white !important;
            color: black !important;
            font-family: 'Times New Roman', serif !important;
            font-size: 11pt !important;
            line-height: 1.3 !important;
          }

          /* Hide sidebar and navigation */
          [data-sidebar],
          header,
          button,
          .print\\:hidden {
            display: none !important;
          }

          /* Full width for print */
          [data-sidebar-inset] {
            margin: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          /* Show only print content */
          .screen-only {
            display: none !important;
          }

          .print-only {
            display: block !important;
            background: white !important;
          }

          /* Page setup */
          @page {
            margin: 0.5in !important;
            size: A4 !important;
            background: white !important;
          }

          /* Print layout */
          .print-layout {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Table styling */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            border: 1px solid #000 !important;
            margin: 10pt 0 !important;
            background: white !important;
          }

          th, td {
            border: 1px solid #000 !important;
            padding: 4pt 6pt !important;
            text-align: left !important;
            background: white !important;
            background-color: white !important;
            color: black !important;
            font-size: 9pt !important;
          }

          th {
            font-weight: bold !important;
            background: white !important;
            background-color: white !important;
          }

          tr {
            page-break-inside: avoid !important;
            background: white !important;
          }

          /* Typography - force black text */
          h1, h2, h3, h4, h5, h6, p, span, div, td, th {
            color: black !important;
            background: transparent !important;
            background-color: transparent !important;
          }

          h1 { font-size: 16pt !important; margin: 8pt 0 !important; }
          h2 { font-size: 14pt !important; margin: 6pt 0 !important; }
          h3 { font-size: 12pt !important; margin: 4pt 0 !important; }

          .print-title {
            text-align: center !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 8pt !important;
            margin-bottom: 12pt !important;
            background: white !important;
          }

          .print-info-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6pt !important;
            margin: 10pt 0 !important;
            border: 1px solid #000 !important;
            padding: 8pt !important;
            background: white !important;
          }

          .print-info-row {
            display: flex !important;
            justify-content: space-between !important;
            padding: 2pt 0 !important;
            font-size: 10pt !important;
            background: transparent !important;
          }

          .print-info-label {
            font-weight: bold !important;
            width: 40% !important;
            color: black !important;
          }

          .print-info-value {
            width: 60% !important;
            text-align: right !important;
            color: black !important;
          }

          /* Force remove any dark mode or colored backgrounds */
          div, section, article, main {
            background: white !important;
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Print-only content for summary mode */}
      {printMode === 'summary' && (
        <div className="print-only hidden">
          <div className="print-layout">
            <div className="print-title">
              <h1>REKAPITULASI SURAT PEMBERITAHUAN PAJAK TERHUTANG</h1>
              <h2>PAJAK BUMI DAN BANGUNAN</h2>
              <p style={{ margin: '6pt 0' }}>NOP: {formatNop(nop)}</p>
              <p style={{ fontSize: '9pt', margin: '4pt 0' }}>
                Dicetak pada: {new Date().toLocaleString('id-ID')}
              </p>
            </div>

            {objectInfo && (
              <div className="print-info-grid">
                <div className="print-info-row">
                  <span className="print-info-label">Nama WP:</span>
                  <span className="print-info-value">{objectInfo.nama_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Telp WP:</span>
                  <span className="print-info-value">{objectInfo.telpon_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Alamat WP:</span>
                  <span className="print-info-value">{objectInfo.alamat_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Alamat OP:</span>
                  <span className="print-info-value">{objectInfo.alamat_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Kecamatan:</span>
                  <span className="print-info-value">{objectInfo.kecamatan_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Kelurahan:</span>
                  <span className="print-info-value">{objectInfo.kelurahan_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Luas Bumi:</span>
                  <span className="print-info-value">{objectInfo.luas_bumi ? `${objectInfo.luas_bumi.toLocaleString()} m²` : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">NJOP Bumi:</span>
                  <span className="print-info-value">{objectInfo.njop_bumi ? formatCurrency(objectInfo.njop_bumi) : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Luas Bangunan:</span>
                  <span className="print-info-value">{objectInfo.luas_bangunan ? `${objectInfo.luas_bangunan.toLocaleString()} m²` : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">NJOP Bangunan:</span>
                  <span className="print-info-value">{objectInfo.njop_bangunan ? formatCurrency(objectInfo.njop_bangunan) : '-'}</span>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: '12pt' }}>Daftar Tahun Pajak</h3>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>Tahun</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>PBB Terhutang</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Denda</th>
                  <th style={{ width: '15%' }}>Jatuh Tempo</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Dibayar</th>
                  <th style={{ width: '10%' }}>Tgl Bayar</th>
                </tr>
              </thead>
              <tbody>
                {yearSummaries
                  .filter(y => !y.loading && !y.error)
                  .sort((a, b) => parseInt(b.THN_PAJAK_SPPT) - parseInt(a.THN_PAJAK_SPPT))
                  .map((yearData) => {
                    const isPaid = Boolean(yearData.STATUS_PEMBAYARAN_SPPT);
                    const denda = isPaid
                      ? (yearData.total_denda || 0)
                      : calculateDenda(yearData.PBB_YG_HARUS_DIBAYAR_SPPT ?? null, yearData.TGL_JATUH_TEMPO_SPPT ?? null, objectInfo);
                    return (
                      <tr key={yearData.THN_PAJAK_SPPT}>
                        <td>{yearData.THN_PAJAK_SPPT}</td>
                        <td style={{ textAlign: 'center' }}>{isPaid ? 'LUNAS' : 'BELUM LUNAS'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearData.PBB_YG_HARUS_DIBAYAR_SPPT)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(denda)}</td>
                        <td>{formatDate(yearData.TGL_JATUH_TEMPO_SPPT) || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearData.total_dibayar)}</td>
                        <td>{yearData.tanggal_pembayaran ? formatDate(yearData.tanggal_pembayaran.split(',')[0]) : '-'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Summary totals */}
            {(() => {
              const totalLunas = yearSummaries.reduce((sum, y) => {
                if (y.loading || y.error) return sum;
                return y.STATUS_PEMBAYARAN_SPPT ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0) : sum;
              }, 0);

              const totalTunggakan = yearSummaries.reduce((sum, y) => {
                if (y.loading || y.error) return sum;
                return !y.STATUS_PEMBAYARAN_SPPT ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0) : sum;
              }, 0);

              const totalDenda = yearSummaries.reduce((sum, y) => {
                if (y.loading || y.error) return sum;
                return sum + (y.total_denda || 0);
              }, 0);

              return (
                <div style={{ marginTop: '12pt', border: '2px solid #000', padding: '8pt' }}>
                  <table style={{ border: 'none' }}>
                    <tbody>
                      <tr>
                        <td style={{ border: 'none', fontWeight: 'bold' }}>Total Lunas:</td>
                        <td style={{ border: 'none', textAlign: 'right' }}>{formatCurrency(totalLunas)}</td>
                        <td style={{ border: 'none', fontWeight: 'bold' }}>Total Tunggakan:</td>
                        <td style={{ border: 'none', textAlign: 'right' }}>{formatCurrency(totalTunggakan)}</td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none', fontWeight: 'bold' }}>Total Denda:</td>
                        <td style={{ border: 'none', textAlign: 'right' }}>{formatCurrency(totalDenda)}</td>
                        <td style={{ border: 'none', fontWeight: 'bold' }}>Total Tagihan:</td>
                        <td style={{ border: 'none', textAlign: 'right' }}>{formatCurrency(totalTunggakan + totalDenda)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Print-only content for detail mode */}
      {printMode === 'detail' && selectedYearData && (
        <div className="print-only hidden">
          <div className="print-layout">
            <div className="print-title">
              <h1>SURAT PEMBERITAHUAN PAJAK TERHUTANG</h1>
              <h2>PAJAK BUMI DAN BANGUNAN</h2>
              <h2>TAHUN {selectedYearData.THN_PAJAK_SPPT}</h2>
              <p style={{ margin: '6pt 0' }}>NOP: {formatNop(nop)}</p>
              <p style={{ fontSize: '9pt', margin: '4pt 0' }}>
                Dicetak pada: {new Date().toLocaleString('id-ID')}
              </p>
            </div>

            {objectInfo && (
              <div className="print-info-grid">
                <div className="print-info-row">
                  <span className="print-info-label">Nama WP:</span>
                  <span className="print-info-value">{objectInfo.nama_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Telp WP:</span>
                  <span className="print-info-value">{objectInfo.telpon_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Alamat WP:</span>
                  <span className="print-info-value">{objectInfo.alamat_wajib_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Alamat OP:</span>
                  <span className="print-info-value">{objectInfo.alamat_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Kecamatan:</span>
                  <span className="print-info-value">{objectInfo.kecamatan_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Kelurahan:</span>
                  <span className="print-info-value">{objectInfo.kelurahan_objek_pajak || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Luas Bumi:</span>
                  <span className="print-info-value">{objectInfo.luas_bumi ? `${objectInfo.luas_bumi.toLocaleString()} m²` : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">NJOP Bumi:</span>
                  <span className="print-info-value">{objectInfo.njop_bumi ? formatCurrency(objectInfo.njop_bumi) : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Luas Bangunan:</span>
                  <span className="print-info-value">{objectInfo.luas_bangunan ? `${objectInfo.luas_bangunan.toLocaleString()} m²` : '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">NJOP Bangunan:</span>
                  <span className="print-info-value">{objectInfo.njop_bangunan ? formatCurrency(objectInfo.njop_bangunan) : '-'}</span>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: '12pt' }}>Detail SPPT Tahun {selectedYearData.THN_PAJAK_SPPT}</h3>
            <table>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', width: '40%' }}>Tahun Pajak</td>
                  <td style={{ width: '60%' }}>{selectedYearData.THN_PAJAK_SPPT}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Status Pembayaran</td>
                  <td>{selectedYearData.STATUS_PEMBAYARAN_SPPT ? 'LUNAS' : 'BELUM LUNAS'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>PBB Yang Harus Dibayar</td>
                  <td>{formatCurrency(selectedYearData.PBB_YG_HARUS_DIBAYAR_SPPT)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Denda</td>
                  <td>{formatCurrency(selectedYearData.total_denda || 0)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Total Tagihan</td>
                  <td style={{ fontWeight: 'bold', fontSize: '11pt' }}>
                    {formatCurrency(
                      calculateTagihan(
                        selectedYearData.PBB_YG_HARUS_DIBAYAR_SPPT || null,
                        selectedYearData.total_denda || 0
                      )
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Jatuh Tempo</td>
                  <td>{formatDate(selectedYearData.TGL_JATUH_TEMPO_SPPT) || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Jumlah Dibayar</td>
                  <td>{formatCurrency(selectedYearData.total_dibayar)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Tanggal Pembayaran</td>
                  <td>
                    {selectedYearData.tanggal_pembayaran
                      ? selectedYearData.tanggal_pembayaran.split(',').map(d => formatDate(d.trim())).join(', ')
                      : '-'
                    }
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '20pt', borderTop: '1px solid #000', paddingTop: '8pt', fontSize: '9pt', textAlign: 'justify' }}>
              <p><strong>Catatan:</strong></p>
              <p>1. SPPT ini berlaku untuk tahun pajak yang tertera di atas.</p>
              <p>2. Pembayaran dilakukan paling lambat pada tanggal jatuh tempo.</p>
              <p>3. Keterlambatan pembayaran akan dikenakan denda sesuai peraturan yang berlaku.</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 screen-only">
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
                                              Boolean(yearData.STATUS_PEMBAYARAN_SPPT)
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
                                        ) : (() => {
                                          const isPaid = Boolean(yearData.STATUS_PEMBAYARAN_SPPT);
                                          const denda = isPaid
                                            ? (yearData.total_denda || 0)
                                            : calculateDenda(yearData.PBB_YG_HARUS_DIBAYAR_SPPT ?? null, yearData.TGL_JATUH_TEMPO_SPPT ?? null, objectInfo);
                                          return (
                                            <span className={`font-medium ${denda > 0 ? 'text-red-600' : ''}`}>
                                              {formatCurrency(denda)}
                                            </span>
                                          );
                                        })()}
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
                                        <Button onClick={() => handlePrintSppt(yearData.THN_PAJAK_SPPT)} className="print:hidden">
                                          <Printer className="h-4 w-4" />
                                          Cetak SPPT
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
                              return sum + (y.total_denda || 0);
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
