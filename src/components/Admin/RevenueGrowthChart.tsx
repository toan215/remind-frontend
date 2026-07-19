import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ChartPeriod = "monthly" | "quarterly" | "yearly";

export interface RevenueDataPoint {
  label: string;
  revenue: number;
  expertPayout: number;
  commission: number;
}

// Default revenue datasets
const MONTHLY_DATA: RevenueDataPoint[] = [
  { label: "Tháng 2", revenue: 18500000, expertPayout: 15725000, commission: 2775000 },
  { label: "Tháng 3", revenue: 22400000, expertPayout: 19040000, commission: 3360000 },
  { label: "Tháng 4", revenue: 26800000, expertPayout: 22780000, commission: 4020000 },
  { label: "Tháng 5", revenue: 31200000, expertPayout: 26520000, commission: 4680000 },
  { label: "Tháng 6", revenue: 38500000, expertPayout: 32725000, commission: 5775000 },
  { label: "Tháng 7", revenue: 42100000, expertPayout: 35785000, commission: 6315000 },
];

const QUARTERLY_DATA: RevenueDataPoint[] = [
  { label: "Quý 1/2026", revenue: 40900000, expertPayout: 34765000, commission: 6135000 },
  { label: "Quý 2/2026", revenue: 96500000, expertPayout: 82025000, commission: 14475000 },
  { label: "Quý 3/2026", revenue: 42100000, expertPayout: 35785000, commission: 6315000 },
];

const YEARLY_DATA: RevenueDataPoint[] = [
  { label: "Năm 2024", revenue: 120000000, expertPayout: 102000000, commission: 18000000 },
  { label: "Năm 2025", revenue: 280000000, expertPayout: 238000000, commission: 42000000 },
  { label: "Năm 2026", revenue: 179500000, expertPayout: 152575000, commission: 26925000 },
];

interface RevenueGrowthChartProps {
  onNavigateFinances?: () => void;
  title?: string;
  subtitle?: string;
  initialPeriod?: ChartPeriod;
}

const formatVND = (val: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};

const formatShortVND = (val: number) => {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ`;
  if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return `${val}`;
};

// Custom interactive Tooltip (shown on hover/tap)
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const expertPayout = payload.find((p: any) => p.dataKey === "expertPayout")?.value || 0;
  const commission = payload.find((p: any) => p.dataKey === "commission")?.value || 0;
  const totalRevenue = expertPayout + commission;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-2xl text-xs border border-slate-700 pointer-events-none min-w-[210px] backdrop-blur-md">
      <div className="font-extrabold text-teal-300 text-sm mb-2 pb-1.5 border-b border-slate-700/80 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-slate-400 font-normal">Chi tiết</span>
      </div>
      
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-slate-300 font-medium">Tổng doanh thu:</span>
        <strong className="text-white font-extrabold text-sm">{formatVND(totalRevenue)}</strong>
      </div>
      
      <div className="flex justify-between items-center mb-1 text-teal-200">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2da19c] inline-block shadow-sm" />
          Chi trả Chuyên gia (85%):
        </span>
        <strong className="font-bold">{formatVND(expertPayout)}</strong>
      </div>
      
      <div className="flex justify-between items-center text-amber-300">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-sm" />
          Hoa hồng Sàn (15%):
        </span>
        <strong className="font-bold">{formatVND(commission)}</strong>
      </div>
    </div>
  );
}

export function RevenueGrowthChart({
  onNavigateFinances,
  title = "Biểu đồ Tăng trưởng Doanh thu",
  subtitle = "Theo dõi doanh thu dịch vụ tư vấn và hoa hồng nền tảng ReMind qua thời gian.",
  initialPeriod = "monthly",
}: RevenueGrowthChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>(initialPeriod);

  const getDataset = () => {
    switch (period) {
      case "quarterly":
        return QUARTERLY_DATA;
      case "yearly":
        return YEARLY_DATA;
      case "monthly":
      default:
        return MONTHLY_DATA;
    }
  };

  const chartData = getDataset();

  return (
    <div className="admin-panel-card mb-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="admin-dashboard-section-title mb-1 text-slate-900">
            <span className="flex items-center gap-2">
              <i className="bx bx-bar-chart-alt-2 text-teal-700 text-xl"></i>
              {title}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              period === "monthly"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            onClick={() => setPeriod("monthly")}
          >
            Theo tháng
          </button>
          <button
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              period === "quarterly"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            onClick={() => setPeriod("quarterly")}
          >
            Theo quý
          </button>
          <button
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              period === "yearly"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            onClick={() => setPeriod("yearly")}
          >
            Theo năm
          </button>
        </div>
      </div>

      {/* Main Stacked Bar Chart */}
      <div className="revenue-chart-wrapper py-2">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatShortVND}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(45, 161, 156, 0.07)", radius: 8 }}
            />
            {/* Stacked Bar Portion 1: Chi trả Chuyên gia (85%) - Light Teal */}
            <Bar
              dataKey="expertPayout"
              stackId="revenueStack"
              fill="#2da19c"
              name="Chi trả Chuyên gia (85%)"
              radius={[0, 0, 4, 4]}
            />
            {/* Stacked Bar Portion 2: Hoa hồng Sàn ReMind (15%) - Orange */}
            <Bar
              dataKey="commission"
              stackId="revenueStack"
              fill="#f59e0b"
              name="Hoa hồng Sàn ReMind (15%)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend & Navigation Link */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#2da19c] rounded-sm shadow-sm"></span>
              <span className="text-slate-700 font-semibold">Chi trả Chuyên gia (85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#f59e0b] rounded-sm shadow-sm"></span>
              <span className="text-slate-700 font-semibold">Hoa hồng Sàn ReMind (15%)</span>
            </div>
          </div>

          {onNavigateFinances && (
            <button
              className="text-teal-700 font-bold hover:text-teal-900 transition-colors flex items-center gap-1 cursor-pointer"
              onClick={onNavigateFinances}
            >
              <span>Xem toàn bộ lịch sử tài chính</span>
              <i className="bx bx-right-arrow-alt text-base"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RevenueGrowthChart;
