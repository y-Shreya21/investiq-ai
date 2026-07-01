import { WorkflowStageLog } from "@/langgraph/state";
import { getFinancialData } from "@/lib/services/finance-api";
import { getLLM, isLLMConfigured } from "@/lib/services/llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { CompanyOverview } from "@/types";

export async function riskNode(state: { ticker: string; overview: CompanyOverview }) {
  console.log(`[Risk Assessment Engine] Measuring vulnerabilities and compliance factors for: ${state.ticker}`);
  const profile = await getFinancialData(state.ticker);

  let summary = `Identified key risks: ${profile.riskFactors.slice(0,2).join(", ")}. Regulatory concerns: ${profile.regulatoryIssues.slice(0,1).join("")}. Calculated Risk Score: ${profile.riskScore}/100.`;

  if (isLLMConfigured()) {
    const llm = getLLM();
    if (llm) {
      try {
        const response = await llm.invoke([
          new SystemMessage("You are a corporate risk manager. Summarize the major business, competitive, and regulatory risks in 2 sentences."),
          new HumanMessage(`Company: ${state.overview.name}\nRisk Factors: ${profile.riskFactors.join("; ")}\nRegulatory Issues: ${profile.regulatoryIssues.join("; ")}`)
        ]);
        summary = response.content.toString();
      } catch (err) {
        console.error("LLM riskNode error, using fallback", err);
      }
    }
  }

  const log: WorkflowStageLog = {
    stage: "risk",
    timestamp: new Date().toLocaleTimeString(),
    message: `Risk Assessment Engine calculated Risk Score of ${profile.riskScore}/100. Regulatory hurdles and competitive risks outlined.`,
    data: {
      riskFactors: profile.riskFactors,
      regulatoryIssues: profile.regulatoryIssues,
      riskScore: profile.riskScore,
      categories: profile.riskCategories,
      summary
    }
  };

  return {
    risks: {
      riskFactors: profile.riskFactors,
      regulatoryIssues: profile.regulatoryIssues,
      riskScore: profile.riskScore,
      categories: profile.riskCategories
    },
    logs: [log]
  };
}
