"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CheckFieldInput } from "@/components/revisions/CheckFieldInput";
import { PartAssessmentRow } from "@/components/revisions/PartAssessmentRow";
import { Printer } from "lucide-react";
import type { ToolType, RevisionInput, PartResult, OverallResult } from "@/types";

interface RevisionFormProps {
  toolId: string;
  toolType: ToolType;
  userId: string;
  onSubmit: (data: RevisionInput) => Promise<void>;
}

export function RevisionForm({ toolId, toolType, userId, onSubmit }: RevisionFormProps) {
  // Build zod schema dynamically from check fields
  const schema = useMemo(() => {
    const checkFieldSchema: Record<string, z.ZodTypeAny> = {};
    toolType.checkFields.forEach((field) => {
      if (field.type === "yes_no") {
        checkFieldSchema[field.id] = z.boolean().default(false);
      } else if (field.type === "number" || field.type === "year") {
        checkFieldSchema[field.id] = field.required
          ? z.number().min(0, "Vyplňte pole")
          : z.number().optional();
      } else {
        checkFieldSchema[field.id] = field.required
          ? z.string().min(1, "Vyplňte pole")
          : z.string().optional();
      }
    });

    return z.object({
      revisionDate: z.string().min(1, "Zadejte datum revize"),
      technicianName: z.string().min(1, "Zadejte jméno technika"),
      technicianPhone: z.string().min(1, "Zadejte telefon"),
      technicianEmail: z.string().email("Neplatný email"),
      overallResult: z.enum(["splňuje", "nesplňuje"] as const),
      notes: z.string().optional(),
      checkFields: z.object(checkFieldSchema),
    });
  }, [toolType]);

  type FormValues = z.infer<typeof schema>;

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      revisionDate: today,
      overallResult: "splňuje",
      checkFields: Object.fromEntries(
        toolType.checkFields.map((f) => [
          f.id,
          f.type === "yes_no" ? false : f.type === "number" || f.type === "year" ? 0 : "",
        ])
      ),
    },
  });

  // Parts state (not in react-hook-form to avoid complexity)
  const [partsResults, setPartsResults] = useState<Record<string, PartResult>>(
    Object.fromEntries(toolType.parts.map((p) => [p.id, { hasIssue: false }]))
  );

  const handlePartChange = (partId: string, result: PartResult) => {
    setPartsResults((prev) => ({ ...prev, [partId]: result }));
  };

  const handleFormSubmit = async (values: FormValues) => {
    const revisionDate = Timestamp.fromDate(new Date(values.revisionDate));
    await onSubmit({
      toolId,
      toolTypeId: toolType.id,
      revisionDate,
      technicianName: values.technicianName,
      technicianPhone: values.technicianPhone,
      technicianEmail: values.technicianEmail,
      overallResult: values.overallResult as OverallResult,
      checkResults: values.checkFields as Record<string, string | number | boolean>,
      partsResults,
      notes: values.notes,
      createdBy: userId,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="w-4 h-4" />
          Tisknout
        </Button>
      </div>

      {/* Technician info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-base">Technik</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Jméno technika</Label>
            <Input
              {...register("technicianName")}
              placeholder="Jméno Příjmení"
              className={errors.technicianName ? "border-red-500" : ""}
            />
            {errors.technicianName && (
              <p className="text-xs text-red-500">{errors.technicianName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Telefon</Label>
            <Input
              {...register("technicianPhone")}
              type="tel"
              placeholder="+420 777 000 000"
              className={errors.technicianPhone ? "border-red-500" : ""}
            />
            {errors.technicianPhone && (
              <p className="text-xs text-red-500">{errors.technicianPhone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>E-mail technika</Label>
            <Input
              {...register("technicianEmail")}
              type="email"
              placeholder="technik@example.com"
              className={errors.technicianEmail ? "border-red-500" : ""}
            />
            {errors.technicianEmail && (
              <p className="text-xs text-red-500">{errors.technicianEmail.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Datum revize</Label>
            <Input
              {...register("revisionDate")}
              type="date"
              className={errors.revisionDate ? "border-red-500" : ""}
            />
            {errors.revisionDate && (
              <p className="text-xs text-red-500">{errors.revisionDate.message as string}</p>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Check fields */}
      {toolType.checkFields.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Kontrolní body</h2>
          <div className="space-y-4">
            {toolType.checkFields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <Controller
                  key={field.id}
                  name={`checkFields.${field.id}` as never}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CheckFieldInput
                      field={field}
                      value={value as string | number | boolean}
                      onChange={onChange}
                      error={(errors.checkFields as Record<string, { message?: string }>)?.[field.id]?.message}
                    />
                  )}
                />
              ))}
          </div>
        </section>
      )}

      {toolType.parts.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <div>
              <h2 className="font-semibold text-base">Poškození – závada</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="text-green-600 font-medium">Ano</span> = bez závady,{" "}
                <span className="text-red-600 font-medium">Ne</span> = závada nalezena
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4">
              {toolType.parts
                .sort((a, b) => a.order - b.order)
                .map((part) => (
                  <PartAssessmentRow
                    key={part.id}
                    part={part}
                    value={partsResults[part.id] ?? { hasIssue: false }}
                    onChange={handlePartChange}
                  />
                ))}
            </div>
          </section>
        </>
      )}

      <Separator />

      {/* Overall result */}
      <section className="space-y-3">
        <h2 className="font-semibold text-base">Výsledek revize</h2>
        <Controller
          name="overallResult"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange("splňuje")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                  value === "splňuje"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                SPLŇUJE
              </button>
              <button
                type="button"
                onClick={() => onChange("nesplňuje")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                  value === "nesplňuje"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                NESPLŇUJE
              </button>
            </div>
          )}
        />
      </section>

      {/* Notes */}
      <section className="space-y-1.5">
        <Label>Poznámky (volitelné)</Label>
        <Textarea
          {...register("notes")}
          placeholder="Další poznámky k revizi…"
          rows={3}
        />
      </section>

      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? "Ukládám revizi…" : "Uložit revizi"}
      </Button>
    </form>
  );
}
