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
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-left min-w-[180px]">
        <p className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300 capitalize">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-100">{entry.value.toLocaleString()} units</span>
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
        <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
          Loading movement transaction trends...
        </div>
      ) : hasData ? (
        <div className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 font-medium capitalize">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="inflow"
                name="Stock Inflow"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="Stock Outflow"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#fb7185', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <span className="font-medium text-slate-400">No historical inventory movement data available</span>
          <span className="text-[11px] text-slate-600">Stock changes will appear here as transactions occur</span>
        </div>
      )}
    </Card>
  );
};
