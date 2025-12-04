// components/pagination.tsx
import { Button } from "@/components/ui/button"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  perPage, 
  onPageChange 
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisiblePages; i++) pages.push(i)
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalItems)} dari {totalItems} data
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
        >
          <IconChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              aria-label={`Halaman ${pageNum}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
        >
          Selanjutnya
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}