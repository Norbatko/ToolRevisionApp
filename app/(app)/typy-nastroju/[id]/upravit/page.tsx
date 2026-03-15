"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ToolTypeForm } from "@/components/tool-types/ToolTypeForm";
import { CheckFieldBuilder } from "@/components/tool-types/CheckFieldBuilder";
import { PartBuilder } from "@/components/tool-types/PartBuilder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getToolTypeById, updateToolType, deleteToolType } from "@/lib/firestore";
import type { CheckField, Part, ToolType } from "@/types";

export default function UpravitTypPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [toolType, setToolType] = useState<ToolType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkFields, setCheckFields] = useState<CheckField[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getToolTypeById(id).then((tt) => {
      if (tt) {
        setToolType(tt);
        setCheckFields([...tt.checkFields].sort((a, b) => a.order - b.order));
        setParts([...tt.parts].sort((a, b) => a.order - b.order));
      }
      setLoading(false);
    });
  }, [id]);

  const handleBaseSubmit = async (data: {
    name: string;
    description?: string;
    revisionIntervalMonths: number;
  }) => {
    setSaving(true);
    try {
      await updateToolType(id, { ...data, checkFields, parts });
      toast.success("Základní informace uloženy");
    } catch {
      toast.error("Nepodařilo se uložit");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFields = async () => {
    setSaving(true);
    try {
      await updateToolType(id, { checkFields, parts });
      toast.success("Pole a součásti uloženy");
    } catch {
      toast.error("Nepodařilo se uložit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Opravdu smazat tento typ nástroje? Tato akce je nevratná.")) return;
    try {
      await deleteToolType(id);
      toast.success("Typ nástroje byl smazán");
      router.push("/typy-nastroju");
    } catch {
      toast.error("Nepodařilo se smazat");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Upravit typ" showBack />
        <PageWrapper>
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!toolType) {
    return (
      <>
        <TopBar title="Upravit typ" showBack />
        <PageWrapper>
          <p className="text-gray-400 text-sm">Typ nástroje nenalezen.</p>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Upravit typ"
        showBack
        rightElement={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
      />
      <PageWrapper>
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
              Základní informace
            </h2>
            <ToolTypeForm
              defaultValues={{
                name: toolType.name,
                description: toolType.description,
                revisionIntervalMonths: toolType.revisionIntervalMonths,
              }}
              onSubmit={handleBaseSubmit}
              submitLabel={saving ? "Ukládám…" : "Uložit základní info"}
            />
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
            onClick={handleSaveFields}
            className="w-full"
            disabled={saving}
          >
            {saving ? "Ukládám…" : "Uložit pole a součásti"}
          </Button>
        </div>
      </PageWrapper>
    </>
  );
}
