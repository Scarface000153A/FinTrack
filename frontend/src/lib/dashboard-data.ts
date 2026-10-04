export type DashboardData = {
  currency: { code: string; symbol: string };
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
  };
  stats: {
    totalRevenue: number;
    totalRevenueDelta: number;
    transactionCount: number;
    transactionCountDelta: number;
    averageTransaction: number;
    averageTransactionDelta: number;
    savingsRate: number;
    savingsRateDelta: number;
  };
  comparisonLabel: string;
  series: Array<{
    date: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
    balance: number;
  }>;
  topCategories: Array<{
    name: string;
    amount: number;
    share: number;
  }>;
  expenseRatio: number;
  refundRatio: number;
};

export const EMPTY_DASHBOARD_DATA: DashboardData = {
  currency: { code: "INR", symbol: "₹" },
  totals: { income: 0, expenses: 0, balance: 0, savingsRate: 0 },
  stats: {
    totalRevenue: 0,
    totalRevenueDelta: 0,
    transactionCount: 0,
    transactionCountDelta: 0,
    averageTransaction: 0,
    averageTransactionDelta: 0,
    savingsRate: 0,
    savingsRateDelta: 0,
  },
  comparisonLabel: "vs prior 30 days",
  series: [],
  topCategories: [],
  expenseRatio: 0,
  refundRatio: 0,
};

export function formatMoney(value: number, symbol: string): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactMoney(value: number, symbol: string): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}${symbol}${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}${symbol}${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}${symbol}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}