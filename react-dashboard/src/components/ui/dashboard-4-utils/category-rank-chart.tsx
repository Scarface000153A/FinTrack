"use client";

import { Card } from "@/components/ui/card";
import { type DashboardData, formatMoney } from "@/lib/dashboard-data";

export function CategoryRankChart({ data }: { data: DashboardData }) {
  const { symbol } = data.currency;
  const categories = data.topCategories;
  const maxShare = categories.reduce((max, item) => Math.max(max, item.share), 0);

  return (
    <Card className="rd-card gap-0 border-border/70 bg-card p-6 shadow-none">
      <div className="mb-6">
        <h3 className="text-[15px] font-medium text-card-foreground">
          Top spending categories
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Share of total expenses
        </p>
      </div>

      {categories.length > 0 ? (
        <ol className="flex flex-col gap-4">
          {categories.map((item, index) => (
            <li key={item.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="w-4 shrink-0 text-[12px] tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="truncate text-[13px] text-card-foreground">
                    {item.name}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                  {formatMoney(item.amount, symbol)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{
                      width: `${maxShare > 0 ? (item.share / maxShare) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-11 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">
                  {item.share.toFixed(1)}%
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 py-6">
          <p className="text-[15px] font-medium text-card-foreground">
            No categories yet
          </p>
          <p className="text-[13px] text-muted-foreground">
            Category breakdown appears after you log expenses.
          </p>
        </div>
      )}
    </Card>
  );
}

export default CategoryRankChart;