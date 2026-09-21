import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  variant = 'neutral',
}) => {
  const iconBg = {
    // blue/purple → neutral gray
    blue:    'bg-[#F5F5F5] text-[#555555] border-[#E5E5E5]',
    purple:  'bg-[#F5F5F5] text-[#555555] border-[#E5E5E5]',
    neutral: 'bg-[#F5F5F5] text-[#555555] border-[#E5E5E5]',
    // semantic colors kept
    emerald: 'bg-gray-100 text-gray-900 border-gray-100',
    amber:   'bg-gray-100 text-gray-700 border-gray-100',
    rose:    'bg-gray-100 text-gray-900 border-gray-100',
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex items-center justify-between text-left hover:border-[#D4D4D4] transition-all duration-150">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">{title}</span>
        <div className="text-2xl font-black text-[#111111] mt-1">{value}</div>
        {change && (
          <span
            className={`inline-block mt-1 text-xs font-semibold ${
              isPositive ? 'text-gray-900' : 'text-gray-900'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl border ${iconBg[variant] ?? iconBg.neutral}`}>{icon}</div>
    </div>
  );
};
