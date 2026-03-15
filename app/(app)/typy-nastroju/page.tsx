"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolTypeCard } from "@/components/tool-types/ToolTypeCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolTypes } from "@/hooks/useToolTypes";

export default function TypyNastrojuPage() {
  const { toolTypes, loading } = useToolTypes();

  return (
    <>
      <TopBar
        title="Typy nástrojů"
        rightElement={
          <Link href="/typy-nastroju/novy">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Přidat
            </Button>
          </Link>
        }
      />
      <PageWrapper>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : toolTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              Zatím žádné typy nástrojů.
            </p>
            <Link href="/typy-nastroju/novy" className="mt-3 inline-block">
              <Button size="sm">Vytvořit první typ</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {toolTypes.map((tt) => (
              <ToolTypeCard key={tt.id} toolType={tt} />
            ))}
          </div>
        )}
      </PageWrapper>
    </>
  );
}
