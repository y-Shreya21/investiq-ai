import { Annotation } from "@langchain/langgraph";
import { 
  CompanyOverview, 
  FinancialHealth, 
  MarketPosition, 
  RiskAnalysis, 
  InvestmentThesis, 
  FinalRecommendation 
} from "@/types";

export interface WorkflowStageLog {
  stage: "research" | "financial" | "market" | "risk" | "thesis" | "decision";
  timestamp: string;
  message: string;
  data?: unknown;
}

export const AgentStateAnnotation = Annotation.Root({
  companyName: Annotation<string>(),
  ticker: Annotation<string>(),
  overview: Annotation<CompanyOverview>(),
  financials: Annotation<FinancialHealth>(),
  market: Annotation<MarketPosition>(),
  risks: Annotation<RiskAnalysis>(),
  thesis: Annotation<InvestmentThesis>(),
  decision: Annotation<FinalRecommendation>(),
  logs: Annotation<WorkflowStageLog[]>({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),
});

export type AgentStateType = typeof AgentStateAnnotation.State;
