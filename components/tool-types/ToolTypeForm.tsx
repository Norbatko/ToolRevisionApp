"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ToolTypeInput } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Zadejte název"),
  description: z.string().optional(),
  revisionIntervalMonths: z
    .number()
    .min(1, "Minimum 1 měsíc")
    .max(120, "Maximum 120 měsíců"),
});

type FormValues = z.infer<typeof schema>;

interface ToolTypeFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: Pick<ToolTypeInput, "name" | "description" | "revisionIntervalMonths">) => Promise<void>;
  submitLabel?: string;
}

export function ToolTypeForm({
  defaultValues,
  onSubmit,
  submitLabel = "Uložit",
}: ToolTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { revisionIntervalMonths: 12, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Název typu nástroje</Label>
        <Input
          {...register("name")}
          placeholder="např. Hydraulický stříhací nástroj"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Popis (volitelný)</Label>
        <Textarea
          {...register("description")}
          placeholder="Stručný popis typu nástroje…"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Interval revize (měsíce)</Label>
        <Input
          type="number"
          {...register("revisionIntervalMonths", { valueAsNumber: true })}
          placeholder="12"
          className={errors.revisionIntervalMonths ? "border-red-500" : ""}
        />
        {errors.revisionIntervalMonths && (
          <p className="text-xs text-red-500">{errors.revisionIntervalMonths.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Ukládám…" : submitLabel}
      </Button>
    </form>
  );
}
