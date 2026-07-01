"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { FinancialMetric } from "@/types";

interface RevenueChartProps {
  data: FinancialMetric[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format currency for axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}B`;
    return `$${value.toFixed(0)}B`;
  };

  const customTooltip = (props: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { active, payload, label } = props as any;
    if (active && payload && payload.length >= 2) {
      const revVal = payload[0].value;
      const netVal = payload[1].value;
      const rev = typeof revVal === "number" ? revVal : 0;
      const net = typeof netVal === "number" ? netVal : 0;

      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-xl backdrop-blur-sm text-xs">
          <p className="font-bold text-slate-100 mb-2">Fiscal Year {label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-teal-400">Total Revenue:</span>
              <span className="font-semibold text-slate-200">${rev.toFixed(2)}B</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-emerald-400">Net Income:</span>
              <span className="font-semibold text-slate-200">${net.toFixed(2)}B</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-slate-200/50 dark:stroke-slate-800/40"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={customTooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
          />
          <Area
            name="Revenue"
            type="monotone"
            dataKey="revenue"
            fill="url(#revenueGrad)"
            stroke="#2dd4bf"
            strokeWidth={2}
          />
          <Bar
            name="Net Income"
            dataKey="netIncome"
            fill="url(#incomeGrad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
