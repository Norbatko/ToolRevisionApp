"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useStations } from "@/hooks/useStations";
import { createStation, updateStation, deleteStation } from "@/lib/firestore";
import type { Station } from "@/types";

export default function ZakladnyPage() {
  const { stations, loading } = useStations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDialogOpen(true);
  };

  const openEdit = (station: Station) => {
    setEditing(station);
    setName(station.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      if (editing) {
        await updateStation(editing.id, trimmed);
        toast.success("Základna byla upravena");
      } else {
        await createStation(trimmed);
        toast.success("Základna byla přidána");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Nepodařilo se uložit základnu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (station: Station) => {
    if (!confirm(`Smazat základnu „${station.name}"? Nástroje budou ponechány bez přiřazení.`)) return;
    try {
      await deleteStation(station.id);
      toast.success("Základna byla smazána");
    } catch {
      toast.error("Nepodařilo se smazat základnu");
    }
  };

  return (
    <>
      <TopBar
        title="Základny"
        rightElement={
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Přidat
          </Button>
        }
      />
      <PageWrapper>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : stations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Zatím žádné základny. Přidejte první základnu.
          </p>
        ) : (
          <div className="space-y-2">
            {stations.map((station) => (
              <Card key={station.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sm truncate">{station.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(station)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(station)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageWrapper>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Upravit základnu" : "Nová základna"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Název</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Základna Praha"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || saving}>
              {saving ? "Ukládám…" : "Uložit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
