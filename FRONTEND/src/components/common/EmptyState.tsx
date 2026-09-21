import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description = 'There are no records matching your current filter criteria.',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-indigo-400 mb-4">
        {icon || <PackageSearch className="w-10 h-10 text-indigo-400" />}
      </div>
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
