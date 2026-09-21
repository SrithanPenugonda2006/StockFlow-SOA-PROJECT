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
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#555555] mb-4">
        {icon || <PackageSearch className="w-10 h-10 text-[#888888]" />}
      </div>
      <h3 className="text-lg font-bold text-[#111111]">{title}</h3>
      <p className="text-sm text-[#666666] mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
