import React from 'react';
import { Card } from '../common/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export interface WarehouseStockData {
  name: string;
  available: number;
  reserved: number;
  total: number;
}

interface StockByWarehouseChartProps {
  data: WarehouseStockData[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const available = payload.find((p: any) => p.dataKey === 'available')?.value || 0;
    const reserved = payload.find((p: any) => p.dataKey === 'reserved')?.value || 0;
    const total = available + reserved;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-left min-w-[200px]">
        <p className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Available Stock:
            </span>
            <span className="font-semibold text-emerald-400">{available.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Reserved Stock:
            </span>
            <span className="font-semibold text-indigo-400">{reserved.toLocaleString()}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between font-bold text-slate-100">
            <span>Total Stock:</span>
            <span>{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StockByWarehouseChart: React.FC<StockByWarehouseChartProps> = ({ data, isLoading }) => {
  return (
    <Card
      title="Stock by Warehouse"
      subtitle="Real-time available vs reserved inventory distribution per facility"
    >
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-slate-500 text-xs">Loading warehouse stock data...</div>
      ) : data.length > 0 ? (
        <div className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 font-medium capitalize">{value} Stock</span>}
              />
              <Bar dataKey="available" name="Available" stackId="a" fill="#10b981" maxBarSize={48} />
              <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
          No warehouse stock records available to display.
        </div>
      )}
    </Card>
  );
};
