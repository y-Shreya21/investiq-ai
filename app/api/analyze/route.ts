import { NextRequest } from "next/server";
import { appGraph } from "@/langgraph/workflow";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json();
    
    if (!companyName || typeof companyName !== "string" || companyName.trim() === "") {
      return new Response(JSON.stringify({ error: "Company name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const initialState = {
            companyName: companyName.trim(),
            ticker: "",
            logs: []
          };

          // Run LangGraph stream mode: "updates" to intercept each node resolution
          const eventStream = await appGraph.stream(initialState, { streamMode: "updates" });
          
          for await (const chunk of eventStream) {
            // chunk is e.g. { research_agent: { ticker: 'AAPL', ... } }
            const nodeName = Object.keys(chunk)[0];
            const cleanAgentName = nodeName.replace("_agent", "");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData = (chunk as any)[nodeName];
            
            // Format as SSE chunk
            const dataPayload = {
              stage: cleanAgentName,
              status: "completed",
              logs: updateData.logs || [],
              data: updateData
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(dataPayload)}\n\n`));
          }
          
          // Stream a finalized completion event containing instructions
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "done" })}\n\n`));
          controller.close();
        } catch (err: unknown) {
          console.error("Error in LangGraph streaming API:", err);
          const errMsg = err instanceof Error ? err.message : "Execution error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("API Analyze handler crash:", err);
    const errMsg = err instanceof Error ? err.message : "Server Error";
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
