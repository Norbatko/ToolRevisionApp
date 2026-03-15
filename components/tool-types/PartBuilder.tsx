"use client";

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
import { nanoid } from "nanoid";
import type { Part } from "@/types";

function SortablePart({
  part,
  onChange,
  onDelete,
}: {
  part: Part;
  onChange: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: part.id,
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
        value={part.name}
        onChange={(e) => onChange(part.id, e.target.value)}
        placeholder="Název součásti…"
        className="flex-1 h-8 text-sm"
      />

      <button
        type="button"
        onClick={() => onDelete(part.id)}
        className="text-red-400 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface PartBuilderProps {
  parts: Part[];
  onChange: (parts: Part[]) => void;
}

export function PartBuilder({ parts, onChange }: PartBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parts.findIndex((p) => p.id === active.id);
      const newIndex = parts.findIndex((p) => p.id === over.id);
      onChange(
        arrayMove(parts, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
      );
    }
  };

  const handleChangeName = (id: string, name: string) => {
    onChange(parts.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleDelete = (id: string) => {
    onChange(parts.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  };

  const handleAdd = () => {
    onChange([...parts, { id: nanoid(), name: "", order: parts.length }]);
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={parts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {parts.map((part) => (
            <SortablePart
              key={part.id}
              part={part}
              onChange={handleChangeName}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full gap-1.5">
        <Plus className="w-4 h-4" />
        Přidat součást
      </Button>
    </div>
  );
}
