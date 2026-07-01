"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TrendingUp, 
  Layers, 
  Star, 
  Sun, 
  Moon, 
  ShieldAlert 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Read local theme or default to dark (since finance terminals look amazing in dark mode!)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Terminal", href: "/", icon: TrendingUp },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "Compare", href: "/compare", icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent uppercase font-mono">
            InvestIQ Terminal
          </span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none",
                  {
                    "bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold border border-slate-200/50 dark:border-slate-800/30":
                      isActive,
                    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/30 border border-transparent":
                      !isActive
                  }
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Mobile Menu + Theme Switcher) */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 animate-fadeIn" />
            ) : (
              <Moon className="w-4 h-4 animate-fadeIn" />
            )}
          </button>

          {/* Simple Mobile Navigation icons for spacing */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all",
                    isActive && "text-emerald-500 dark:text-emerald-400 bg-slate-100 dark:bg-slate-900"
                  )}
                  title={item.name}
                >
                  <Icon className="w-4.5 h-4.5" />
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
