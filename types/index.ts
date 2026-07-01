export interface CompanyOverview {
  name: string;
  ticker: string;
  sector: string;
  industry: string;
  description: string;
  price: number;
  marketCap: string;
  peRatio: number;
}

export interface FinancialMetric {
  year: string;
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
}

export interface FinancialHealth {
  revenueGrowth3Y: number; // percentage
  operatingMargin: number; // percentage
  debtToEquity: number;
  freeCashFlow: string; // e.g. "$45B"
  dividendYield: number; // percentage
  metricsHistory: FinancialMetric[];
}

export interface MarketPosition {
  competitors: string[];
  marketSize: string;
  marketShare: number; // percentage
  industryTrends: string[];
}

export interface RiskAnalysis {
  riskFactors: string[];
  regulatoryIssues: string[];
  riskScore: number; // 0-100
  categories: {
    financial: number;
    market: number;
    regulatory: number;
    valuation: number;
    competitive: number;
  };
}

export interface InvestmentThesis {
  bullCase: string[];
  bearCase: string[];
}

export interface FinalRecommendation {
  recommendation: "INVEST" | "HOLD" | "PASS";
  score: number; // 0-100
  confidence: number; // 0-100 (Investment Confidence Index)
  reasoning: string;
}

export interface InvestmentReport {
  company: string;
  ticker: string;
  score: number;
  recommendation: "INVEST" | "HOLD" | "PASS";
  confidence: number; // Investment Confidence Index
  overview: CompanyOverview;
  financial_health: FinancialHealth;
  market_position: MarketPosition;
  risks: RiskAnalysis;
  bull_case: string[];
  bear_case: string[];
  final_reasoning: string;
  analyzedAt: string;
}

// Analysis workflow stage interface
export interface WorkflowStageStep {
  stage: "research" | "financial" | "market" | "risk" | "thesis" | "decision";
  status: "idle" | "running" | "completed" | "error";
  output?: string;
  data?: unknown;
}

// LocalStorage Watchlist Item
export interface WatchlistItem {
  ticker: string;
  name: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  score: number;
  price: number;
  addedAt: string;
}

// LocalStorage History Item
export interface HistoryItem {
  ticker: string;
  name: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  score: number;
  analyzedAt: string;
}
