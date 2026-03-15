import { cn } from "@/lib/utils";
import type { Tool } from "@/types";

interface StatusSummaryCardsProps {
  tools: Tool[];
}

export function StatusSummaryCards({ tools }: StatusSummaryCardsProps) {
  const total = tools.length;
  const overdue = tools.filter((t) => t.status === "overdue").length;
  const dueSoon = tools.filter((t) => t.status === "due_soon").length;
  const ok = tools.filter((t) => t.status === "ok").length;
  const neverRevised = tools.filter((t) => t.status === "never_revised").length;

  const cards = [
    { label: "Celkem", value: total, color: "bg-blue-50 text-blue-700" },
    { label: "Po termínu", value: overdue, color: "bg-red-50 text-red-700" },
    { label: "Brzy splatná", value: dueSoon, color: "bg-yellow-50 text-yellow-700" },
    { label: "V pořádku", value: ok, color: "bg-green-50 text-green-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          className={cn("rounded-xl p-4", color)}
        >
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm mt-0.5 font-medium opacity-80">{label}</p>
        </div>
      ))}
    </div>
  );
}
