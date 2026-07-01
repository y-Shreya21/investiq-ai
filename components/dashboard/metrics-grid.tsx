import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  AlertTriangle, 
  Coins 
} from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface MetricsGridProps {
  financials: {
    revenueGrowth3Y: number;
    operatingMargin: number;
    debtToEquity: number;
    freeCashFlow: string;
    dividendYield: number;
  };
  peRatio: number;
}

export function MetricsGrid({ financials, peRatio }: MetricsGridProps) {
  const items = [
    {
      title: "Valuation (P/E)",
      value: peRatio ? `${peRatio}x` : "N/A",
      desc: peRatio > 45 ? "Premium Valuation" : peRatio > 25 ? "Moderate Premium" : "Value Territory",
      icon: BarChart3,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Revenue Growth (3Y)",
      value: formatPercent(financials.revenueGrowth3Y),
      desc: financials.revenueGrowth3Y > 20 ? "High Growth" : financials.revenueGrowth3Y > 5 ? "Moderate Growth" : "Stable/Low Growth",
      icon: TrendingUp,
      color: financials.revenueGrowth3Y > 0 ? "text-emerald-500" : "text-rose-500",
      bg: financials.revenueGrowth3Y > 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
    },
    {
      title: "Operating Margin",
      value: `${financials.operatingMargin}%`,
      desc: financials.operatingMargin > 25 ? "Highly Profitable" : financials.operatingMargin > 12 ? "Healthy Margins" : "Low Margin Sector",
      icon: Coins,
      color: "text-teal-500",
      bg: "bg-teal-500/10"
    },
    {
      title: "Debt to Equity Ratio",
      value: financials.debtToEquity.toFixed(2),
      desc: financials.debtToEquity > 1.5 ? "Leveraged Balance Sheet" : financials.debtToEquity > 0.6 ? "Moderate Debt" : "Conservative/Low Debt",
      icon: AlertTriangle,
      color: financials.debtToEquity > 1.5 ? "text-amber-500" : "text-slate-500",
      bg: financials.debtToEquity > 1.5 ? "bg-amber-500/10" : "bg-slate-500/10"
    },
    {
      title: "Free Cash Flow",
      value: financials.freeCashFlow,
      desc: "Annual liquidity generator",
      icon: Wallet,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="overflow-hidden hover:scale-[1.02] active:scale-[0.99]">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </span>
                <span className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <h4 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  {item.value}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {item.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
