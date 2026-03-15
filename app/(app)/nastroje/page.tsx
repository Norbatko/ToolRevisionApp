"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolFilterBar } from "@/components/tools/ToolFilterBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTools } from "@/hooks/useTools";
import type { ToolStatus } from "@/types";

export default function NastrojePage() {
  const { tools, loading } = useTools();
  const [activeFilter, setActiveFilter] = useState<ToolStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = tools;
    if (activeFilter !== "all") {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.identifier.toLowerCase().includes(q) ||
          t.model.toLowerCase().includes(q) ||
          t.serialNumber.toLowerCase().includes(q) ||
          t.toolTypeName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tools, activeFilter, searchQuery]);

  return (
    <>
      <TopBar
        title="Nástroje"
        rightElement={
          <Link href="/nastroje/novy">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Přidat
            </Button>
          </Link>
        }
      />
      <PageWrapper>
        <div className="space-y-4">
          <ToolFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              {tools.length === 0
                ? "Zatím žádné nástroje. Přidejte první nástroj."
                : "Žádné výsledky pro zadané filtry."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
