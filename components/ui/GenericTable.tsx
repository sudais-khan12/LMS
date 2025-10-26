/**
 * Generic Table component for displaying tabular data
 * Provides a reusable table interface with sorting and actions
 */

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

export interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (field: keyof T, direction: "asc" | "desc") => void;
  sortField?: keyof T;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

const getSortIcon = (
  field: string | number | symbol,
  sortField: string | number | symbol | undefined,
  direction: "asc" | "desc" | undefined
) => {
  if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
  return direction === "asc" ? (
    <ArrowUp className="h-4 w-4" />
  ) : (
    <ArrowDown className="h-4 w-4" />
  );
};

/**
 * Generic Table component
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: "name", label: "Name", sortable: true },
 *   { key: "email", label: "Email", sortable: true },
 * ];
 *
 * <GenericTable
 *   data={users}
 *   columns={columns}
 *   onSort={handleSort}
 *   sortField="name"
 *   sortDirection="asc"
 * />
 * ```
 */
export function GenericTable<T extends Record<string, unknown>>({
  data,
  columns,
  onSort,
  sortField,
  sortDirection,
  emptyMessage = "No data available",
  className,
  rowClassName,
  onRowClick,
}: GenericTableProps<T>) {
  const handleSort = (field: keyof T) => {
    if (!onSort) return;

    const currentDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    onSort(field, currentDirection);
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.sortable &&
                    "cursor-pointer hover:text-foreground transition-colors",
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable &&
                    getSortIcon(column.key, sortField, sortDirection)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <p className="text-muted-foreground">{emptyMessage}</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row)
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    className={column.className}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default GenericTable;
