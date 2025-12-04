// types/spop-api.ts
import { SpopFormData } from "./spop-types";

export type SpopListItem = SpopFormData

export interface SpopListResponse {
  data: SpopListItem[];
  total: number;
  total_pages: number;
  page: number;
  page_size: number;
}

export interface SpopStats {
  total: number;
  // Tambahkan stats lain jika ada
}