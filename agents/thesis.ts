import { WorkflowStageLog } from "@/langgraph/state";
import { getFinancialData } from "@/lib/services/finance-api";
import { getLLM, isLLMConfigured } from "@/lib/services/llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { CompanyOverview } from "@/types";

export async function thesisNode(state: { ticker: string; overview: CompanyOverview }) {
  console.log(`[Executive Report Generator] Synthesizing growth catalysts and vulnerabilities for: ${state.ticker}`);
  const profile = await getFinancialData(state.ticker);

  let bullSummary = profile.bullCase.join(". ");
  let bearSummary = profile.bearCase.join(". ");

  if (isLLMConfigured()) {
    const llm = getLLM();
    if (llm) {
      try {
        const bullResp = await llm.invoke([
          new SystemMessage("You are an equity research analyst. Provide the top 3 core bullet points for the bull case of investing in this company."),
          new HumanMessage(`Company: ${state.overview.name}\nDescription: ${state.overview.description}`)
        ]);
        const bearResp = await llm.invoke([
          new SystemMessage("You are an equity research analyst. Provide the top 3 core bullet points for the bear case of investing in this company."),
          new HumanMessage(`Company: ${state.overview.name}\nDescription: ${state.overview.description}`)
        ]);
        
        bullSummary = bullResp.content.toString();
        bearSummary = bearResp.content.toString();
      } catch (err) {
        console.error("LLM thesisNode error, using fallback", err);
      }
    }
  }

  const log: WorkflowStageLog = {
    stage: "thesis",
    timestamp: new Date().toLocaleTimeString(),
    message: "Executive Report Generator drafted comprehensive Bull Case and Bear Case narratives.",
    data: {
      bullCase: profile.bullCase,
      bearCase: profile.bearCase,
      bullSummary,
      bearSummary
    }
  };

  return {
    thesis: {
      bullCase: profile.bullCase,
      bearCase: profile.bearCase
    },
    logs: [log]
  };
}
