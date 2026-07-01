"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Circle, 
  ChevronRight, 
  ChevronDown, 
  Code 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowStageLog } from "@/langgraph/state";

interface TraceStepperProps {
  logs: WorkflowStageLog[];
  activeStep: number; // 0: idle, 1-6: active
  isLoading: boolean;
}

export function TraceStepper({ logs, activeStep, isLoading }: TraceStepperProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const steps = [
    {
      id: "research",
      num: 1,
      title: "Research & Evidence Layer",
      desc: "Baseline data collation & pricing indexes",
    },
    {
      id: "financial",
      num: 2,
      title: "Financial Analysis Engine",
      desc: "Growth matrices, margins & leverage audits",
    },
    {
      id: "market",
      num: 3,
      title: "Market Intelligence Module",
      desc: "TAM scale & market share estimates",
    },
    {
      id: "risk",
      num: 4,
      title: "Risk Assessment Engine",
      desc: "Compliance & fundamental exposure models",
    },
    {
      id: "thesis",
      num: 5,
      title: "Executive Report Generator",
      desc: "Bull case drivers & bear case indicators",
    },
    {
      id: "decision",
      num: 6,
      title: "Investment Committee Review",
      desc: "Consensus scoring & final committee recommendation",
    }
  ];

  const getStepStatus = (stepId: string, idx: number) => {
    const log = logs.find(l => l.stage === stepId);
    if (log) return "completed";
    if (isLoading && activeStep === idx + 1) return "running";
    return "idle";
  };

  const toggleExpand = (stepId: string) => {
    if (expandedNode === stepId) {
      setExpandedNode(null);
    } else {
      setExpandedNode(stepId);
    }
  };

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono">
            Research Workflow Console
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 space-y-4 font-mono max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id, idx);
          const stepLog = logs.find(l => l.stage === step.id);
          const isExpanded = expandedNode === step.id;

          return (
            <div 
              key={step.id} 
              className={cn(
                "border rounded-lg transition-all duration-200",
                {
                  "border-slate-800 bg-slate-950/30": status === "idle",
                  "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5": status === "completed",
                  "border-indigo-500/40 bg-indigo-500/5 animate-pulse": status === "running"
                }
              )}
            >
              {/* Stepper Header Button */}
              <button
                type="button"
                onClick={() => status !== "idle" && toggleExpand(step.id)}
                disabled={status === "idle"}
                className={cn(
                  "w-full text-left p-3 flex items-center justify-between gap-3 select-none",
                  status !== "idle" ? "cursor-pointer hover:bg-slate-900/40" : "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Status Circle Icon */}
                  {status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {status === "running" && (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
                  )}
                  {status === "idle" && (
                    <Circle className="w-5 h-5 text-slate-700 shrink-0" />
                  )}

                  <div>
                    <h4 className={cn(
                      "text-xs font-bold",
                      {
                        "text-slate-500": status === "idle",
                        "text-slate-200": status === "running",
                        "text-emerald-400": status === "completed"
                      }
                    )}>
                      Stage {step.num}: {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>

                {status !== "idle" && (
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>

              {/* Collapsible Console Log and Data details */}
              {isExpanded && stepLog && (
                <div className="px-3 pb-3 border-t border-slate-800/80 pt-2 text-[11px] space-y-3 bg-slate-950/50">
                  {/* Message log */}
                  <div className="text-slate-300 leading-relaxed pl-1.5 border-l-2 border-slate-700">
                    <span className="text-slate-500 mr-2">[{stepLog.timestamp}]</span>
                    {stepLog.message}
                  </div>

                  {/* Summary parsed by node */}
                  {(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const logData = stepLog.data as any;
                    if (logData?.summary) {
                      return (
                        <div className="text-slate-400 pl-1.5 leading-relaxed">
                          <span className="text-indigo-400 font-semibold block mb-0.5">Section Evaluation Summary:</span>
                          {logData.summary}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Raw JSON Toggle Data */}
                  <div className="rounded border border-slate-800/60 overflow-hidden bg-slate-950/80">
                    <div className="bg-slate-900 px-2 py-1 flex items-center justify-between border-b border-slate-800/60">
                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                        <Code className="w-3.5 h-3.5" />
                        Underlying Ratios
                      </span>
                    </div>
                    <pre className="p-2 overflow-x-auto text-[9px] text-teal-400/90 max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
                      {JSON.stringify(stepLog.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
