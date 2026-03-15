import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/types";

const STATUS_PRIORITY: Record<string, number> = {
  overdue: 0,
  due_soon: 1,
  never_revised: 2,
  ok: 3,
};

interface AttentionListProps {
  tools: Tool[];
}

export function AttentionList({ tools }: AttentionListProps) {
  const attention = tools
    .filter((t) => t.status !== "ok")
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  if (attention.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">✓</p>
        <p className="text-sm mt-1">Všechny nástroje jsou v pořádku</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attention.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
