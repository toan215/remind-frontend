import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getStoredCommissionRate, COMMISSION_RATE_EVENT } from "../../utils/commissionHelper";

export type ChartPeriod = "monthly" | "quarterly" | "yearly";

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

// Default revenue datasets (raw revenues)
const MONTHLY_DATA: RevenueDataPoint[] = [
  { label: "Tháng 2", revenue: 18500000 },
  { label: "Tháng 3", revenue: 22400000 },
  { label: "Tháng 4", revenue: 26800000 },
  { label: "Tháng 5", revenue: 31200000 },
  { label: "Tháng 6", revenue: 38500000 },
  { label: "Tháng 7", revenue: 42100000 },
];

const QUARTERLY_DATA: RevenueDataPoint[] = [
  { label: "Quý 1/2026", revenue: 40900000 },
  { label: "Quý 2/2026", revenue: 96500000 },
  { label: "Quý 3/2026", revenue: 42100000 },
];

const YEARLY_DATA: RevenueDataPoint[] = [
  { label: "Năm 2024", revenue: 120000000 },
  { label: "Năm 2025", revenue: 280000000 },
  { label: "Năm 2026", revenue: 179500000 },
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

// Custom interactive Tooltip with glassmorphism dark mode
function CustomTooltip({ active, payload, label, rate }: any) {
  if (!active || !payload || !payload.length) return null;

  const expertPayout = payload.find((p: any) => p.dataKey === "expertPayout")?.value || 0;
  const commission = payload.find((p: any) => p.dataKey === "commission")?.value || 0;
  const totalRevenue = expertPayout + commission;
  const commRate = rate || 15;
  const expertRate = 100 - commRate;

  return (
    <div className="admin-chart-tooltip">
      <div className="admin-tooltip-header">
        <span className="font-extrabold text-teal-300 text-sm">{label}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chi tiết doanh thu</span>
      </div>
      
      <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
        <span className="text-slate-300 font-medium">Tổng doanh thu:</span>
        <strong className="text-white font-extrabold text-sm">{formatVND(totalRevenue)}</strong>
      </div>
      
      <div className="flex justify-between items-center pt-1.5 text-teal-200">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2da19c] inline-block shadow-xs" />
          Chi trả Chuyên gia ({expertRate}%):
        </span>
        <strong className="font-extrabold">{formatVND(expertPayout)}</strong>
      </div>
      
      <div className="flex justify-between items-center text-amber-300 pt-1">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-xs" />
          Hoa hồng Sàn ReMind ({commRate}%):
        </span>
        <strong className="font-extrabold">{formatVND(commission)}</strong>
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
  const [commissionRate, setCommissionRate] = useState<number>(() => getStoredCommissionRate());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (typeof customEvt.detail === "number") {
        setCommissionRate(customEvt.detail);
      } else {
        setCommissionRate(getStoredCommissionRate());
      }
    };
    window.addEventListener(COMMISSION_RATE_EVENT, handleUpdate);
    return () => window.removeEventListener(COMMISSION_RATE_EVENT, handleUpdate);
  }, []);

  const getRawDataset = () => {
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

  const chartData = getRawDataset().map((d) => {
    const commission = Math.round((d.revenue * commissionRate) / 100);
    const expertPayout = d.revenue - commission;
    return {
      ...d,
      commission,
      expertPayout,
    };
  });

  const expertShareRate = 100 - commissionRate;

  return (
    <div className="admin-panel-card mb-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="admin-dashboard-section-title mb-1 text-slate-900">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg">
                <i className="bx bx-bar-chart-alt-2"></i>
              </div>
              {title}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="admin-period-tabs">
          <button
            className={`admin-period-tab ${period === "monthly" ? "active" : ""}`}
            onClick={() => setPeriod("monthly")}
          >
            Theo tháng
          </button>
          <button
            className={`admin-period-tab ${period === "quarterly" ? "active" : ""}`}
            onClick={() => setPeriod("quarterly")}
          >
            Theo quý
          </button>
          <button
            className={`admin-period-tab ${period === "yearly" ? "active" : ""}`}
            onClick={() => setPeriod("yearly")}
          >
            Theo năm
          </button>
        </div>
      </div>

      {/* Main Stacked Bar Chart */}
      <div className="revenue-chart-wrapper py-2">
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatShortVND}
            />
            <Tooltip
              content={<CustomTooltip rate={commissionRate} />}
              cursor={{ fill: "rgba(45, 161, 156, 0.06)", radius: 10 }}
            />
            {/* Stacked Bar Portion 1: Chi trả Chuyên gia - Light Teal */}
            <Bar
              dataKey="expertPayout"
              stackId="revenueStack"
              fill="#2da19c"
              name={`Chi trả Chuyên gia (${expertShareRate}%)`}
              radius={[0, 0, 6, 6]}
            />
            {/* Stacked Bar Portion 2: Hoa hồng Sàn ReMind - Orange */}
            <Bar
              dataKey="commission"
              stackId="revenueStack"
              fill="#f59e0b"
              name={`Hoa hồng Sàn ReMind (${commissionRate}%)`}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend & Navigation Link */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#2da19c] rounded-md shadow-xs"></span>
              <span className="text-slate-700 font-bold">Chi trả Chuyên gia ({expertShareRate}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#f59e0b] rounded-md shadow-xs"></span>
              <span className="text-slate-700 font-bold">Hoa hồng Sàn ReMind ({commissionRate}%)</span>
            </div>
          </div>

          {onNavigateFinances && (
            <button
              className="admin-chart-more-link"
              onClick={onNavigateFinances}
            >
              <span>Xem toàn bộ lịch sử tài chính</span>
              <i className="bx bx-right-arrow-alt text-lg"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RevenueGrowthChart;
