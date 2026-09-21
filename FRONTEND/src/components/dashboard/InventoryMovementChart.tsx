import React from 'react';
import { Card } from '../common/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export interface MovementTrendPoint {
  date: string;
  inflow: number;
  outflow: number;
}

interface InventoryMovementChartProps {
  data: MovementTrendPoint[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl text-left min-w-[180px]">
        <p className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-600 capitalize">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-gray-900">{entry.value.toLocaleString()} units</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const InventoryMovementChart: React.FC<InventoryMovementChartProps> = ({ data, isLoading }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.inflow > 0 || d.outflow > 0);

  return (
    <Card
      title="Inventory Movement"
      subtitle="Stock activity over time"
    >
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-gray-400 text-xs font-medium">
          Loading movement transaction trends...
        </div>
      ) : hasData ? (
        <div className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-gray-700 font-medium capitalize">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="inflow"
                name="Stock Inflow"
                stroke="#000000"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#000000', strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#404040', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="Stock Outflow"
                stroke="#737373"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#737373', strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#A3A3A3', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
          <span className="font-semibold text-gray-600">No historical inventory movement data available</span>
          <span className="text-[11px] text-gray-400">Stock changes will appear here as transactions occur</span>
        </div>
      )}
    </Card>
  );
};
