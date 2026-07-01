"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateMockData } from "@/lib/services/finance-api";
import { formatPercent } from "@/lib/utils";
import { HistoryItem } from "@/types";

interface CompareItem {
  name: string;
  ticker: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  score: number;
  data: ReturnType<typeof generateMockData>;
}

export default function ComparePage() {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<CompareItem[]>([]);

  useEffect(() => {
    // Read history from localStorage
    const localHistory = localStorage.getItem("investment-history");
    if (localHistory) {
      const parsed = JSON.parse(localHistory) as HistoryItem[];
      // Deduplicate by ticker
      const deduped = parsed.filter(
        (item: HistoryItem, index: number, self: HistoryItem[]) =>
          self.findIndex((t: HistoryItem) => t.ticker === item.ticker) === index
      );
      setTimeout(() => {
        setHistoryList(deduped);
        // Pre-select first two if available
        if (deduped.length >= 2) {
          setSelectedTickers([deduped[0].ticker, deduped[1].ticker]);
        } else if (deduped.length === 1) {
          setSelectedTickers([deduped[0].ticker]);
        }
      }, 0);
    }
  }, []);

  // Fetch full data for compared tickers
  useEffect(() => {
    if (selectedTickers.length === 0) {
      setTimeout(() => {
        setCompareData([]);
      }, 0);
      return;
    }

    const compiled = selectedTickers.map(ticker => {
      // Get the profile from the mock database (which has all details instantly)
      const data = generateMockData(ticker);
      return {
        name: data.name,
        ticker: data.ticker,
        recommendation: data.recommendation,
        score: data.score,
        data: data
      };
    });

    setTimeout(() => {
      setCompareData(compiled);
    }, 0);
  }, [selectedTickers]);

  const handleCheckboxChange = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(selectedTickers.filter(t => t !== ticker));
    } else {
      if (selectedTickers.length >= 3) {
        alert("You can compare a maximum of 3 companies at a time.");
        return;
      }
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const getRecommendationVariant = (rec: "INVEST" | "HOLD" | "PASS") => {
    if (rec === "INVEST") return "success";
    if (rec === "HOLD") return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-4 text-center md:text-left max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
          Comparative Analysis Matrix
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Select up to 3 previously analyzed companies from the checklist below to contrast their financial metrics, score differentials, and risks side-by-side.
        </p>
      </div>

      {/* History Selector Grid */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900/60">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Select Companies to Compare ({selectedTickers.length}/3)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {historyList.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-4">
                No company analysis history found. Run a research analysis on the terminal first.
              </p>
              <Link href="/">
                <Button className="h-10 text-xs font-semibold">
                  Go to Terminal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {historyList.map((item) => {
                const isChecked = selectedTickers.includes(item.ticker);
                return (
                  <label
                    key={item.ticker}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                      isChecked
                        ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 text-slate-900 dark:text-white font-bold"
                        : "border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-350"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(item.ticker)}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>
                      {item.name} ({item.ticker})
                    </span>
                    <Badge variant={getRecommendationVariant(item.recommendation)} className="text-[10px]">
                      {item.recommendation}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Grid Table */}
      {compareData.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 shadow-sm bg-white dark:bg-slate-950/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-900">
                <th className="p-4 font-bold text-slate-400 uppercase tracking-wider w-1/4">Metric Comparison</th>
                {compareData.map((item) => (
                  <th key={item.ticker} className="p-4 w-1/4 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-[9px]">{item.ticker}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-400">{item.data.sector}</p>
                    </div>
                  </th>
                ))}
                {/* Empty column fillers if less than 3 selected */}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <th key={idx} className="p-4 w-1/4 opacity-25 text-slate-400 italic font-normal">
                    Slot available
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              
              {/* Recommendation row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Verdict Recommendation</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4">
                    <Badge variant={getRecommendationVariant(item.recommendation)} className="px-2.5 py-0.5 font-bold">
                      {item.recommendation}
                    </Badge>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Score row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Investment Score</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 font-bold text-sm">
                    <span className={
                      item.score > 75 ? "text-emerald-500" :
                      item.score < 58 ? "text-rose-500" : "text-amber-500"
                    }>
                      {item.score}/100
                    </span>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Share Price row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Share Price</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 font-medium text-slate-700 dark:text-slate-350">
                    ${item.data.price}
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Market Cap row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Market Capitalization</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400">
                    {item.data.marketCap}
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* P/E Ratio row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">P/E Ratio Valuation</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400">
                    {item.data.peRatio}x
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Revenue Growth row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">3Y Revenue Growth</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400">
                    {formatPercent(item.data.revenueGrowth3Y)}
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Margin row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Operating Margin</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400">
                    {item.data.operatingMargin}%
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Debt/Equity row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Debt to Equity Ratio</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400">
                    {item.data.debtToEquity.toFixed(2)}
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Risk Score row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Overall Risk Score</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 font-bold">
                    <span className={
                      item.data.riskScore > 60 ? "text-rose-500" :
                      item.data.riskScore < 35 ? "text-emerald-500" : "text-amber-500"
                    }>
                      {item.data.riskScore}/100
                    </span>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Bull Case row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Bull Case Highlight</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400 align-top max-w-[200px]">
                    <div className="flex gap-1">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <p className="line-clamp-4 leading-relaxed">{item.data.bullCase[0]}</p>
                    </div>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

              {/* Bear Case row */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Bear Case Highlight</td>
                {compareData.map((item) => (
                  <td key={item.ticker} className="p-4 text-slate-600 dark:text-slate-400 align-top max-w-[200px]">
                    <div className="flex gap-1">
                      <span className="text-rose-500 font-bold shrink-0">⚠</span>
                      <p className="line-clamp-4 leading-relaxed">{item.data.bearCase[0]}</p>
                    </div>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - compareData.length) }).map((_, idx) => (
                  <td key={idx} className="p-4" />
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-100/50 dark:bg-slate-900/20 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            Please select at least one company from the checklist above to start the side-by-side comparison.
          </p>
        </div>
      )}
    </div>
  );
}
