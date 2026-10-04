"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, Tooltip } from "recharts";
import { type DashboardData, formatMoney } from "@/lib/dashboard-data";

const RANGES = [
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
] as const;

export function RefundReturnRateChart({ data }: { data: DashboardData }) {
  const [range, setRange] = useState<string>("30");

  const series = data.series.slice(-Number(range));
  const { symbol } = data.currency;

  const totalExpenses = series.reduce((sum, point) => sum + point.expenses, 0);
  const totalIncome = series.reduce((sum, point) => sum + point.income, 0);
  const burnRatio =
    totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const avgDaily = series.length ? totalExpenses / series.length : 0;

  const chartData = series.map((point) => ({
    label: point.label,
    expenses: point.expenses,
  }));

  return (
    <Card className="rd-card gap-0 border-border/70 bg-card p-6 shadow-none">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-card-foreground">
            Expense velocity
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Daily outflow against income
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger
            className="h-9 w-[140px] rounded-lg border-border/70 bg-transparent text-[13px] shadow-none"
            aria-label="Expense range"
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

      {totalExpenses > 0 ? (
        <>
          <div className="h-[180px] w-full">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                horizontal
                strokeDasharray="2 6"
                className="rd-grid-line"
              />
              <Bar
                dataKey="expenses"
                fill="var(--chart-3)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-border/70 bg-popover px-3 py-2 text-[12px] shadow-lg">
                      <p className="mb-1 text-muted-foreground">{label}</p>
                      <p className="font-medium tabular-nums text-popover-foreground">
                        {formatMoney(Number(payload[0]?.value ?? 0), symbol)}
                      </p>
                    </div>
                  ) : null
                }
              />
            </BarChart>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">
              Burn rate{" "}
              <span className="font-medium tabular-nums text-card-foreground">
                {burnRatio.toFixed(1)}%
              </span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Avg{" "}
              <span className="font-medium tabular-nums text-card-foreground">
                {formatMoney(avgDaily, symbol)}
              </span>{" "}
              / day
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-3"
              style={{ width: `${burnRatio}%` }}
            />
          </div>
        </>
      ) : (
        <div className="flex h-[180px] w-full flex-col items-center justify-center gap-1">
          <p className="text-[15px] font-medium text-card-foreground">
            No expenses yet
          </p>
          <p className="text-[13px] text-muted-foreground">
            Expense outflow will appear here.
          </p>
        </div>
      )}
    </Card>
  );
}

export default RefundReturnRateChart;