"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Trash2, ArrowUpRight, HelpCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WatchlistItem, HistoryItem } from "@/types";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Read local data
    const localWatchlist = localStorage.getItem("watchlist");
    if (localWatchlist) {
      setTimeout(() => {
        setWatchlist(JSON.parse(localWatchlist));
      }, 0);
    }
    
    const localHistory = localStorage.getItem("investment-history");
    if (localHistory) {
      setTimeout(() => {
        setHistoryList(JSON.parse(localHistory));
      }, 0);
    }
  }, []);

  const handleRemoveFromWatchlist = (ticker: string) => {
    const updated = watchlist.filter(item => item.ticker !== ticker);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your analysis history?")) {
      setHistoryList([]);
      localStorage.removeItem("investment-history");
    }
  };

  const getRecommendationVariant = (rec: "INVEST" | "HOLD" | "PASS") => {
    if (rec === "INVEST") return "success";
    if (rec === "HOLD") return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 text-center md:text-left max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
          Investment Watchlist & History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Manage your saved watchlists and view past analysis reports. Saved watchlist metrics persist locally in your browser workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Watchlist Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Watchlist Items ({watchlist.length})
            </h2>
          </div>

          {watchlist.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                <HelpCircle className="w-8 h-8 text-slate-350 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-550 dark:text-slate-400">Your watchlist is empty.</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Run an analysis and click &apos;Add to Watchlist&apos; to pin a company here.</p>
                <Link href="/">
                  <Button className="h-9 text-xs font-semibold cursor-pointer">
                    Go to Terminal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item) => (
                <Card key={item.ticker} className="overflow-hidden border border-slate-200/60 dark:border-slate-850 bg-white/70 dark:bg-slate-950/40 hover:scale-[1.01] active:scale-[0.99]">
                  <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
                    
                    {/* Header info */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">
                            {item.name}
                          </h4>
                          <Badge variant="outline" className="text-[9px] font-mono">{item.ticker}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveFromWatchlist(item.ticker)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stats & Link */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900/60 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block uppercase font-semibold">Verdict</span>
                          <Badge variant={getRecommendationVariant(item.recommendation)} className="text-[10px] font-bold">
                            {item.recommendation}
                          </Badge>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block uppercase font-semibold">Score</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{item.score}/100</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block uppercase font-semibold">Price</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">${item.price}</span>
                        </div>
                      </div>

                      <Link href={`/?ticker=${item.ticker}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-600 font-bold cursor-pointer">
                          Analyze
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* History Sidebar Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Analysis History ({historyList.length})
            </h2>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              {historyList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No historical analyses.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-900/60 max-h-[460px] overflow-y-auto scrollbar-thin">
                  {historyList.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 flex justify-between items-center first:pt-0 last:pb-0"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          Analyzed {new Date(item.analyzedAt).toLocaleDateString()} at {new Date(item.analyzedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.recommendation === "INVEST" ? "bg-emerald-500/10 text-emerald-500" :
                          item.recommendation === "HOLD" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {item.recommendation}
                        </span>
                        <Link href={`/?ticker=${item.ticker}`}>
                          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
