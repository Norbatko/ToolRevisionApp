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
import { useStations } from "@/hooks/useStations";
import type { Tool, ToolStatus } from "@/types";

export default function NastrojePage() {
  const { tools, loading } = useTools();
  const { stations } = useStations();
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
          t.model.toLowerCase().includes(q) ||
          t.serialNumber.toLowerCase().includes(q) ||
          t.toolTypeName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tools, activeFilter, searchQuery]);

  // Group tools by station when stations exist
  const grouped = useMemo(() => {
    if (stations.length === 0) return null;

    const groups: { id: string | null; name: string; tools: Tool[] }[] = stations.map((s) => ({
      id: s.id,
      name: s.name,
      tools: filtered.filter((t) => t.stationId === s.id),
    }));

    const unassigned = filtered.filter((t) => !t.stationId);
    if (unassigned.length > 0) {
      groups.push({ id: null, name: "Bez základny", tools: unassigned });
    }

    return groups.filter((g) => g.tools.length > 0);
  }, [filtered, stations]);

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
          ) : grouped ? (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.id ?? "__unassigned"}>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                    {group.name}
                  </h2>
                  <div className="space-y-2">
                    {group.tools.map((tool) => (
                      <div key={tool.id} className="space-y-3">
                        <ToolCard key={tool.id} tool={tool} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((tool) => (
                <div key={tool.id} className="space-y-3">
                  <ToolCard key={tool.id} tool={tool} />
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
