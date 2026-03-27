import { Timestamp } from "firebase/firestore";

// ── Check field types ────────────────────────────────────────────────────────

export type CheckFieldType = "yes_no" | "number" | "text" | "year";

export interface CheckField {
  id: string;
  name: string;
  type: CheckFieldType;
  required: boolean;
  order: number;
}

// ── Part (component that can have damage/defect) ─────────────────────────────

export interface Part {
  id: string;
  name: string;
  order: number;
}

// ── Tool type template ────────────────────────────────────────────────────────

export interface ToolType {
  id: string;
  name: string;
  description?: string;
  revisionIntervalMonths: number;
  checkFields: CheckField[];
  parts: Part[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ToolTypeInput = Omit<ToolType, "id" | "createdAt" | "updatedAt">;

// ── Tool status ───────────────────────────────────────────────────────────────

export type ToolStatus = "ok" | "due_soon" | "overdue" | "never_revised";

// ── Notification tracking ─────────────────────────────────────────────────────

export interface LastNotificationSentAt {
  overdue?: Timestamp;
  due_soon_7?: Timestamp;
  due_soon_30?: Timestamp;
}

// ── Station (fire station / základna) ────────────────────────────────────────

export interface Station {
  id: string;
  name: string;
  createdAt: Timestamp;
}

// ── Tool (individual physical tool) ──────────────────────────────────────────

export interface Tool {
  id: string;
  toolTypeId: string;
  toolTypeName: string;
  stationId?: string;
  stationName?: string;
  serialNumber: string;
  model: string;
  yearOfManufacture: number;
  lastRevisionDate?: Timestamp;
  nextRevisionDate?: Timestamp;
  status: ToolStatus;
  lastNotificationSentAt?: LastNotificationSentAt;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ToolInput = Omit<
  Tool,
  "id" | "status" | "lastRevisionDate" | "nextRevisionDate" | "lastNotificationSentAt" | "createdAt" | "updatedAt"
>;

// ── Revision ──────────────────────────────────────────────────────────────────

export type OverallResult = "splňuje" | "nesplňuje";

export interface PartResult {
  hasIssue: boolean;
  note?: string;
}

export interface Revision {
  id: string;
  toolId: string;
  toolTypeId: string;
  revisionDate: Timestamp;
  technicianName: string;
  technicianPhone: string;
  technicianEmail: string;
  overallResult: OverallResult;
  checkResults: Record<string, string | number | boolean>;
  partsResults: Record<string, PartResult>;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export type RevisionInput = Omit<Revision, "id" | "createdAt">;

// ── App user ──────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}
