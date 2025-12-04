import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugInfoProps {
  nop: string | null
  isLoadingData: boolean
  spopData: any
}

export function DebugInfo({ nop, isLoadingData, spopData }: DebugInfoProps) {
  if (!nop) return null

  return (
    <Card className="bg-muted">
      <CardHeader>
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs space-y-1">
          <div>Loading: {isLoadingData ? "Yes" : "No"}</div>
          <div>Has spopData: {spopData ? "Yes" : "No"}</div>
          <div>Data Structure: {spopData ? Object.keys(spopData).join(", ") : "No data"}</div>
          {spopData && (
            <div className="mt-2 p-2 bg-background rounded">
              <div className="font-semibold mb-1">Sample Data:</div>
              <div>Nama WP: {spopData.NM_WP || "Empty"}</div>
              <div>Provinsi: {spopData.KD_PROPINSI || "Empty"}</div>
              <div>Luas Bumi: {spopData.LUAS_BUMI || "Empty"}</div>
              
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Raw Data</summary>
                <pre className="mt-1 text-xs overflow-auto max-h-40">
                  {JSON.stringify(spopData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}