"use client";

import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatusSummaryCards } from "@/components/dashboard/StatusSummaryCards";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { Skeleton } from "@/components/ui/skeleton";
import { useTools } from "@/hooks/useTools";

export default function DashboardPage() {
  const { tools, loading } = useTools();

  return (
    <>
      <TopBar title="Přehled" />
      <PageWrapper>
        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-4 w-32 mt-4" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-6">
            <StatusSummaryCards tools={tools} />
            <div>
              <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
                Vyžadují pozornost
              </h2>
              <AttentionList tools={tools} />
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
}
