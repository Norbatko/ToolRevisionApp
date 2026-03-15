"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ToolType } from "@/types";

export function useToolTypes() {
  const [toolTypes, setToolTypes] = useState<ToolType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "toolTypes"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setToolTypes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ToolType)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { toolTypes, loading };
}
