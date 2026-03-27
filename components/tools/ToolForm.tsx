"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ToolInput, ToolType, Station } from "@/types";

const schema = z.object({
  toolTypeId: z.string().min(1, "Vyberte typ nástroje"),
  stationId: z.string().optional(),
  identifier: z.string().min(1, "Zadejte označení nástroje"),
  serialNumber: z.string().min(1, "Zadejte sériové číslo"),
  model: z.string().min(1, "Zadejte model"),
  yearOfManufacture: z
    .number()
    .min(1900, "Zadejte platný rok výroby")
    .max(new Date().getFullYear(), "Rok nemůže být v budoucnosti"),
});

type FormValues = z.infer<typeof schema>;

interface ToolFormProps {
  toolTypes: ToolType[];
  stations?: Station[];
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: ToolInput) => Promise<void>;
  submitLabel?: string;
}

export function ToolForm({
  toolTypes,
  stations = [],
  defaultValues,
  onSubmit,
  submitLabel = "Uložit",
}: ToolFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { yearOfManufacture: new Date().getFullYear(), ...defaultValues },
  });

  const selectedTypeId = watch("toolTypeId");
  const selectedStationId = watch("stationId");

  const handleFormSubmit = async (values: FormValues) => {
    const toolType = toolTypes.find((t) => t.id === values.toolTypeId);
    const station = stations.find((s) => s.id === values.stationId);
    await onSubmit({
      ...values,
      toolTypeName: toolType?.name ?? "",
      stationId: station?.id,
      stationName: station?.name,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Tool type */}
      <div className="space-y-1.5">
        <Label>Typ nástroje</Label>
        <Select
          value={selectedTypeId}
          onValueChange={(v) => v && setValue("toolTypeId", v, { shouldValidate: true })}
        >
          <SelectTrigger className={errors.toolTypeId ? "border-red-500" : ""}>
            <SelectValue placeholder="Vyberte typ…" />
          </SelectTrigger>
          <SelectContent>
            {toolTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.toolTypeId && (
          <p className="text-xs text-red-500">{errors.toolTypeId.message}</p>
        )}
      </div>

      {/* Station */}
      {stations.length > 0 && (
        <div className="space-y-1.5">
          <Label>Základna</Label>
          <Select
            value={selectedStationId ?? ""}
            onValueChange={(v) => setValue("stationId", v || undefined, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vyberte základnu…" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Identifier */}
      <div className="space-y-1.5">
        <Label>Označení nástroje</Label>
        <Input
          {...register("identifier")}
          placeholder="např. HS 1 Centrála"
          className={errors.identifier ? "border-red-500" : ""}
        />
        {errors.identifier && (
          <p className="text-xs text-red-500">{errors.identifier.message}</p>
        )}
      </div>

      {/* Serial number */}
      <div className="space-y-1.5">
        <Label>Sériové číslo</Label>
        <Input
          {...register("serialNumber")}
          placeholder="např. 2412"
          className={errors.serialNumber ? "border-red-500" : ""}
        />
        {errors.serialNumber && (
          <p className="text-xs text-red-500">{errors.serialNumber.message}</p>
        )}
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <Label>Model</Label>
        <Input
          {...register("model")}
          placeholder="např. RSX 200-107"
          className={errors.model ? "border-red-500" : ""}
        />
        {errors.model && (
          <p className="text-xs text-red-500">{errors.model.message}</p>
        )}
      </div>

      {/* Year of manufacture */}
      <div className="space-y-1.5">
        <Label>Rok výroby</Label>
        <Input
          type="number"
          {...register("yearOfManufacture", { valueAsNumber: true })}
          placeholder="2017"
          className={errors.yearOfManufacture ? "border-red-500" : ""}
        />
        {errors.yearOfManufacture && (
          <p className="text-xs text-red-500">{errors.yearOfManufacture.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Ukládám…" : submitLabel}
      </Button>
    </form>
  );
}
