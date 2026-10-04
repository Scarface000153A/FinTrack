"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";

const returnData = [
  { day: "Mon", rate: 2.4 },
  { day: "Tue", rate: 1.8 },
  { day: "Wed", rate: 3.1 },
  { day: "Thu", rate: 1.2 },
  { day: "Fri", rate: 2.9 },
  { day: "Sat", rate: 0.8 },
  { day: "Sun", rate: 1.1 },
];

const chartConfig = {
  rate: {
    label: "Refund Rate %",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function RefundReturnRateChart() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Expense Velocity</CardTitle>
          <CardDescription>Daily outflow rate index</CardDescription>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          1.8% Avg
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={returnData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="rate" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default RefundReturnRateChart;
