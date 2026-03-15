"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckField } from "@/types";

interface CheckFieldInputProps {
  field: CheckField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  error?: string;
}

export function CheckFieldInput({ field, value, onChange, error }: CheckFieldInputProps) {
  const inputId = `field-${field.id}`;

  return (
    <div className="space-y-1.5">
      {field.type === "yes_no" ? (
        <div className="flex items-center justify-between py-1">
          <Label htmlFor={inputId} className="text-sm font-medium cursor-pointer">
            {field.name}
          </Label>
          <Switch
            id={inputId}
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      ) : (
        <>
          <Label htmlFor={inputId} className="text-sm font-medium">
            {field.name}
          </Label>
          <Input
            id={inputId}
            type={field.type === "number" || field.type === "year" ? "number" : "text"}
            value={value as string | number ?? ""}
            onChange={(e) =>
              onChange(
                field.type === "number" || field.type === "year"
                  ? Number(e.target.value)
                  : e.target.value
              )
            }
            placeholder={field.type === "year" ? "např. 2022" : field.type === "number" ? "0" : ""}
            className={error ? "border-red-500" : ""}
            min={field.type === "year" ? 1990 : undefined}
            max={field.type === "year" ? new Date().getFullYear() + 5 : undefined}
          />
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
