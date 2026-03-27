"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Station } from "@/types";

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stations"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setStations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Station)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { stations, loading };
}
