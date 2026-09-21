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
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl text-left min-w-[200px]">
        <p className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" />
              Available Stock:
            </span>
            <span className="font-semibold text-gray-900">{available.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111111] inline-block" />
              Reserved Stock:
            </span>
            <span className="font-semibold text-[#111111]">{reserved.toLocaleString()}</span>
          </div>
          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between font-bold text-gray-900">
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
        <div className="h-72 flex items-center justify-center text-gray-400 text-xs font-medium">Loading warehouse stock data...</div>
      ) : data.length > 0 ? (
        <div className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-gray-700 font-medium capitalize">{value} Stock</span>}
              />
              <Bar dataKey="available" name="Available" stackId="a" fill="#000000" maxBarSize={48} />
              <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#737373" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-gray-400 text-xs font-medium">
          No warehouse stock records available to display.
        </div>
      )}
    </Card>
  );
};
