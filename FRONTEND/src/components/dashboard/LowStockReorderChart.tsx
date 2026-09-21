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
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-left min-w-[220px]">
        <p className="text-xs font-bold text-slate-100">{itemData.productName}</p>
        <p className="text-[10px] text-slate-400 font-mono mb-2">SKU: {itemData.sku}</p>

        <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Available Stock:
            </span>
            <span className="font-semibold text-amber-400">{itemData.available}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              Reorder Level:
            </span>
            <span className="font-semibold text-slate-300">{itemData.threshold}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-bold">
            <span className="text-slate-400">Difference:</span>
            <span className={diff < 0 ? "text-rose-400" : "text-emerald-400"}>
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
  // Calculate content-driven height so card height closely matches content (~420-450px on desktop for 2 products):
  // 1-2 products: ~220px - 240px chart height (Total Card height ~400px - 440px)
  // 3-5 products: ~290px - 380px chart height
  // 6+ products: ~380px cap
  const chartHeight = Math.min(380, Math.max(220, itemCount * 50 + 140));

  return (
    <Card
      title="Low Stock vs Reorder Level"
      subtitle="Products requiring inventory replenishment attention"
      className="h-auto"
    >
      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center text-slate-500 text-xs">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.15))]}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={170}
                  tickFormatter={(val: string) => (val && val.length > 26 ? `${val.substring(0, 24)}...` : val)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(51, 65, 85, 0.25)" }} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  formatter={(value) => <span className="text-slate-300 font-medium capitalize">{value}</span>}
                />
                <Bar dataKey="available" name="Available Stock" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={14} />
                <Bar dataKey="threshold" name="Reorder Level" fill="#64748b" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-[220px] flex flex-col items-center justify-center gap-1 text-slate-500 text-xs py-6">
          <span className="font-semibold text-emerald-400">All Product Stock Levels Healthy</span>
          <span className="text-slate-500 text-[11px]">No items are currently below reorder threshold</span>
        </div>
      )}
    </Card>
  );
};
