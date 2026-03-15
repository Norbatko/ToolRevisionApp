"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nanoid } from "nanoid";
import type { CheckField, CheckFieldType } from "@/types";

const TYPE_LABELS: Record<CheckFieldType, string> = {
  yes_no: "Ano / Ne",
  number: "Číslo",
  text: "Text",
  year: "Rok",
};

function SortableField({
  field,
  onChange,
  onDelete,
}: {
  field: CheckField;
  onChange: (id: string, updates: Partial<CheckField>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-400 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <Input
        value={field.name}
        onChange={(e) => onChange(field.id, { name: e.target.value })}
        placeholder="Název pole…"
        className="flex-1 h-8 text-sm"
      />

      <Select
        value={field.type}
        onValueChange={(v) => onChange(field.id, { type: v as CheckFieldType })}
      >
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TYPE_LABELS) as CheckFieldType[]).map((t) => (
            <SelectItem key={t} value={t} className="text-xs">
              {TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={() => onDelete(field.id)}
        className="text-red-400 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface CheckFieldBuilderProps {
  fields: CheckField[];
  onChange: (fields: CheckField[]) => void;
}

export function CheckFieldBuilder({ fields, onChange }: CheckFieldBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
        ...f,
        order: i,
      }));
      onChange(reordered);
    }
  };

  const handleChange = (id: string, updates: Partial<CheckField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDelete = (id: string) => {
    onChange(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })));
  };

  const handleAdd = () => {
    onChange([
      ...fields,
      { id: nanoid(), name: "", type: "yes_no", required: true, order: fields.length },
    ]);
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full gap-1.5">
        <Plus className="w-4 h-4" />
        Přidat pole
      </Button>
    </div>
  );
}
