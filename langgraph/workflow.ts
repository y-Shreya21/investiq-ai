import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { 
  researchNode, 
  financialNode, 
  marketNode, 
  riskNode, 
  thesisNode, 
  decisionNode 
} from "@/agents";
import { InvestmentReport } from "@/types";

// Construct the LangGraph State Graph with suffixed agent names to prevent state attribute conflicts
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("research_agent", researchNode)
  .addNode("financial_agent", financialNode)
  .addNode("market_agent", marketNode)
  .addNode("risk_agent", riskNode)
  .addNode("thesis_agent", thesisNode)
  .addNode("decision_agent", decisionNode)
  // Define execution path edges
  .addEdge(START, "research_agent")
  .addEdge("research_agent", "financial_agent")
  .addEdge("financial_agent", "market_agent")
  .addEdge("market_agent", "risk_agent")
  .addEdge("risk_agent", "thesis_agent")
  .addEdge("thesis_agent", "decision_agent")
  .addEdge("decision_agent", END);

// Compile the graph
export const appGraph = workflow.compile();

/**
 * Executes the full sequential investment research agent graph.
 * @param companyName Name of the company to analyze
 */
export async function runInvestmentAnalysis(companyName: string): Promise<InvestmentReport> {
  const initialState = {
    companyName: companyName,
    ticker: "",
    logs: []
  };

  const finalState = await appGraph.invoke(initialState);

  // Map the final state to our structured InvestmentReport interface
  return {
    company: finalState.overview?.name || companyName,
    ticker: finalState.overview?.ticker || "",
    score: finalState.decision?.score || 50,
    recommendation: finalState.decision?.recommendation || "HOLD",
    confidence: finalState.decision?.confidence || 75,
    overview: finalState.overview,
    financial_health: {
      revenueGrowth3Y: finalState.financials?.revenueGrowth3Y || 0,
      operatingMargin: finalState.financials?.operatingMargin || 0,
      debtToEquity: finalState.financials?.debtToEquity || 0,
      freeCashFlow: finalState.financials?.freeCashFlow || "$0B",
      dividendYield: finalState.financials?.dividendYield || 0,
      metricsHistory: finalState.financials?.metricsHistory || []
    },
    market_position: finalState.market || {
      competitors: [],
      marketSize: "",
      marketShare: 0,
      industryTrends: []
    },
    risks: finalState.risks || {
      riskFactors: [],
      regulatoryIssues: [],
      riskScore: 50,
      categories: { financial: 50, market: 50, regulatory: 50, valuation: 50, competitive: 50 }
    },
    bull_case: finalState.thesis?.bullCase || [],
    bear_case: finalState.thesis?.bearCase || [],
    final_reasoning: finalState.decision?.reasoning || "",
    analyzedAt: new Date().toISOString()
  };
}
