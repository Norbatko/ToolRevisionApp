import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Revision } from "@/types";

interface RevisionCardProps {
  revision: Revision;
  toolId: string;
}

export function RevisionCard({ revision, toolId }: RevisionCardProps) {
  return (
    <Link href={`/nastroje/${toolId}/revize/${revision.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {formatDate(revision.revisionDate)}
              </span>
              <Badge
                variant="outline"
                className={
                  revision.overallResult === "splňuje"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {revision.overallResult === "splňuje" ? "Splňuje" : "Nesplňuje"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{revision.technicianName}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
