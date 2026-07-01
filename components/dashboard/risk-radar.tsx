"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface RiskRadarProps {
  categories: {
    financial: number;
    market: number;
    regulatory: number;
    valuation: number;
    competitive: number;
  };
}

export function RiskRadar({ categories }: RiskRadarProps) {
  const data = [
    { subject: "Financial", value: categories.financial },
    { subject: "Market", value: categories.market },
    { subject: "Regulatory", value: categories.regulatory },
    { subject: "Valuation", value: categories.valuation },
    { subject: "Competitive", value: categories.competitive }
  ];

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid className="stroke-slate-200 dark:stroke-slate-800" />
          <PolarAngleAxis
            dataKey="subject"
            stroke="#94a3b8"
            fontSize={11}
            tick={{ fill: "#94a3b8" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#94a3b8"
            fontSize={9}
            tick={{ fill: "#94a3b8" }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Risk Exposure"
            dataKey="value"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
