import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isZeroBased?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages: propTotalPages,
  totalItems: propTotalItems,
  totalElements,
  pageSize = 6,
  onPageChange,
  isZeroBased = false,
}) => {
  const totalItems = propTotalItems ?? totalElements ?? 0;
  if (!totalItems || totalItems <= pageSize) {
    return null;
  }

  const computedTotalPages = propTotalPages || Math.ceil(totalItems / pageSize);
  if (computedTotalPages <= 1) {
    return null;
  }

  const normalizedPage = isZeroBased ? currentPage + 1 : currentPage;
  const page1 = Math.max(1, Math.min(normalizedPage, computedTotalPages));

  const startItem = (page1 - 1) * pageSize + 1;
  const endItem = Math.min(page1 * pageSize, totalItems);

  const handlePageSelect = (targetPage1: number) => {
    if (targetPage1 < 1 || targetPage1 > computedTotalPages) return;
    const emitPage = isZeroBased ? targetPage1 - 1 : targetPage1;
    onPageChange(emitPage);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (computedTotalPages <= 7) {
      for (let i = 1; i <= computedTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page1 > 3) pages.push("...");
      const start = Math.max(2, page1 - 1);
      const end = Math.min(computedTotalPages - 1, page1 + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page1 < computedTotalPages - 2) pages.push("...");
      pages.push(computedTotalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 font-medium"
    >
      <div className="text-xs text-gray-600 select-none">
        Showing <strong className="text-gray-900 font-bold">{startItem}</strong> to{" "}
        <strong className="text-gray-900 font-bold">{endItem}</strong> of{" "}
        <strong className="text-gray-900 font-bold">{totalItems}</strong> items
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => handlePageSelect(page1 - 1)}
          disabled={page1 <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D4D4D4] bg-white text-xs font-semibold text-gray-900 hover:bg-[#F5F5F5] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={"ellipsis-" + idx} className="px-2 py-1 text-xs text-gray-400 select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === page1;
            return (
              <button
                key={"page-" + p}
                type="button"
                onClick={() => handlePageSelect(p)}
                aria-label={"Page " + p}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  "min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                  (isCurrent
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-white text-gray-900 border border-[#D4D4D4] hover:bg-[#F5F5F5]")
                }
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handlePageSelect(page1 + 1)}
          disabled={page1 >= computedTotalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D4D4D4] bg-white text-xs font-semibold text-gray-900 hover:bg-[#F5F5F5] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};
