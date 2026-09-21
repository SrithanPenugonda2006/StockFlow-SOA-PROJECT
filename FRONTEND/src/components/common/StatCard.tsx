import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  variant = 'blue',
}) => {
  const iconBg = {
    blue: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between text-left hover:border-slate-700 transition-colors">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="text-2xl font-black text-slate-100 mt-1">{value}</div>
        {change && (
          <span
            className={`inline-block mt-1 text-xs font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl border ${iconBg[variant]}`}>{icon}</div>
    </div>
  );
};
