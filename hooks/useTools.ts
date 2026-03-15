"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Tool, ToolStatus } from "@/types";

export function useTools(statusFilter?: ToolStatus) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("identifier", "asc")];
    if (statusFilter) {
      constraints.unshift(where("status", "==", statusFilter));
    }
    const q = query(collection(db, "tools"), ...constraints);
    const unsubscribe = onSnapshot(q, (snap) => {
      setTools(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tool)));
      setLoading(false);
    });
    return unsubscribe;
  }, [statusFilter]);

  return { tools, loading };
}
