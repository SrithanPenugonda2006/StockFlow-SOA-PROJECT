import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface StorageCapacityCardProps {
  totalCapacity?: number | null;
  usedCapacity?: number | null;
  occupiedCapacity?: number | null;
  capacity?: number | null;
  variant?: 'card' | 'compact' | 'dark';
  className?: string;
}

export const getCapacityStatus = (percentage: number) => {
  if (percentage > 100) {
    return {
      label: 'Over capacity',
      fullLabel: 'Over Capacity',
      bgClass: 'bg-black text-white',
      badgeClass: 'bg-[#111111] text-white border border-[#404040]',
      key: 'over',
    };
  }
  if (percentage >= 90) {
    return {
      label: 'Near capacity',
      fullLabel: 'Near Capacity',
      bgClass: 'bg-black text-white',
      badgeClass: 'bg-[#262626] text-white border border-[#525252]',
      key: 'near',
    };
  }
  if (percentage >= 80) {
    return {
      label: 'High utilization',
      fullLabel: 'High Utilization',
      bgClass: 'bg-[#404040] text-white',
      badgeClass: 'bg-[#F5F5F5] text-[#262626] border border-[#E5E5E5]',
      key: 'high',
    };
  }
  if (percentage >= 50) {
    return {
      label: 'Moderate utilization',
      fullLabel: 'Moderate Utilization',
      bgClass: 'bg-[#525252] text-white',
      badgeClass: 'bg-[#F5F5F5] text-[#404040] border border-[#E5E5E5]',
      key: 'moderate',
    };
  }
  return {
    label: 'Normal utilization',
    fullLabel: 'Normal Utilization',
    bgClass: 'bg-[#737373] text-white',
    badgeClass: 'bg-[#FAFAFA] text-[#525252] border border-[#E5E5E5]',
    key: 'normal',
  };
};

export const StorageCapacityCard: React.FC<StorageCapacityCardProps> = ({
  totalCapacity,
  usedCapacity,
  occupiedCapacity,
  capacity,
  variant = 'card',
  className = '',
}) => {
  const total = totalCapacity ?? capacity ?? 0;
  const used = usedCapacity ?? occupiedCapacity ?? 0;

  const isInvalidOrZeroTotal = !total || total <= 0;
  const rawPercentage = isInvalidOrZeroTotal ? 0 : (used / total) * 100;
  const percentage = Math.round(rawPercentage);
  const fillWidth = Math.min(Math.max(percentage, 0), 100);

  const statusInfo = getCapacityStatus(percentage);
  const isOverCapacity = percentage > 100;

  const isDark = variant === 'dark';
  const isCompact = variant === 'compact';

  const usedFormatted = used.toLocaleString();
  const totalFormatted = isInvalidOrZeroTotal ? 'N/A' : total.toLocaleString();

  const ariaText = isInvalidOrZeroTotal
    ? 'Storage capacity details unavailable'
    : `${usedFormatted} of ${totalFormatted} units stored (${percentage}% capacity utilization, ${statusInfo.label})`;

  if (isCompact) {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#525252] tracking-wider uppercase text-[11px]">
            Storage Capacity
          </span>
          <span className="font-bold text-gray-900 font-mono">
            {usedFormatted} / {totalFormatted} units
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fillWidth}
          aria-valuetext={ariaText}
          aria-label="Storage capacity utilization"
          className="w-full h-3.5 bg-[#E5E5E5] rounded-full overflow-hidden p-0.5 border border-gray-200"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverCapacity ? 'bg-black animate-pulse' : 'bg-black'
            }`}
            style={{ width: `${fillWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#737373]">
          <span className="font-semibold text-black">{percentage}%</span>
          <span className="font-medium text-[#525252]">
            {isOverCapacity ? `${percentage}% — Over Capacity` : statusInfo.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-300 text-left ${
        isDark
          ? 'bg-[#111111] border-[#262626] text-white shadow-2xl'
          : 'bg-white border-gray-200 text-gray-900 shadow-md'
      } ${isOverCapacity ? 'border-black ring-1 ring-black' : ''} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold text-xs tracking-widest uppercase ${
              isDark ? 'text-[#A3A3A3]' : 'text-[#737373]'
            }`}
          >
            Storage Capacity
          </span>
          <span
            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${statusInfo.badgeClass}`}
          >
            {isOverCapacity ? `${percentage}% — Over Capacity` : statusInfo.label}
          </span>
        </div>

        <div className="text-left sm:text-right">
          <span
            className={`font-extrabold text-base sm:text-lg tracking-tight font-mono ${
              isDark ? 'text-white' : 'text-[#000000]'
            }`}
          >
            {usedFormatted} / {totalFormatted} units{' '}
            <span className="text-sm font-semibold opacity-80">({percentage}%)</span>
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fillWidth}
        aria-valuetext={ariaText}
        aria-label="Storage capacity utilization"
        className={`w-full h-5 rounded-full overflow-hidden p-0.5 border ${
          isDark
            ? 'bg-[#262626] border-[#404040]'
            : 'bg-[#E5E5E5] border-gray-300/60'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isDark ? 'bg-white' : 'bg-[#000000]'
          } ${isOverCapacity ? 'opacity-90' : ''}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      <div
        className={`mt-4 pt-3 flex flex-wrap items-center justify-between text-xs border-t ${
          isDark ? 'border-[#262626] text-[#A3A3A3]' : 'border-gray-200/80 text-[#525252]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div>
            <span className="opacity-75">Occupied Stock: </span>
            <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {usedFormatted} units
            </span>
          </div>
          <div>
            <span className="opacity-75">Remaining Space: </span>
            <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {isInvalidOrZeroTotal
                ? 'N/A'
                : Math.max(0, total - used).toLocaleString() + ' units'}
            </span>
          </div>
        </div>

        {isOverCapacity && (
          <div className="flex items-center gap-1 font-bold text-black dark:text-white uppercase tracking-wider text-[11px] bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Exceeds Max Allocation</span>
          </div>
        )}
      </div>
    </div>
  );
};
