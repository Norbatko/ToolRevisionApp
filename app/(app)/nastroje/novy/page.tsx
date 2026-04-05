"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolForm } from "@/components/tools/ToolForm";
import { useToolTypes } from "@/hooks/useToolTypes";
import { useStations } from "@/hooks/useStations";
import { createTool } from "@/lib/firestore";
import type { ToolInput } from "@/types";

export default function NovyNastrojPage() {
  const router = useRouter();
  const { toolTypes, loading } = useToolTypes();
  const { stations } = useStations();

  const handleSubmit = async (data: ToolInput) => {
    try {
      const id = await createTool(data);
      toast.success("Nástroj byl přidán");
      router.replace(`/nastroje/${id}`);
    } catch {
      toast.error("Nepodařilo se uložit nástroj");
    }
  };

  return (
    <>
      <TopBar title="Nový nástroj" showBack />
      <PageWrapper>
        {loading ? (
          <p className="text-gray-400 text-sm">Načítám typy nástrojů…</p>
        ) : toolTypes.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nejprve vytvořte alespoň jeden typ nástroje v sekci Typy.
          </p>
        ) : (
          <ToolForm
            toolTypes={toolTypes}
            stations={stations}
            onSubmit={handleSubmit}
            submitLabel="Přidat nástroj"
          />
        )}
      </PageWrapper>
    </>
  );
}
