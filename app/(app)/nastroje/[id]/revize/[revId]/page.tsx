"use client";

import { use, useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RevisionPrintView } from "@/components/revisions/RevisionPrintView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRevisionById, getToolById, getToolTypeById } from "@/lib/firestore";
import type { Revision, Tool, ToolType } from "@/types";

export default function RevizeDetailPage({
  params,
}: {
  params: Promise<{ id: string; revId: string }>;
}) {
  const { id, revId } = use(params);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [toolType, setToolType] = useState<ToolType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRevisionById(revId),
      getToolById(id),
    ]).then(async ([rev, t]) => {
      setRevision(rev);
      setTool(t);
      if (t) {
        const tt = await getToolTypeById(t.toolTypeId);
        setToolType(tt);
      }
      setLoading(false);
    });
  }, [id, revId]);

  return (
    <>
      <TopBar
        title="Detail revize"
        showBack
        rightElement={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 print:hidden"
          >
            <Printer className="w-4 h-4" />
            Tisknout
          </Button>
        }
      />
      <PageWrapper>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : !revision || !tool || !toolType ? (
          <p className="text-gray-400 text-sm">Revize nenalezena.</p>
        ) : (
          <div className="space-y-4 screen-content">
            {/* Screen summary header */}
            <div className="flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs text-gray-400">Nástroj</p>
                <p className="font-semibold">{tool.identifier}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  revision.overallResult === "splňuje"
                    ? "bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1"
                    : "bg-red-100 text-red-800 border-red-200 text-sm px-3 py-1"
                }
              >
                {revision.overallResult === "splňuje" ? "SPLŇUJE" : "NESPLŇUJE"}
              </Badge>
            </div>

            {/* Print-ready content */}
            <RevisionPrintView
              revision={revision}
              tool={tool}
              toolType={toolType}
            />
          </div>
        )}
      </PageWrapper>
    </>
  );
}
