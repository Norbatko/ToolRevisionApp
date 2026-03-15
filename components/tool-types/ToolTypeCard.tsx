import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ToolType } from "@/types";

export function ToolTypeCard({ toolType }: { toolType: ToolType }) {
  return (
    <Link href={`/typy-nastroju/${toolType.id}/upravit`}>
      <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{toolType.name}</p>
            {toolType.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{toolType.description}</p>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Revize každých {toolType.revisionIntervalMonths} měsíců</span>
              <span className="mx-1">·</span>
              <span>{toolType.checkFields.length} polí</span>
              <span className="mx-1">·</span>
              <span>{toolType.parts.length} součástí</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
