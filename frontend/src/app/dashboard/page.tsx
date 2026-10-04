"use client";

import dynamic from "next/dynamic";
import { EMPTY_DASHBOARD_DATA } from "@/lib/dashboard-data";

const Dashboard = dynamic(
  () => import("@/components/ui/dashboard-4").then((mod) => mod.Dashboard),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen bg-background p-4 text-foreground">
      <Dashboard data={EMPTY_DASHBOARD_DATA} />
    </div>
  );
}