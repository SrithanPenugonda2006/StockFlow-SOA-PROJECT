import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';

export interface InventoryHealthCounts {
  healthy: number;
  lowStock: number;
  critical: number;
  outOfStock: number;
  total: number;
}

interface InventoryHealthChartProps {
  counts: InventoryHealthCounts;
  isLoading: boolean;
}

export const InventoryHealthChart: React.FC<InventoryHealthChartProps> = ({ counts, isLoading }) => {
  const { healthy, lowStock, critical, outOfStock, total } = counts;

  const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const lowStockPct = total > 0 ? Math.round((lowStock / total) * 100) : 0;
  const criticalPct = total > 0 ? Math.round((critical / total) * 100) : 0;
  const outOfStockPct = total > 0 ? Math.round((outOfStock / total) * 100) : 0;

  const items = [
    {
      label: 'Healthy',
      count: healthy,
      pct: healthyPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Low Stock',
      count: lowStock,
      pct: lowStockPct,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    },
    {
      label: 'Critical',
      count: critical,
      pct: criticalPct,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400" />,
    },
    {
      label: 'Out of Stock',
      count: outOfStock,
      pct: outOfStockPct,
      color: 'bg-red-600',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      icon: <XCircle className="w-4 h-4 text-red-400" />,
    },
  ];

  return (
    <Card
      title="Inventory Health"
      subtitle="Status distribution across all product stock records"
      className="h-full flex flex-col justify-between"
    >
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-slate-500 text-xs">Loading health metrics...</div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-4 pt-1 pb-1">
          {/* Top Combined Segmented Distribution Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Health Portfolio</span>
              <span className="font-bold text-slate-100">{total} Total Records</span>
            </div>
            <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-700/50">
              {healthyPct > 0 && (
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${healthyPct}%` }}
                  title={`Healthy: ${healthy} (${healthyPct}%)`}
                />
              )}
              {lowStockPct > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${lowStockPct}%` }}
                  title={`Low Stock: ${lowStock} (${lowStockPct}%)`}
                />
              )}
              {criticalPct > 0 && (
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${criticalPct}%` }}
                  title={`Critical: ${critical} (${criticalPct}%)`}
                />
              )}
              {outOfStockPct > 0 && (
                <div
                  className="h-full bg-red-600 rounded-r-full transition-all duration-500"
                  style={{ width: `${outOfStockPct}%` }}
                  title={`Out of Stock: ${outOfStock} (${outOfStockPct}%)`}
                />
              )}
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between p-3 rounded-xl border ${item.borderColor} ${item.bgColor} transition-all`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-slate-100 block">
                      {item.count} {item.count === 1 ? 'record' : 'records'}
                    </span>
                    <span className={`text-[10px] font-semibold ${item.textColor}`}>{item.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
