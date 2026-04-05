"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RevisionForm } from "@/components/revisions/RevisionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolDetail } from "@/hooks/useToolDetail";
import { useAuth } from "@/hooks/useAuth";
import { createRevision } from "@/lib/firestore";
import type { RevisionInput } from "@/types";

export default function NovaRevizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { tool, toolType, loading } = useToolDetail(id);

  const handleSubmit = async (data: RevisionInput) => {
    if (!toolType) return;
    try {
      const revId = await createRevision(data, toolType.revisionIntervalMonths);
      toast.success("Revize byla uložena");
      router.push(`/nastroje/${id}/revize/${revId}`);
    } catch {
      toast.error("Nepodařilo se uložit revizi");
    }
  };

  return (
    <>
      <TopBar title="Nová revize" showBack />
      <PageWrapper>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : !tool || !toolType ? (
          <p className="text-gray-400 text-sm">Nástroj nenalezen.</p>
        ) : (
          <>
            {/* Tool info header */}
            <div className="mb-5 p-4 bg-blue-50 rounded-xl text-sm">
              <p className="text-gray-600 text-xs mt-0.5">
                {toolType.name} · {tool.model} · SN: {tool.serialNumber}
              </p>
            </div>
            <RevisionForm
              toolId={id}
              toolType={toolType}
              userId={user?.uid ?? ""}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </PageWrapper>
    </>
  );
}
