import { Dashboard } from "@/components/ui/dashboard-4";
import { EMPTY_DASHBOARD_DATA } from "@/lib/dashboard-data";

export default function DashboardDemo() {
  return (
    <div className="w-full min-h-screen bg-background p-4 text-foreground">
      <Dashboard data={EMPTY_DASHBOARD_DATA} />
    </div>
  );
}