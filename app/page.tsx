"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  Check, 
  History, 
  ArrowUpRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GaugeChart } from "@/components/dashboard/gauge-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RiskRadar } from "@/components/dashboard/risk-radar";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { TraceStepper } from "@/components/dashboard/trace-stepper";
import { PDFExporter } from "@/components/pdf-exporter";
import { InvestmentReport, WatchlistItem, HistoryItem, CompanyOverview, FinancialHealth, MarketPosition, RiskAnalysis, InvestmentThesis, FinalRecommendation } from "@/types";
import { WorkflowStageLog } from "@/langgraph/state";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [traceLogs, setTraceLogs] = useState<WorkflowStageLog[]>([]);
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Sample quick-selection companies
  const suggestions = [
    { name: "Apple", ticker: "AAPL" },
    { name: "Tesla", ticker: "TSLA" },
    { name: "Nvidia", ticker: "NVDA" },
    { name: "Microsoft", ticker: "MSFT" }
  ];

  useEffect(() => {
    // Load search history from localstorage
    const localHistory = localStorage.getItem("investment-history");
    if (localHistory) {
      setTimeout(() => {
        setHistory(JSON.parse(localHistory).slice(0, 5));
      }, 0);
    }
  }, [report]);

  const handleSuggestionClick = (name: string) => {
    setInput(name);
    setError(null);
  };

  const handleReset = () => {
    setInput("");
    setReport(null);
    setTraceLogs([]);
    setActiveStep(0);
    setError(null);
    setIsLoading(false);
  };

  // Watchlist membership check
  useEffect(() => {
    if (report) {
      const watchlist: WatchlistItem[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const found = watchlist.some(item => item.ticker === report.ticker);
      setTimeout(() => {
        setInWatchlist(found);
      }, 0);
    }
  }, [report]);

  const toggleWatchlist = () => {
    if (!report) return;
    const watchlist: WatchlistItem[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
    
    if (inWatchlist) {
      const updated = watchlist.filter(item => item.ticker !== report.ticker);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setInWatchlist(false);
    } else {
      const newItem: WatchlistItem = {
        ticker: report.ticker,
        name: report.overview.name,
        recommendation: report.recommendation,
        score: report.score,
        price: report.overview.price,
        addedAt: new Date().toISOString()
      };
      watchlist.push(newItem);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setInWatchlist(true);
    }
  };

  const saveToHistory = (finalReport: InvestmentReport) => {
    const localHistory: HistoryItem[] = JSON.parse(localStorage.getItem("investment-history") || "[]");
    const updated = [
      {
        ticker: finalReport.ticker,
        name: finalReport.overview.name,
        recommendation: finalReport.recommendation,
        score: finalReport.score,
        analyzedAt: new Date().toISOString()
      },
      ...localHistory.filter(item => item.ticker !== finalReport.ticker)
    ].slice(0, 15);
    localStorage.setItem("investment-history", JSON.stringify(updated));
  };

  const triggerAnalysis = async (companyName: string) => {
    if (!companyName.trim()) return;

    setIsLoading(true);
    setError(null);
    setReport(null);
    setTraceLogs([]);
    setActiveStep(1); // Research stage is active

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName })
      });

      if (!response.ok) {
        throw new Error("Failed to initialize research backend stream");
      }

      if (!response.body) {
        throw new Error("No stream content returned from analysis route");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      let finalOverview: CompanyOverview | null = null;
      let finalFinancials: FinancialHealth | null = null;
      let finalMarket: MarketPosition | null = null;
      let finalRisks: RiskAnalysis | null = null;
      let finalThesis: InvestmentThesis | null = null;
      let finalDecision: FinalRecommendation | null = null;
      const stepLogs: WorkflowStageLog[] = [];

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const parts = buffer.split("\n\n");
          
          // The last element is empty or partial, keep it in the buffer
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const rawData = part.slice(6);
              try {
                const parsed = JSON.parse(rawData);
                
                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.status === "done") {
                  // Compile everything into final report
                  const completedReport: InvestmentReport = {
                    company: finalOverview?.name || companyName,
                    ticker: finalOverview?.ticker || "",
                    score: finalDecision?.score || 50,
                    recommendation: finalDecision?.recommendation || "HOLD",
                    confidence: finalDecision?.confidence || 75,
                    overview: finalOverview || {
                      name: companyName,
                      ticker: "",
                      sector: "Unknown",
                      industry: "Unknown",
                      description: "No data retrieved",
                      price: 0,
                      marketCap: "$0B",
                      peRatio: 0
                    },
                    financial_health: {
                      revenueGrowth3Y: finalFinancials?.revenueGrowth3Y || 0,
                      operatingMargin: finalFinancials?.operatingMargin || 0,
                      debtToEquity: finalFinancials?.debtToEquity || 0,
                      freeCashFlow: finalFinancials?.freeCashFlow || "$0B",
                      dividendYield: finalFinancials?.dividendYield || 0,
                      metricsHistory: finalFinancials?.metricsHistory || []
                    },
                    market_position: finalMarket || { competitors: [], marketSize: "", marketShare: 0, industryTrends: [] },
                    risks: finalRisks || { riskFactors: [], regulatoryIssues: [], riskScore: 50, categories: { financial: 50, market: 50, regulatory: 50, valuation: 50, competitive: 50 } },
                    bull_case: finalThesis?.bullCase || [],
                    bear_case: finalThesis?.bearCase || [],
                    final_reasoning: finalDecision?.reasoning || "",
                    analyzedAt: new Date().toISOString()
                  };
                  
                  setReport(completedReport);
                  saveToHistory(completedReport);
                  setIsLoading(false);
                  break;
                }

                // Process individual stage update chunks
                const { stage, data, logs } = parsed;
                if (logs && logs.length > 0) {
                  stepLogs.push(...logs);
                  setTraceLogs([...stepLogs]);
                }

                if (stage === "research") {
                  finalOverview = data.overview;
                  setActiveStep(2); // Next: financial
                } else if (stage === "financial") {
                  finalFinancials = data.financials;
                  setActiveStep(3); // Next: market
                } else if (stage === "market") {
                  finalMarket = data.market;
                  setActiveStep(4); // Next: risk
                } else if (stage === "risk") {
                  finalRisks = data.risks;
                  setActiveStep(5); // Next: thesis
                } else if (stage === "thesis") {
                  finalThesis = data.thesis;
                  setActiveStep(6); // Next: decision
                } else if (stage === "decision") {
                  finalDecision = data.decision;
                }

              } catch (parseErr) {
                console.error("Error parsing SSE chunk:", parseErr);
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Analysis execution error:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during analysis.";
      setError(errMsg);
      setIsLoading(false);
      setActiveStep(0);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryTicker = params.get("ticker");
      if (queryTicker) {
        setTimeout(() => {
          setInput(queryTicker);
          triggerAnalysis(queryTicker);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerAnalysis(input);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero / Form Section */}
      <div className="flex flex-col gap-4 text-center md:text-left max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
          Investment Intelligence Terminal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Provide a corporate entity name below. Our analytical framework evaluates financial performance, valuation metrics, market structures, and risk factors to compile a comprehensive investment recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Search Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              Company Analysis Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={runAnalysis} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter company name (e.g., Apple, Tesla, Nvidia, SpaceX)..."
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={isLoading} className="h-11 px-6 font-semibold min-w-[140px]">
                    Analyze Company
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="h-11 px-4 cursor-pointer">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-semibold mr-1">Suggestions:</span>
                {suggestions.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => handleSuggestionClick(item.name)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/30 text-slate-600 dark:text-slate-300 font-medium cursor-pointer transition-all duration-150 active:scale-95"
                  >
                    {item.name} ({item.ticker})
                  </button>
                ))}
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5 animate-slideUp">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Quick-Access Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Recent Terminal History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No recent searches. Try analyzing Apple!
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(item.name)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 dark:border-slate-900/50 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 flex justify-between items-center transition-all cursor-pointer text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-300">
                        {item.name} ({item.ticker})
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.recommendation === "INVEST" ? "bg-emerald-500/10 text-emerald-500" :
                        item.recommendation === "HOLD" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {item.recommendation}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading state Stepper display */}
      {(isLoading || traceLogs.length > 0) && !report && (
        <div className="max-w-3xl mx-auto py-6">
          <TraceStepper logs={traceLogs} activeStep={activeStep} isLoading={isLoading} />
        </div>
      )}

      {/* Completed Investment Report Dashboard */}
      {report && (
        <div className="space-y-6 pt-4 animate-slideUp">
          
          {/* Top Summary Ribbon */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/5 dark:bg-slate-900/20 p-4 border border-slate-200/50 dark:border-slate-900/60 rounded-xl">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {report.overview.name}
                </h2>
                <Badge variant="secondary" className="font-mono px-2 py-0.5 text-xs">
                  {report.overview.ticker}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {report.overview.sector}  •  {report.overview.industry}  •  Share Price: ${report.overview.price}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={inWatchlist ? "secondary" : "outline"}
                onClick={toggleWatchlist}
                className="flex items-center gap-1.5 h-10 px-4 text-xs font-semibold cursor-pointer"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    Saved to Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Watchlist
                  </>
                )}
              </Button>
              <PDFExporter report={report} />
            </div>
          </div>

          {/* Visual Grid: Gauges and Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Ring */}
            <Card className="flex flex-col justify-between h-[360px]">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Committee Verdict Gauge
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Aggregated rating computed by the consensus framework
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <GaugeChart score={report.score} recommendation={report.recommendation} />
              </CardContent>
            </Card>

            {/* Recharts Revenue growth */}
            <Card className="h-[360px] flex flex-col justify-between">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Revenue & Net Income Growth
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Historical and calculated fiscal indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <RevenueChart data={report.financial_health.metricsHistory} />
              </CardContent>
            </Card>

            {/* Recharts Risk Radar */}
            <Card className="h-[360px] flex flex-col justify-between">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Risk Category Exposure
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Vulnerability distribution across 5 dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <RiskRadar categories={report.risks.categories} />
              </CardContent>
            </Card>
          </div>

          {/* Financial details cards */}
          <MetricsGrid financials={report.financial_health} peRatio={report.overview.peRatio} />

          {/* Tabbed details + Research Workflow Console side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Tabbed report info */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <Tabs defaultValue="recommendation">
                  <TabsList className="mb-4">
                    <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="market">Market Position</TabsTrigger>
                    <TabsTrigger value="risks">Risk Factors</TabsTrigger>
                  </TabsList>

                  {/* Recommendation Tab */}
                  <TabsContent value="recommendation">
                    <RecommendationCard
                      companyName={report.company}
                      recommendation={report.recommendation}
                      score={report.score}
                      confidence={report.confidence}
                      reasoning={report.final_reasoning}
                      bullCase={report.bull_case}
                      bearCase={report.bear_case}
                    />
                  </TabsContent>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Business Profile</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {report.overview.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-900/60 text-xs">
                      <div>
                        <span className="text-slate-400 block">Sector</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{report.overview.sector}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Industry</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{report.overview.industry}</span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Market position Tab */}
                  <TabsContent value="market" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Competitive Landscape</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {report.market_position.competitors.map((comp, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-2 text-xs">
                          <span className="text-slate-400 block">Market Share</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{report.market_position.marketShare}%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Addressable Market & Trends</h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="text-slate-400 mr-2">TAM:</span> {report.market_position.marketSize}
                        </p>
                        <div className="space-y-1.5 pt-2">
                          <span className="text-slate-400 text-xs block">Key Trends:</span>
                          {report.market_position.industryTrends.map((trend, idx) => (
                            <div key={idx} className="flex gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="text-indigo-500 font-bold shrink-0">•</span>
                              <span>{trend}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Risks Tab */}
                  <TabsContent value="risks" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Business Risks</h4>
                        <div className="space-y-2">
                          {report.risks.riskFactors.map((risk, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="text-rose-500 font-bold shrink-0">⚠</span>
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Regulatory Oversight</h4>
                        <div className="space-y-2">
                          {report.risks.regulatoryIssues.map((reg, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="text-amber-500 font-bold shrink-0">⚬</span>
                              <span>{reg}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Stepper logs console (Step 1-6 Traceability) */}
            <div className="lg:col-span-1">
              <TraceStepper logs={traceLogs} activeStep={6} isLoading={false} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
