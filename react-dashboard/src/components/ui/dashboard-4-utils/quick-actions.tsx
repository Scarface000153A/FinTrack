import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MinusCircle, Download, RefreshCw, Settings, Sliders } from "lucide-react";

export function QuickActions({
  onAddIncome,
  onAddExpense,
  onExport,
  onResetLayout,
}: {
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onExport?: () => void;
  onResetLayout?: () => void;
}) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sliders className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onResetLayout} className="gap-2 cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Widget Layout</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="h-3.5 w-3.5" />
                <span>Configure Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>Instant operations & layout controls</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-2">
        <Button onClick={onAddIncome} className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <PlusCircle className="h-4 w-4" />
          <span>Add New Income</span>
        </Button>
        <Button onClick={onAddExpense} variant="outline" className="w-full justify-start gap-2 text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <MinusCircle className="h-4 w-4" />
          <span>Record Expense</span>
        </Button>
        <Button onClick={onExport} variant="secondary" className="w-full justify-start gap-2">
          <Download className="h-4 w-4" />
          <span>Export Financial CSV</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
