"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolTypeForm } from "@/components/tool-types/ToolTypeForm";
import { CheckFieldBuilder } from "@/components/tool-types/CheckFieldBuilder";
import { PartBuilder } from "@/components/tool-types/PartBuilder";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createToolType } from "@/lib/firestore";
import type { CheckField, Part } from "@/types";

export default function NovyTypPage() {
  const router = useRouter();
  const [checkFields, setCheckFields] = useState<CheckField[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [baseData, setBaseData] = useState<{
    name: string;
    description?: string;
    revisionIntervalMonths: number;
  } | null>(null);

  const handleBaseSubmit = async (data: {
    name: string;
    description?: string;
    revisionIntervalMonths: number;
  }) => {
    setBaseData(data);
  };

  const handleSave = async () => {
    if (!baseData) {
      toast.error("Nejprve vyplňte základní informace");
      return;
    }
    try {
      const id = await createToolType({
        ...baseData,
        checkFields,
        parts,
      });
      toast.success("Typ nástroje byl vytvořen");
      router.push(`/typy-nastroju/${id}/upravit`);
    } catch {
      toast.error("Nepodařilo se vytvořit typ nástroje");
    }
  };

  return (
    <>
      <TopBar title="Nový typ nástroje" showBack />
      <PageWrapper>
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
              Základní informace
            </h2>
            <ToolTypeForm onSubmit={handleBaseSubmit} submitLabel="Potvrdit" />
            {baseData && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Základní informace uloženy
              </p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
              Kontrolní pole
            </h2>
            <CheckFieldBuilder fields={checkFields} onChange={setCheckFields} />
          </section>

          <Separator />

          <section>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
              Součásti (poškození / závady)
            </h2>
            <PartBuilder parts={parts} onChange={setParts} />
          </section>

          <Button
            onClick={handleSave}
            className="w-full h-12 text-base"
            disabled={!baseData}
          >
            Vytvořit typ nástroje
          </Button>
        </div>
      </PageWrapper>
    </>
  );
}
