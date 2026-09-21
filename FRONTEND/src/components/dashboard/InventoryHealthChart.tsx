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
      color: 'bg-gray-900',
      textColor: 'text-gray-900',
      borderColor: 'border-gray-800',
      bgColor: 'bg-[#F5F5F5]',
      icon: <CheckCircle2 className="w-4 h-4 text-gray-900" />,
    },
    {
      label: 'Low Stock',
      count: lowStock,
      pct: lowStockPct,
      color: 'bg-gray-700',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-600',
      bgColor: 'bg-[#FAFAFA]',
      icon: <AlertTriangle className="w-4 h-4 text-gray-700" />,
    },
    {
      label: 'Critical',
      count: critical,
      pct: criticalPct,
      color: 'bg-gray-900',
      textColor: 'text-gray-900',
      borderColor: 'border-gray-800',
      bgColor: 'bg-[#F5F5F5]',
      icon: <AlertOctagon className="w-4 h-4 text-gray-900" />,
    },
    {
      label: 'Out of Stock',
      count: outOfStock,
      pct: outOfStockPct,
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      bgColor: 'bg-gray-100',
      icon: <XCircle className="w-4 h-4 text-gray-500" />,
    },
  ];

  return (
    <Card
      title="Inventory Health"
      subtitle="Status distribution across all product stock records"
      className="h-full flex flex-col justify-between"
    >
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-gray-400 text-xs font-medium">Loading health metrics...</div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-4 pt-1 pb-1">
          {/* Top Combined Segmented Distribution Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Health Portfolio</span>
              <span className="font-bold text-gray-900">{total} Total Records</span>
            </div>
            <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-gray-200">
              {healthyPct > 0 && (
                <div
                  className="h-full bg-gray-900 rounded-l-full transition-all duration-500"
                  style={{ width: `${healthyPct}%` }}
                  title={`Healthy: ${healthy} (${healthyPct}%)`}
                />
              )}
              {lowStockPct > 0 && (
                <div
                  className="h-full bg-gray-700 transition-all duration-500"
                  style={{ width: `${lowStockPct}%` }}
                  title={`Low Stock: ${lowStock} (${lowStockPct}%)`}
                />
              )}
              {criticalPct > 0 && (
                <div
                  className="h-full bg-gray-900 transition-all duration-500"
                  style={{ width: `${criticalPct}%` }}
                  title={`Critical: ${critical} (${criticalPct}%)`}
                />
              )}
              {outOfStockPct > 0 && (
                <div
                  className="h-full bg-gray-500 rounded-r-full transition-all duration-500"
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
                  <span className="text-xs font-bold text-gray-900">{item.label}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200/80 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-gray-900 block">
                      {item.count} {item.count === 1 ? 'record' : 'records'}
                    </span>
                    <span className={`text-[10px] font-bold ${item.textColor}`}>{item.pct}%</span>
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
