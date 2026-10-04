import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";

const categories = [
  { name: "Housing & Rent", share: 38, amount: "$1,850", trend: "+2%" },
  { name: "Food & Dining", share: 22, amount: "$840", trend: "-5%" },
  { name: "Tech & Software", share: 18, amount: "$620", trend: "0%" },
  { name: "Investments", share: 14, amount: "$500", trend: "+12%" },
];

export function CategoryRankChart() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Category Ranking</CardTitle>
        <CardDescription>Top budget allocations this cycle</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-2">
        {categories.map((cat, idx) => (
          <Item key={cat.name} variant="outline" size="sm" className="justify-between">
            <ItemContent>
              <ItemTitle className="text-xs font-semibold">{cat.name}</ItemTitle>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${cat.share}%` }}
                />
              </div>
            </ItemContent>
            <ItemActions className="flex items-center gap-2 pl-3">
              <span className="text-xs font-mono font-bold">{cat.amount}</span>
              <Badge variant="outline" className="text-[10px] px-1.5">
                {cat.share}%
              </Badge>
            </ItemActions>
          </Item>
        ))}
      </CardContent>
    </Card>
  );
}

export default CategoryRankChart;
