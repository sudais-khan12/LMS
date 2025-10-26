import { useMemo } from "react";
import { FilterState, SortState } from "@/types";

/**
 * Generic search and filter hook
 * @param items - Array of items to filter
 * @param filters - Filter state object
 * @param sortState - Sort state object
 * @param searchKeys - Array of keys to search in each item
 * @returns Filtered and sorted items
 *
 * @example
 * ```tsx
 * const filteredUsers = useGenericSearchFilter(
 *   users,
 *   { search: "john", status: "Active" },
 *   { field: "name", direction: "asc" },
 *   ["name", "email", "phone"]
 * );
 * ```
 */
export function useGenericSearchFilter<T extends Record<string, unknown>>(
  items: T[],
  filters: FilterState,
  sortState: SortState<T>,
  searchKeys: Array<keyof T> = ["name", "email"]
): T[] {
  return useMemo(() => {
    const filtered = items.filter((item) => {
      // Search filter - checks multiple keys
      const searchTerm = filters.search?.toLowerCase() || "";
      const matchesSearch =
        searchTerm === "" ||
        searchKeys.some((key) => {
          const value = item[key];
          return value
            ? String(value).toLowerCase().includes(searchTerm)
            : false;
        });

      // Status filter
      const matchesStatus =
        !filters.status ||
        filters.status === "All" ||
        item.status === filters.status;

      // Role filter (if applicable)
      const matchesRole =
        !filters.role || filters.role === "All" || item.role === filters.role;

      // Category filter (if applicable)
      const matchesCategory =
        !filters.category ||
        filters.category === "All" ||
        item.category === filters.category;

      return matchesSearch && matchesStatus && matchesRole && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortState.field];
      const bValue = b[sortState.field];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [items, filters, sortState, searchKeys]);
}
