import { WorkflowStageLog } from "@/langgraph/state";
import { getFinancialData } from "@/lib/services/finance-api";
import { getLLM, isLLMConfigured } from "@/lib/services/llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function researchNode(state: { companyName: string }) {
  console.log(`[Research & Evidence Layer] Initiating baseline audit for: ${state.companyName}`);
  const profile = await getFinancialData(state.companyName);
  
  let summary = `Collected core corporate data. Identified Ticker: ${profile.ticker}. Industry: ${profile.industry}. Current Price: $${profile.price}.`;
  
  if (isLLMConfigured()) {
    const llm = getLLM();
    if (llm) {
      try {
        const response = await llm.invoke([
          new SystemMessage("You are a professional equity research analyst. Summarize the business description and core operations of the company in 2-3 sentences."),
          new HumanMessage(`Company Name: ${profile.name}\nTicker: ${profile.ticker}\nDescription: ${profile.description}`)
        ]);
        summary = response.content.toString();
      } catch (err) {
        console.error("LLM researchNode error, using fallback", err);
      }
    }
  }

  const log: WorkflowStageLog = {
    stage: "research",
    timestamp: new Date().toLocaleTimeString(),
    message: `Research & Evidence Layer verified ${profile.name} (${profile.ticker}). Price: $${profile.price}. Sector: ${profile.sector}.`,
    data: {
      name: profile.name,
      ticker: profile.ticker,
      sector: profile.sector,
      industry: profile.industry,
      price: profile.price,
      marketCap: profile.marketCap,
      summary
    }
  };

  return {
    ticker: profile.ticker,
    overview: {
      name: profile.name,
      ticker: profile.ticker,
      sector: profile.sector,
      industry: profile.industry,
      description: profile.description,
      price: profile.price,
      marketCap: profile.marketCap,
      peRatio: profile.peRatio
    },
    logs: [log]
  };
}
