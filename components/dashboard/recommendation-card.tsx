import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface RecommendationCardProps {
  companyName: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  score: number;
  confidence: number;
  reasoning: string;
  bullCase: string[];
  bearCase: string[];
}

export function RecommendationCard({
  recommendation,
  score,
  confidence,
  reasoning,
  bullCase,
  bearCase
}: RecommendationCardProps) {
  
  const themeMap = {
    INVEST: {
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      label: "Invest"
    },
    HOLD: {
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Watchlist"
    },
    PASS: {
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      label: "Pass"
    }
  };

  const theme = themeMap[recommendation] || themeMap.HOLD;

  return (
    <div className="space-y-6">
      {/* Overview Highlight */}
      <Card className={`border-l-4 ${recommendation === 'INVEST' ? 'border-l-emerald-500' : recommendation === 'HOLD' ? 'border-l-amber-500' : 'border-l-rose-500'}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Investment Committee Review
            </CardTitle>
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${theme.bg} ${theme.color} border ${theme.border}`}>
              {theme.label}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {reasoning}
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-900/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Decision Score:</span>
              <span className={`font-bold ${theme.color}`}>{score}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Investment Confidence Index:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{confidence}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bull and Bear Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bull Case */}
        <Card className="border border-slate-200/50 dark:border-slate-800/50">
          <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-t-xl border-b border-slate-100 dark:border-slate-900/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              Bull Case (Growth Moats)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {bullCase.map((bullet, idx) => (
                <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  <span className="mt-0.5 text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Bear Case */}
        <Card className="border border-slate-200/50 dark:border-slate-800/50">
          <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-t-xl border-b border-slate-100 dark:border-slate-900/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
              Bear Case (Key Concerns)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {bearCase.map((bullet, idx) => (
                <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  <span className="mt-0.5 text-rose-500 font-bold shrink-0">⚠</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
