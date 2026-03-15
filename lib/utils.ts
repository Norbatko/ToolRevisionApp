import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import type { Timestamp } from "firebase/firestore"
import type { ToolStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return "—"
  const d = "toDate" in date ? date.toDate() : date
  return format(d, "d. M. yyyy", { locale: cs })
}

export function formatDateTime(date: Date | Timestamp | null | undefined): string {
  if (!date) return "—"
  const d = "toDate" in date ? date.toDate() : date
  return format(d, "d. M. yyyy HH:mm", { locale: cs })
}

export function statusLabel(status: ToolStatus): string {
  switch (status) {
    case "ok": return "V pořádku"
    case "due_soon": return "Brzy splatná"
    case "overdue": return "Po termínu"
    case "never_revised": return "Nerevidováno"
  }
}

export function statusColor(status: ToolStatus): string {
  switch (status) {
    case "ok": return "bg-green-100 text-green-800 border-green-200"
    case "due_soon": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "overdue": return "bg-red-100 text-red-800 border-red-200"
    case "never_revised": return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

export function statusDotColor(status: ToolStatus): string {
  switch (status) {
    case "ok": return "bg-green-500"
    case "due_soon": return "bg-yellow-500"
    case "overdue": return "bg-red-500"
    case "never_revised": return "bg-gray-400"
  }
}
