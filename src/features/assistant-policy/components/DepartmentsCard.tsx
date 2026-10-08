"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/Dialog";
import { Input } from "@/shared/ui/Input";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { useDeleteDepartment, useDepartments, useSaveDepartment } from "../hooks/useAssistantPolicy";
import type { Department, DepartmentForm } from "../types";

const EMPTY_FORM: DepartmentForm = {
  key: "",
  name: "",
  whatsappNumber: "",
  email: "",
  isPublicContact: false,
  handoffMessage: "",
  isDefault: false,
};

const formFrom = (department: Department): DepartmentForm => ({
  key: department.key,
  name: department.name,
  whatsappNumber: department.whatsappNumber ?? "",
  email: department.email ?? "",
  isPublicContact: department.isPublicContact,
  handoffMessage: department.handoffMessage ?? "",
  isDefault: department.isDefault,
});

/** "Patient Relations" → "patient-relations": the stable key rules route on. */
const keyFromName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/**
 * The queues escalations and files are routed to. A rule pointed at a queue
 * alerts that queue's people; everything else goes to the default one.
 */
export function DepartmentsCard() {
  const { data: departments = [], isLoading } = useDepartments();
  const { mutate: remove, isPending: removing } = useDeleteDepartment();
  const [editing, setEditing] = useState<Department | "new" | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  return (
    <section className="card p-[22px] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">Departments</h3>
          <p className="text-[11.5px] text-[var(--ink-mute)] mt-0.5 leading-snug">
            Where the rules above send alerts. Without any, every alert goes to the workspace owner.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
      ) : departments.length === 0 ? (
        <p className="text-[12px] text-[var(--ink-mute)]">
          No departments yet. Add e.g. &ldquo;HR&rdquo; for CVs or &ldquo;Clinical&rdquo; for medical files.
        </p>
      ) : (
        <ul className="flex flex-col">
          {departments.map((department) => (
            <li
              key={department.id}
              className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-2.5 first:border-t-0"
            >
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-[var(--ink)] flex items-center gap-2">
                  {department.name}
                  {department.isDefault && <Badge variant="secondary">Default</Badge>}
                  {department.isPublicContact && <Badge variant="outline">Shared with customers</Badge>}
                  {!department.isActive && <Badge variant="outline">Inactive</Badge>}
                </p>
                <p className="text-[11px] text-[var(--ink-mute)] truncate">
                  key: {department.key}
                  {department.whatsappNumber ? ` · ${department.whatsappNumber}` : ""}
                  {department.email ? ` · ${department.email}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" size="icon-sm" variant="ghost" aria-label={`Edit ${department.name}`} onClick={() => setEditing(department)}>
                  <Pencil size={14} />
                </Button>
                <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remove ${department.name}`} onClick={() => setDeleting(department)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <DepartmentDialog
          department={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id, { onSuccess: () => setDeleting(null) })}
        loading={removing}
        title={`Remove ${deleting?.name ?? "department"}?`}
        description="Rules routed here will alert the default department instead."
        confirmLabel="Remove"
      />
    </section>
  );
}

function DepartmentDialog({ department, onClose }: { department: Department | null; onClose: () => void }) {
  const { mutate: save, isPending } = useSaveDepartment();
  const [form, setForm] = useState<DepartmentForm>(department ? formFrom(department) : EMPTY_FORM);
  const [keyTouched, setKeyTouched] = useState(Boolean(department));
  const set = (changes: Partial<DepartmentForm>) => setForm((current) => ({ ...current, ...changes }));

  const needsContact = form.isPublicContact && !form.whatsappNumber.trim() && !form.email.trim();
  const canSave = form.name.trim() && /^[a-z0-9_-]+$/.test(form.key) && !needsContact;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit department" : "Add department"}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSave) return;
            save({ id: department?.id, form }, { onSuccess: onClose });
          }}
        >
          <Field label="Name">
            <Input
              value={form.name}
              maxLength={80}
              placeholder="e.g. Human Resources"
              onChange={(event) =>
                set({ name: event.target.value, ...(keyTouched ? {} : { key: keyFromName(event.target.value) }) })
              }
            />
          </Field>
          <Field label="Key" hint="What rules route on. Lowercase letters, numbers and hyphens — e.g. hr, clinical, billing.">
            <Input
              value={form.key}
              maxLength={40}
              onChange={(event) => {
                setKeyTouched(true);
                set({ key: event.target.value.toLowerCase() });
              }}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="WhatsApp number">
              <Input value={form.whatsappNumber} maxLength={40} placeholder="+92…" onChange={(event) => set({ whatsappNumber: event.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} placeholder="team@clinic.pk" onChange={(event) => set({ email: event.target.value })} />
            </Field>
          </div>
          <Field label="Handoff message" hint="Replaces the general handoff message for chats sent to this department.">
            <Textarea className="text-[13px] min-h-[56px]" maxLength={500} value={form.handoffMessage} onChange={(event) => set({ handoffMessage: event.target.value })} />
          </Field>
          <SwitchField
            label="Share this contact with customers"
            desc="The assistant may give out this number and email — e.g. so applicants know where to send a CV."
            checked={form.isPublicContact}
            onChange={(isPublicContact) => set({ isPublicContact })}
          />
          {needsContact && (
            <p className="text-[11px] text-[var(--destructive)]">A shared department needs a WhatsApp number or an email.</p>
          )}
          <SwitchField
            label="Default department"
            desc="Receives every alert that is not routed anywhere else."
            checked={form.isDefault}
            onChange={(isDefault) => set({ isDefault })}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave || isPending}>
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-[var(--ink-soft)]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--ink-mute)]">{hint}</p>}
    </div>
  );
}

function SwitchField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Switch className="mt-0.5" checked={checked} onCheckedChange={onChange} />
      <div>
        <p className="text-[12.5px] font-medium text-[var(--ink)]">{label}</p>
        <p className="text-[11px] text-[var(--ink-mute)]">{desc}</p>
      </div>
    </div>
  );
}
