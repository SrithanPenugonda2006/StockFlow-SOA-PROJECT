import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading data from backend...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-12 text-center text-slate-400">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-200">
          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-5 py-4 ${col.className || ''}`}>
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
    </div>
  );
}
