// components/spop-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconEdit } from "@tabler/icons-react"
import type { SpopListItem } from "@/types/spop-api"

interface SpopCardProps {
  spop: SpopListItem
  nop: string
  formattedNOP: string
  transactionType: string
  onViewDetail: () => void
}

export function SpopCard({ 
  spop, 
  formattedNOP, 
  transactionType, 
  onViewDetail 
}: SpopCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg" aria-label={`Subjek Pajak ID: ${spop.SUBJEK_PAJAK_ID || '-'}`}>
              Subjek Pajak: {spop.SUBJEK_PAJAK_ID || "-"}
            </CardTitle>
            <CardDescription className="font-mono text-xs mt-1" aria-label={`NOP: ${formattedNOP}`}>
              NOP: {formattedNOP}
            </CardDescription>
          </div>
          <Badge variant="secondary" aria-label={`Jenis Transaksi: ${transactionType}`}>
            {transactionType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {spop.JALAN_OP && (
          <div className="text-sm">
            <span className="text-muted-foreground">Alamat: </span>
            <span>{spop.JALAN_OP}</span>
          </div>
        )}
        {spop.KELURAHAN_OP && (
          <div className="text-sm">
            <span className="text-muted-foreground">Kelurahan: </span>
            <span>{spop.KELURAHAN_OP}</span>
          </div>
        )}
        {spop.LUAS_BUMI && (
          <div className="text-sm">
            <span className="text-muted-foreground">Luas Tanah: </span>
            <span>{Number(spop.LUAS_BUMI).toLocaleString("id-ID")} m²</span>
          </div>
        )}
        {spop.TGL_PENDATAAN_OP && (
          <div className="text-sm">
            <span className="text-muted-foreground">Tgl Pendataan: </span>
            <span>{new Date(spop.TGL_PENDATAAN_OP).toLocaleDateString("id-ID")}</span>
          </div>
        )}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={onViewDetail}
            aria-label={`Lihat detail SPOP ${formattedNOP}`}
          >
            <IconEdit className="h-4 w-4" />
            Lihat Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}