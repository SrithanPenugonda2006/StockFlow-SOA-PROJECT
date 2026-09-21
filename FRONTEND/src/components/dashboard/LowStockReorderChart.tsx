import React from "react";
import { Card } from "../common/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export interface LowStockReorderData {
  productName: string;
  sku: string;
  available: number;
  threshold: number;
  difference: number;
}

interface LowStockReorderChartProps {
  data: LowStockReorderData[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const itemData = payload[0].payload as LowStockReorderData;
    const diff = itemData.available - itemData.threshold;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl text-left min-w-[220px]">
        <p className="text-xs font-bold text-gray-900">{itemData.productName}</p>
        <p className="text-[10px] text-gray-500 font-mono mb-2">SKU: {itemData.sku}</p>

        <div className="space-y-1.5 text-xs border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-700 inline-block" />
              Available Stock:
            </span>
            <span className="font-semibold text-gray-700">{itemData.available}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
              Reorder Level:
            </span>
            <span className="font-semibold text-gray-700">{itemData.threshold}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100 font-bold">
            <span className="text-gray-500">Difference:</span>
            <span className={diff < 0 ? "text-gray-900" : "text-gray-900"}>
              {diff > 0 ? `+${diff}` : diff}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LowStockReorderChart: React.FC<LowStockReorderChartProps> = ({ data, isLoading }) => {
  const itemCount = data.length;
  const chartHeight = Math.min(380, Math.max(220, itemCount * 50 + 140));

  return (
    <Card
      title="Low Stock vs Reorder Level"
      subtitle="Products requiring inventory replenishment attention"
      className="h-auto"
    >
      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center text-gray-400 text-xs font-medium">
          Loading low stock alerts...
        </div>
      ) : itemCount > 0 ? (
        <div className="w-full pt-1">
          <div style={{ height: `${chartHeight}px` }} className="w-full focus:outline-none outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                barGap={4}
                barCategoryGap={itemCount <= 2 ? "25%" : "18%"}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.15))]}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  stroke="#374151"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={170}
                  tickFormatter={(val: string) => (val && val.length > 26 ? `${val.substring(0, 24)}...` : val)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(243, 244, 246, 0.6)" }} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  formatter={(value) => <span className="text-gray-700 font-medium capitalize">{value}</span>}
                />
                <Bar dataKey="available" name="Available Stock" fill="#000000" radius={[0, 4, 4, 0]} maxBarSize={14} />
                <Bar dataKey="threshold" name="Reorder Level" fill="#737373" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-[220px] flex flex-col items-center justify-center gap-1 text-gray-500 text-xs py-6">
          <span className="font-semibold text-gray-900">All Product Stock Levels Healthy</span>
          <span className="text-gray-400 text-[11px]">No items are currently below reorder threshold</span>
        </div>
      )}
    </Card>
  );
};
