"use client";

import React, { useState } from "react";
import { DraggableWidgetGrid, type WidgetItem } from "@/components/ui/draggable-widget-grid";
import { CategoryRankChart } from "@/components/ui/dashboard-4-utils/category-rank-chart";
import { QuickActions } from "@/components/ui/dashboard-4-utils/quick-actions";
import { RefundReturnRateChart } from "@/components/ui/dashboard-4-utils/refund-return-rate-chart";
import { RevenueChart } from "@/components/ui/dashboard-4-utils/revenue-chart";
import { DashboardStats } from "@/components/ui/dashboard-4-utils/stats";
import { Button } from "@/components/ui/button";
import { RotateCcw, Move, Sparkles } from "lucide-react";

const DEFAULT_WIDGETS: WidgetItem[] = [
  { id: "stats", size: "wide", label: "Financial Metrics & KPIs" },
  { id: "revenue", size: "wide", label: "Revenue & Operating Trends" },
  { id: "refund", size: "sm", label: "Expense Velocity & Outflow" },
  { id: "category", size: "sm", label: "Top Category Allocation" },
  { id: "actions", size: "sm", label: "Instant Quick Actions" },
];

export function Dashboard() {
  const [widgets, setWidgets] = useState<WidgetItem[]>(DEFAULT_WIDGETS);
  const [isEditable, setIsEditable] = useState(true);

  const resetLayout = () => {
    setWidgets([...DEFAULT_WIDGETS]);
  };

  const renderWidgetContent = (item: WidgetItem) => {
    switch (item.id) {
      case "stats":
        return <DashboardStats />;
      case "revenue":
        return <RevenueChart />;
      case "refund":
        return <RefundReturnRateChart />;
      case "category":
        return <CategoryRankChart />;
      case "actions":
        return <QuickActions onResetLayout={resetLayout} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Customizability & Layout Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Customizable Workspace</h2>
            <p className="text-xs text-muted-foreground">
              Drag and drop any card to customize your dashboard layout freely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditable(!isEditable)}
            className="text-xs h-8"
          >
            {isEditable ? "Lock Layout" : "Edit Layout"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Draggable Widget Grid */}
      <DraggableWidgetGrid
        items={widgets}
        onChange={setWidgets}
        editable={isEditable}
        renderItem={renderWidgetContent}
        gap={16}
        radius={12}
      />
    </div>
  );
}

export default Dashboard;
