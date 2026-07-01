"use client";

import React, { useEffect, useState } from "react";

interface GaugeChartProps {
  score: number;
  recommendation: "INVEST" | "HOLD" | "PASS";
}

export function GaugeChart({ score, recommendation }: GaugeChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1200; // ms
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const ease = progress * (2 - progress);
      setAnimatedScore(Math.round(ease * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  // Determine colors based on rating
  const colorMap = {
    INVEST: {
      text: "text-emerald-500",
      stroke: "stroke-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/20",
      gradient: ["#10b981", "#059669"] // emerald-500 to emerald-600
    },
    HOLD: {
      text: "text-amber-500",
      stroke: "stroke-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20",
      gradient: ["#f59e0b", "#d97706"] // amber-500 to amber-600
    },
    PASS: {
      text: "text-rose-500",
      stroke: "stroke-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-rose-500/20",
      gradient: ["#f43f5e", "#e11d48"] // rose-500 to rose-600
    }
  };

  const currentTheme = colorMap[recommendation] || colorMap.HOLD;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow Effect */}
        <div className={`absolute inset-4 rounded-full filter blur-xl opacity-20 ${currentTheme.bg}`} />
        
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-900 fill-none"
            strokeWidth="10"
          />
          {/* Animated Value Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`fill-none transition-all duration-300 ease-out ${currentTheme.stroke}`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Text Label */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {animatedScore}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Score
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
            {recommendation}
          </span>
        </div>
      </div>
    </div>
  );
}
