import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { computeToolStatus, computeNextRevisionDate } from "@/lib/status";
import type {
  Station,
  ToolType,
  ToolTypeInput,
  Tool,
  ToolInput,
  Revision,
  RevisionInput,
  AppUser,
} from "@/types";

// ── Stations ──────────────────────────────────────────────────────────────────

export async function getStations(): Promise<Station[]> {
  const snap = await getDocs(
    query(collection(db, "stations"), orderBy("name", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Station));
}

export async function createStation(name: string): Promise<string> {
  const ref = await addDoc(collection(db, "stations"), {
    name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStation(id: string, name: string): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, "stations", id), { name });

  // Denormalize station name to all tools in this station
  const toolsSnap = await getDocs(
    query(collection(db, "tools"), where("stationId", "==", id))
  );
  toolsSnap.docs.forEach((toolDoc) => {
    batch.update(toolDoc.ref, { stationName: name, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

export async function deleteStation(id: string): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, "stations", id));

  // Clear station assignment from all tools in this station
  const toolsSnap = await getDocs(
    query(collection(db, "tools"), where("stationId", "==", id))
  );
  toolsSnap.docs.forEach((toolDoc) => {
    batch.update(toolDoc.ref, {
      stationId: deleteField(),
      stationName: deleteField(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

// ── Tool Types ────────────────────────────────────────────────────────────────

export async function getToolTypes(): Promise<ToolType[]> {
  const snap = await getDocs(
    query(collection(db, "toolTypes"), orderBy("name", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ToolType));
}

export async function getToolTypeById(id: string): Promise<ToolType | null> {
  const snap = await getDoc(doc(db, "toolTypes", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ToolType;
}

export async function createToolType(data: ToolTypeInput): Promise<string> {
  const ref = await addDoc(collection(db, "toolTypes"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateToolType(
  id: string,
  data: Partial<ToolTypeInput>
): Promise<void> {
  const batch = writeBatch(db);

  // Update tool type
  batch.update(doc(db, "toolTypes", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // If name changed, denormalize to all tools of this type
  if (data.name) {
    const toolsSnap = await getDocs(
      query(collection(db, "tools"), where("toolTypeId", "==", id))
    );
    toolsSnap.docs.forEach((toolDoc) => {
      batch.update(toolDoc.ref, {
        toolTypeName: data.name,
        updatedAt: serverTimestamp(),
      });
    });
  }

  await batch.commit();
}

export async function deleteToolType(id: string): Promise<void> {
  await deleteDoc(doc(db, "toolTypes", id));
}

// ── Tools ─────────────────────────────────────────────────────────────────────

export async function getTools(): Promise<Tool[]> {
  const snap = await getDocs(
    query(collection(db, "tools"), orderBy("identifier", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tool));
}

export async function getToolById(id: string): Promise<Tool | null> {
  const snap = await getDoc(doc(db, "tools", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Tool;
}

export async function createTool(data: ToolInput): Promise<string> {
  const ref = await addDoc(collection(db, "tools"), {
    ...data,
    status: "never_revised",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTool(
  id: string,
  data: Partial<ToolInput>
): Promise<void> {
  await updateDoc(doc(db, "tools", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTool(id: string): Promise<void> {
  await deleteDoc(doc(db, "tools", id));
}

// ── Revisions ─────────────────────────────────────────────────────────────────

export async function getRevisionsByToolId(toolId: string): Promise<Revision[]> {
  const snap = await getDocs(
    query(
      collection(db, "revisions"),
      where("toolId", "==", toolId),
      orderBy("revisionDate", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Revision));
}

export async function getRevisionById(id: string): Promise<Revision | null> {
  const snap = await getDoc(doc(db, "revisions", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Revision;
}

export async function createRevision(
  data: RevisionInput,
  toolTypeIntervalMonths: number
): Promise<string> {
  const batch = writeBatch(db);

  // Create revision document
  const revRef = doc(collection(db, "revisions"));
  batch.set(revRef, {
    ...data,
    createdAt: serverTimestamp(),
  });

  // Compute next revision date and new status
  const revisionDate = data.revisionDate.toDate();
  const nextRevisionDate = computeNextRevisionDate(
    revisionDate,
    toolTypeIntervalMonths
  );
  const nextRevisionTimestamp = Timestamp.fromDate(nextRevisionDate);
  const newStatus = computeToolStatus(nextRevisionTimestamp);

  // Update parent tool atomically
  batch.update(doc(db, "tools", data.toolId), {
    lastRevisionDate: data.revisionDate,
    nextRevisionDate: nextRevisionTimestamp,
    status: newStatus,
    lastNotificationSentAt: deleteField(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return revRef.id;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: Omit<AppUser, "createdAt">): Promise<void> {
  const ref = doc(db, "users", user.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await updateDoc(ref, {
      ...user,
      createdAt: serverTimestamp(),
    }).catch(async () => {
      // doc doesn't exist yet, use setDoc
      const { setDoc } = await import("firebase/firestore");
      await setDoc(ref, { ...user, createdAt: serverTimestamp() });
    });
  }
}
