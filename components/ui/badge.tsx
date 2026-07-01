import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
        {
          "bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 border-transparent":
            variant === "default",
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-transparent":
            variant === "secondary",
          "text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800":
            variant === "outline",
          // success (INVEST)
          "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30":
            variant === "success",
          // warning (HOLD)
          "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30":
            variant === "warning",
          // destructive (PASS)
          "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30":
            variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
