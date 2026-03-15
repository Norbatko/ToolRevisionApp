"use client";

import { useEffect, useState } from "react";
import { getRevisionsByToolId } from "@/lib/firestore";
import type { Revision } from "@/types";

export function useRevisions(toolId: string) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toolId) return;
    setLoading(true);
    getRevisionsByToolId(toolId).then((revs) => {
      setRevisions(revs);
      setLoading(false);
    });
  }, [toolId]);

  return { revisions, loading };
}
