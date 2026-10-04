"use client";

import { CategoryRankChart } from "@/components/ui/dashboard-4-utils/category-rank-chart";
import { QuickActions } from "@/components/ui/dashboard-4-utils/quick-actions";
import { RefundReturnRateChart } from "@/components/ui/dashboard-4-utils/refund-return-rate-chart";
import { RevenueChart } from "@/components/ui/dashboard-4-utils/revenue-chart";
import { DashboardStats } from "@/components/ui/dashboard-4-utils/stats";
import { type DashboardData } from "@/lib/dashboard-data";

export function Dashboard({ data }: { data: DashboardData }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <DashboardStats data={data} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={data} />
        </div>
        <QuickActions data={data} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RefundReturnRateChart data={data} />
        <CategoryRankChart data={data} />
      </div>
    </div>
  );
}

export default Dashboard;