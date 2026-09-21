import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm text-slate-400">
      <div>
        {totalElements !== undefined && pageSize !== undefined ? (
          <span>
            Showing{' '}
            <strong className="text-slate-100 font-semibold">
              {currentPage * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-100 font-semibold">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="text-slate-100 font-semibold">{totalElements}</strong> items
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-100">{currentPage + 1}</strong> of{' '}
            <strong className="text-slate-100">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onPageChange(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                currentPage === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
