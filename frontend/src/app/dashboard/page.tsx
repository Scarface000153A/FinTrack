"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(
  () => import("@/components/ui/dashboard-4").then((mod) => mod.Dashboard),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen bg-background p-4 text-foreground">
      <Dashboard />
    </div>
  );
}