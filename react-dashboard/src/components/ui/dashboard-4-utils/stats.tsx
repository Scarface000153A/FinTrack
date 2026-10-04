"use client";

import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  formatCompactMoney,
  formatCount,
  type DashboardData,
} from "@/lib/dashboard-data";

type StatCard = {
  label: string;
  value: string;
  delta: number;
  suffix?: string;
};

export function DashboardStats({ data }: { data: DashboardData }) {
  const { symbol } = data.currency;
  const comparison = data.comparisonLabel;

  const cards: StatCard[] = [
    {
      label: "Total income",
      value: formatCompactMoney(data.stats.totalRevenue, symbol),
      delta: data.stats.totalRevenueDelta,
    },
    {
      label: "Transactions",
      value: formatCount(data.stats.transactionCount),
      delta: data.stats.transactionCountDelta,
    },
    {
      label: "Average transaction",
      value: formatCompactMoney(data.stats.averageTransaction, symbol),
      delta: data.stats.averageTransactionDelta,
    },
    {
      label: "Savings rate",
      value: `${data.stats.savingsRate.toFixed(1)}%`,
      delta: data.stats.savingsRateDelta,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isUp = card.delta >= 0;
        const TrendIcon = isUp ? TrendingUp : TrendingDown;

        return (
          <Card
            key={card.label}
            className="rd-card gap-0 border-border/70 bg-card p-6 shadow-none"
          >
            <p className="text-[13px] leading-none text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-5 text-[28px] font-semibold leading-none tracking-tight text-card-foreground tabular-nums">
              {card.value}
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <TrendIcon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isUp ? "text-trend-up" : "text-trend-down"
                }`}
                strokeWidth={2.25}
              />
              <span
                className={`text-[13px] font-medium tabular-nums ${
                  isUp ? "text-trend-up" : "text-trend-down"
                }`}
              >
                {isUp ? "+" : ""}
                {card.delta.toFixed(1)}%
              </span>
              <span className="text-[13px] text-muted-foreground">
                {comparison}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default DashboardStats;