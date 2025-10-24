import { useMemo } from "react";
import { PaginationState } from "@/types/student";

export function usePagination<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  paginatedItems: T[];
  pagination: PaginationState;
} {
  return useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    const pagination: PaginationState = {
      page,
      pageSize,
      totalPages,
      totalItems,
    };

    return {
      paginatedItems,
      pagination,
    };
  }, [items, page, pageSize]);
}
