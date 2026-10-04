"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  Tooltip,
} from "recharts";
import {
  type DashboardData,
  formatCompactMoney,
  formatMoney,
} from "@/lib/dashboard-data";

const RANGES = [
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
] as const;

type MetricKey = "balance" | "income" | "expenses";

const METRICS: Array<{ value: MetricKey; label: string }> = [
  { value: "balance", label: "Net balance" },
  { value: "income", label: "Income" },
  { value: "expenses", label: "Expenses" },
];

function CashFlowTooltip({
  active,
  payload,
  metric,
  symbol,
}: {
  active?: boolean;
  payload?: Array<{ payload?: Record<string, unknown> }>;
  metric: MetricKey;
  symbol: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as
    | { label?: string; balance?: number; income?: number; expenses?: number }
    | undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-border/70 bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1 text-muted-foreground">{point.label}</p>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">
          {METRICS.find((m) => m.value === metric)?.label}
        </span>
        <span className="font-medium tabular-nums text-popover-foreground">
          {formatMoney(Number(point[metric] ?? 0), symbol)}
        </span>
      </div>
    </div>
  );
}

export function RevenueChart({ data }: { data: DashboardData }) {
  const [range, setRange] = useState<string>("60");
  const [metric, setMetric] = useState<MetricKey>("balance");

  const series = data.series.slice(-Number(range));
  const { symbol } = data.currency;

  const gradientId = useMemo(() => `revenue-fill-${metric}`, [metric]);

  const hasData = series.some((point) => point[metric] !== 0);

  return (
    <Card className="rd-card gap-0 border-border/70 bg-card p-6 shadow-none">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium text-card-foreground">
          Cash flow
        </h3>

        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
            <SelectTrigger
              className="h-9 w-[150px] rounded-lg border-border/70 bg-transparent text-[13px] shadow-none"
              aria-label="Chart metric"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              className="h-9 w-[150px] rounded-lg border-border/70 bg-transparent text-[13px] shadow-none"
              aria-label="Chart range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasData ? (
        <div className="h-[300px] w-full">
          <AreaChart
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="55%" stopColor="var(--chart-1)" stopOpacity={0.06} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical
              horizontal={false}
              strokeDasharray="2 6"
              className="rd-grid-line"
            />

            <Area
              type="monotone"
              dataKey={metric}
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="var(--chart-1)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{
                r: 3.5,
                fill: "var(--chart-1)",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<CashFlowTooltip metric={metric} symbol={symbol} />}
            />
          </AreaChart>
        </div>
      ) : (
        <div className="flex h-[300px] w-full flex-col items-center justify-center gap-1">
          <p className="text-[15px] font-medium text-card-foreground">
            No activity yet
          </p>
          <p className="text-[13px] text-muted-foreground">
            Record income or expenses to populate this chart.
          </p>
        </div>
      )}

      <p className="mt-4 text-[12px] text-muted-foreground tabular-nums">
        Latest: {formatMoney(series.length ? series[series.length - 1][metric] : 0, symbol)}
        {" · "}
        Peak:{" "}
        {formatCompactMoney(
          series.reduce((max, point) => Math.max(max, point[metric]), 0),
          symbol,
        )}
      </p>
    </Card>
  );
}

export default RevenueChart;