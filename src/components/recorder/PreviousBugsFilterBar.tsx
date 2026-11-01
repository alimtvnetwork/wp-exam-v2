import React from "react";
import { Search } from "lucide-react";

export interface PreviousBugsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = ["all", "UiGlitch", "InspectionDefect", "CrashOrError", "Performance"];

export function PreviousBugsFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: PreviousBugsFilterBarProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-3 bg-[#0a0e14]">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, session ID, route, or details..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-400 text-[11px] font-mono mr-1">Category:</span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
