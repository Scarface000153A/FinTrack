import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Dashboard } from "./components/ui/dashboard-4";
import {
  EMPTY_DASHBOARD_DATA,
  type DashboardData,
} from "./lib/dashboard-data";

function readDashboardData(): DashboardData {
  const node = document.getElementById("react-dashboard-data");
  if (!node?.textContent) return EMPTY_DASHBOARD_DATA;

  try {
    const parsed = JSON.parse(node.textContent) as Partial<DashboardData>;
    return {
      ...EMPTY_DASHBOARD_DATA,
      ...parsed,
      currency: { ...EMPTY_DASHBOARD_DATA.currency, ...parsed.currency },
      totals: { ...EMPTY_DASHBOARD_DATA.totals, ...parsed.totals },
      stats: { ...EMPTY_DASHBOARD_DATA.stats, ...parsed.stats },
      series: parsed.series ?? [],
      topCategories: parsed.topCategories ?? [],
    };
  } catch {
    return EMPTY_DASHBOARD_DATA;
  }
}

const rootElement = document.getElementById("react-dashboard-root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Dashboard data={readDashboardData()} />
    </StrictMode>,
  );
}