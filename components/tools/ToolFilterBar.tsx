"use client";

import { cn, statusLabel, statusColor } from "@/lib/utils";
import type { ToolStatus } from "@/types";

const STATUS_FILTERS: { value: ToolStatus | "all"; label: string }[] = [
  { value: "all", label: "Vše" },
  { value: "overdue", label: statusLabel("overdue") },
  { value: "due_soon", label: statusLabel("due_soon") },
  { value: "ok", label: statusLabel("ok") },
  { value: "never_revised", label: statusLabel("never_revised") },
];

interface ToolFilterBarProps {
  activeFilter: ToolStatus | "all";
  onFilterChange: (filter: ToolStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ToolFilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ToolFilterBarProps) {
  return (
    <div className="space-y-3">
      <input
        type="search"
        placeholder="Hledat nástroj…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeFilter === value
                ? value === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : statusColor(value as ToolStatus)
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
