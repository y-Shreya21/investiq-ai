import { WorkflowStageLog } from "@/langgraph/state";
import { getFinancialData } from "@/lib/services/finance-api";
import { getLLM, isLLMConfigured } from "@/lib/services/llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { CompanyOverview } from "@/types";

export async function marketNode(state: { ticker: string; overview: CompanyOverview }) {
  console.log(`[Market Intelligence Module] Examining competition and industry trajectories for: ${state.ticker}`);
  const profile = await getFinancialData(state.ticker);

  let summary = `Competes in a ${profile.marketSize} with a calculated market share of ${profile.marketShare}%. Main rivals are ${profile.competitors.join(", ")}. Trends include AI/digital workflow shifts.`;

  if (isLLMConfigured()) {
    const llm = getLLM();
    if (llm) {
      try {
        const response = await llm.invoke([
          new SystemMessage("You are an equity market strategist. Analyze the competitive positioning, TAM size, and market share of the company. Summarize in 2 sentences."),
          new HumanMessage(`Company: ${state.overview.name}\nCompetitors: ${profile.competitors.join(", ")}\nTAM: ${profile.marketSize}\nShare: ${profile.marketShare}%`)
        ]);
        summary = response.content.toString();
      } catch (err) {
        console.error("LLM marketNode error, using fallback", err);
      }
    }
  }

  const log: WorkflowStageLog = {
    stage: "market",
    timestamp: new Date().toLocaleTimeString(),
    message: `Market Intelligence Module reviewed competition. Competitors: ${profile.competitors.length}. Market Share: ${profile.marketShare}%. TAM details registered.`,
    data: {
      competitors: profile.competitors,
      marketSize: profile.marketSize,
      marketShare: profile.marketShare,
      industryTrends: profile.industryTrends,
      summary
    }
  };

  return {
    market: {
      competitors: profile.competitors,
      marketSize: profile.marketSize,
      marketShare: profile.marketShare,
      industryTrends: profile.industryTrends
    },
    logs: [log]
  };
}
