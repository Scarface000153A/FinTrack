"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreHorizontal, Plus, Minus } from "lucide-react";
import { type DashboardData, formatMoney } from "@/lib/dashboard-data";

function openModal(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    document.body.classList.add("modal-open");
  }
}

export function QuickActions({ data }: { data: DashboardData }) {
  const { symbol } = data.currency;

  return (
    <Card className="rd-card gap-0 border-border/70 bg-card p-6 shadow-none">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-card-foreground">
            Quick actions
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Record activity or export your data
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg">
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <a href="/export/csv">Export as CSV</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <a href="/export/json">Export as JSON</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          onClick={() => openModal("modal-income")}
          className="h-10 w-full justify-start gap-2.5 rounded-lg bg-[#16a34a] text-[13px] font-medium text-white hover:bg-[#15803d]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          <span>Add income</span>
        </Button>

        <Button
          onClick={() => openModal("modal-expense")}
          className="h-10 w-full justify-start gap-2.5 rounded-lg bg-[#e5484d] text-[13px] font-medium text-white hover:bg-[#dc2626]"
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} />
          <span>Add expense</span>
        </Button>

        <Button
          variant="outline"
          className="h-10 w-full justify-start gap-2.5 rounded-lg border-border/70 bg-transparent text-[13px] font-medium shadow-none"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          <span>Export data</span>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-4 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Net balance</span>
          <span className="tabular-nums text-card-foreground">
            {formatMoney(data.totals.balance, symbol)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Income</span>
          <span className="tabular-nums text-trend-up">
            {formatMoney(data.totals.income, symbol)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Expenses</span>
          <span className="tabular-nums text-trend-down">
            {formatMoney(data.totals.expenses, symbol)}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default QuickActions;