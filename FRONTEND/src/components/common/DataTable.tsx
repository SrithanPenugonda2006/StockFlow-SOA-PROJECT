import React from "react";
import { Pagination } from "./Pagination";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isZeroBased?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationConfig;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found",
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#D4D4D4] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Loading data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs p-12 text-center text-gray-500">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-900">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50/80 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-5 py-4 ${col.className || ""}`}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? (row[col.accessorKey] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <Pagination
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize ?? 5}
            onPageChange={pagination.onPageChange}
            isZeroBased={pagination.isZeroBased}
          />
        </div>
      )}
    </div>
  );
}
