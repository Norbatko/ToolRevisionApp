"use client";

import { useEffect, useState } from "react";
import { getToolById, getToolTypeById } from "@/lib/firestore";
import type { Tool, ToolType } from "@/types";

export function useToolDetail(toolId: string) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [toolType, setToolType] = useState<ToolType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toolId) return;
    setLoading(true);
    getToolById(toolId).then(async (t) => {
      setTool(t);
      if (t) {
        const tt = await getToolTypeById(t.toolTypeId);
        setToolType(tt);
      }
      setLoading(false);
    });
  }, [toolId]);

  return { tool, toolType, loading };
}
