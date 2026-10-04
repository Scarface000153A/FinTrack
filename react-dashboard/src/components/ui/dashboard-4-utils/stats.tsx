import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+20.1% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Savings
          </CardTitle>
          <Wallet className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,450.00</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.5% vs target</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardStats;
