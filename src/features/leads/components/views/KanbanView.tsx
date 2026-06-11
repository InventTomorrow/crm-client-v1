"use client";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { filterLeads } from "../../hooks/useLeads";
import type { Lead, LeadsFilter, LeadStatus } from "../../types";
import { STATUS_META } from "../../types";
import LeadCard from "../LeadCard";

// ──────────────────── Kanban View ────────────────────
export default function KanbanView({
  leads,
  filter,
  onSelect,
  onStatusChange,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const filtered = filterLeads(leads, filter);
    const g: Record<string, Lead[]> = {
      prospect: [],
      cold: [],
      warm: [],
      hot: [],
      closed: [],
    };
    filtered.forEach((l) => {
      g[l.status]?.push(l);
    });
    return g;
  }, [leads, filter]);

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    onStatusChange(id, colKey as LeadStatus);
    setDraggingId(null);
  };

  return (
    <div className="leads-kanban grid gap-3 flex-1 min-h-0 grid-cols-[repeat(5,minmax(220px,1fr))] overflow-x-auto">
      {Object.entries(STATUS_META).map(([key, c]) => (
        <div
          key={key}
          className={cn(
            "card kanban-col flex flex-col min-h-0 p-3",
            dragOverCol === key
              ? "drag-over bg-[var(--accent-soft)]"
              : "bg-[var(--surface)]",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(key);
          }}
          onDragLeave={() =>
            setDragOverCol((prev) => (prev === key ? null : prev))
          }
          onDrop={(e) => handleDrop(e, key)}
        >
          <div className="flex items-center justify-between mb-2.5 px-1 pb-2 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="dot w-2 h-2" style={{ background: c.color }} />
              <h4 className="text-[13px] font-semibold">{c.label}</h4>
              <span
                className="badge font-medium py-[1px] px-[7px]"
                style={{ background: c.tint, color: c.color }}
              >
                {grouped[key]?.length ?? 0}
              </span>
            </div>
            <button className="btn btn-ghost p-1" title="Add to column">
              <Plus size={13} />
            </button>
          </div>
          <div className="scroll overflow-y-auto flex-1 flex flex-col gap-2 pr-0.5 min-h-[80px]">
            {grouped[key]?.map((l) => (
              <LeadCard
                key={l.id}
                lead={l}
                onClick={() => onSelect(l)}
                draggable
                dragging={draggingId === l.id}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", l.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingId(l.id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverCol(null);
                }}
                onStatusChange={(s) => onStatusChange(l.id, s)}
              />
            ))}
            {(grouped[key]?.length ?? 0) === 0 && (
              <div className="p-5 text-center text-[12px] rounded-[10px] border border-dashed text-[var(--ink-mute)] border-[var(--line)]">
                Drop a lead here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
