"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolStatusBadge } from "@/components/tools/ToolStatusBadge";
import { RevisionCard } from "@/components/revisions/RevisionCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToolDetail } from "@/hooks/useToolDetail";
import { useRevisions } from "@/hooks/useRevisions";
import { deleteTool } from "@/lib/firestore";
import { formatDate } from "@/lib/utils";
import { daysUntilRevision } from "@/lib/status";

export default function NastrojDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { tool, toolType, loading } = useToolDetail(id);
  const { revisions, loading: revisionsLoading } = useRevisions(id);

  const handleDelete = async () => {
    if (!confirm("Opravdu smazat tento nástroj? Tato akce je nevratná.")) return;
    try {
      await deleteTool(id);
      toast.success("Nástroj byl smazán");
      router.push("/nastroje");
    } catch {
      toast.error("Nepodařilo se smazat nástroj");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Nástroj" showBack />
        <PageWrapper>
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <TopBar title="Nástroj" showBack />
        <PageWrapper>
          <p className="text-gray-400 text-sm">Nástroj nenalezen.</p>
        </PageWrapper>
      </>
    );
  }

  const days = daysUntilRevision(tool.nextRevisionDate);

  return (
    <>
      <TopBar
        title={tool.serialNumber}
        showBack
        rightElement={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />
      <PageWrapper>
        <div className="space-y-5">
          {/* Tool info card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-base">{tool.serialNumber}</p>
                <p className="text-sm text-gray-500 mt-0.5">{tool.toolTypeName}</p>
              </div>
              <ToolStatusBadge status={tool.status} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Model</p>
                <p className="font-medium">{tool.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Sériové číslo</p>
                <p className="font-medium">{tool.serialNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Rok výroby</p>
                <p className="font-medium">{tool.yearOfManufacture}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Interval revize</p>
                <p className="font-medium">{toolType?.revisionIntervalMonths ?? "—"} měs.</p>
              </div>
            </div>
          </Card>

          {/* Revision countdown */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold">Revize</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Poslední revize</p>
                <p className="font-medium">{formatDate(tool.lastRevisionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Příští revize</p>
                <p className="font-medium">{formatDate(tool.nextRevisionDate)}</p>
              </div>
            </div>
            {days !== null && (
              <p
                className={`text-xs mt-2 font-medium ${
                  days < 0
                    ? "text-red-600"
                    : days <= 30
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {days < 0
                  ? `Po termínu o ${Math.abs(days)} dní`
                  : days === 0
                  ? "Revize je dnes"
                  : `Za ${days} dní`}
              </p>
            )}
          </Card>

          {/* New revision button */}
          <Link href={`/nastroje/${id}/revize/nova`}>
            <Button className="w-full gap-2 h-12 text-base">
              <Plus className="w-5 h-5" />
              Nová revize
            </Button>
          </Link>

          {/* Revision history */}
          <div>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
              Historie revizí
            </h2>
            {revisionsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : revisions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">
                Zatím žádné revize.
              </p>
            ) : (
              <div className="space-y-2">
                {revisions.map((rev) => (
                  <RevisionCard key={rev.id} revision={rev} toolId={id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
