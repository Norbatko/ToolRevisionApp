import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToolStatusBadge } from "@/components/tools/ToolStatusBadge";
import { formatDate } from "@/lib/utils";
import { daysUntilRevision } from "@/lib/status";
import type { Tool } from "@/types";

export function ToolCard({ tool }: { tool: Tool }) {
  const days = daysUntilRevision(tool.nextRevisionDate);

  return (
    <Link href={`/nastroje/${tool.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">{tool.identifier}</span>
              <ToolStatusBadge status={tool.status} />
            </div>
            <p className="text-xs text-gray-500 truncate">
              {tool.toolTypeName} · {tool.model} · SN: {tool.serialNumber}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tool.status === "never_revised"
                ? "Zatím nerevidováno"
                : days === null
                ? "—"
                : days < 0
                ? `Po termínu o ${Math.abs(days)} dní`
                : days === 0
                ? "Dnes"
                : `Příští revize za ${days} dní (${formatDate(tool.nextRevisionDate)})`}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        </div>
      </Card>
    </Link>
  );
}
