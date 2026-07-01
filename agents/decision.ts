import { WorkflowStageLog } from "@/langgraph/state";
import { getFinancialData } from "@/lib/services/finance-api";
import { getLLM, isLLMConfigured } from "@/lib/services/llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { 
  CompanyOverview, 
  FinancialHealth, 
  MarketPosition, 
  RiskAnalysis, 
  InvestmentThesis 
} from "@/types";

export async function decisionNode(state: { 
  ticker: string; 
  overview: CompanyOverview; 
  financials: FinancialHealth; 
  market: MarketPosition; 
  risks: RiskAnalysis; 
  thesis: InvestmentThesis; 
}) {
  console.log(`[Investment Committee Review] Synthesizing core metrics and final recommendations for: ${state.ticker}`);
  const profile = await getFinancialData(state.ticker);

  let recommendation = profile.recommendation;
  let score = profile.score;
  let confidence = profile.confidence; // Investment Confidence Index
  let finalReasoning = profile.reasoning;

  if (isLLMConfigured()) {
    const llm = getLLM();
    if (llm) {
      try {
        const response = await llm.invoke([
          new SystemMessage(`You are the Investment Committee Chair. Analyze the consolidated equity research data and make a final recommendation: INVEST, HOLD, or PASS.
Return a structured output with the following format:
RECOMMENDATION: [INVEST/HOLD/PASS]
SCORE: [0-100 rating based on investment safety]
CONFIDENCE: [0-100 rating based on data completeness]
REASONING: [detailed 3-sentence justification]`),
          new HumanMessage(`Company: ${state.overview.name}
Overview: ${JSON.stringify(state.overview)}
Financials: ${JSON.stringify(state.financials)}
Market: ${JSON.stringify(state.market)}
Risks: ${JSON.stringify(state.risks)}
Thesis: ${JSON.stringify(state.thesis)}`)
        ]);

        const text = response.content.toString();
        
        // Parse basic lines
        const recMatch = text.match(/RECOMMENDATION:\s*(INVEST|HOLD|PASS)/i);
        const scoreMatch = text.match(/SCORE:\s*(\d+)/);
        const confMatch = text.match(/CONFIDENCE:\s*(\d+)/);
        const reasonMatch = text.match(/REASONING:\s*([\s\S]*)/i);

        if (recMatch) recommendation = recMatch[1].toUpperCase() as "INVEST" | "HOLD" | "PASS";
        if (scoreMatch) score = parseInt(scoreMatch[1]);
        if (confMatch) confidence = parseInt(confMatch[1]);
        if (reasonMatch) finalReasoning = reasonMatch[1].trim();

      } catch (err) {
        console.error("LLM decisionNode error, using fallback", err);
      }
    }
  }

  const log: WorkflowStageLog = {
    stage: "decision",
    timestamp: new Date().toLocaleTimeString(),
    message: `Investment Committee Review completed consensus review. Recommendation: ${recommendation}, Score: ${score}/100, Confidence Index: ${confidence}%.`,
    data: {
      recommendation,
      score,
      confidence,
      finalReasoning
    }
  };

  return {
    decision: {
      recommendation,
      score,
      confidence,
      reasoning: finalReasoning
    },
    logs: [log]
  };
}
