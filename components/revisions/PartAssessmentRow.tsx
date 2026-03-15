"use client";

import { Textarea } from "@/components/ui/textarea";
import type { Part, PartResult } from "@/types";

interface PartAssessmentRowProps {
  part: Part;
  value: PartResult;
  onChange: (partId: string, result: PartResult) => void;
}

export function PartAssessmentRow({ part, value, onChange }: PartAssessmentRowProps) {
  const toggleIssue = (hasIssue: boolean) => {
    onChange(part.id, { hasIssue, note: hasIssue ? value.note : "" });
  };

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{part.name}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleIssue(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              !value.hasIssue
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Ano
          </button>
          <button
            type="button"
            onClick={() => toggleIssue(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              value.hasIssue
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Ne
          </button>
        </div>
      </div>
      {value.hasIssue && (
        <Textarea
          value={value.note ?? ""}
          onChange={(e) => onChange(part.id, { hasIssue: true, note: e.target.value })}
          placeholder="Popis závady…"
          rows={2}
          className="mt-2 text-sm"
        />
      )}
    </div>
  );
}
