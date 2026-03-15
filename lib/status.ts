import { differenceInDays, addMonths } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import type { ToolStatus } from "@/types";

export function computeToolStatus(
  nextRevisionDate?: Timestamp | null
): ToolStatus {
  if (!nextRevisionDate) return "never_revised";
  const days = differenceInDays(nextRevisionDate.toDate(), new Date());
  if (days < 0) return "overdue";
  if (days <= 30) return "due_soon";
  return "ok";
}

export function computeNextRevisionDate(
  revisionDate: Date,
  intervalMonths: number
): Date {
  return addMonths(revisionDate, intervalMonths);
}

export function daysUntilRevision(nextRevisionDate?: Timestamp | null): number | null {
  if (!nextRevisionDate) return null;
  return differenceInDays(nextRevisionDate.toDate(), new Date());
}
