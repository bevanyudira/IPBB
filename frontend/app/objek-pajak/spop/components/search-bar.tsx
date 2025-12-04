// components/search-bar.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch } from "@tabler/icons-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  placeholder?: string
  isLoading?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onKeyDown,
  placeholder = "Cari...",
  isLoading = false
}: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          aria-label="Search input"
        />
      </div>
      <Button onClick={onSearch} disabled={isLoading}>
        Cari
      </Button>
    </div>
  )
}