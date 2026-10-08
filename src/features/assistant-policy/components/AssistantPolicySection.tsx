"use client";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SettingsSaveBar } from "@/features/settings/components/SettingsSaveBar";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/NativeSelect";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { useAgentPolicy, useDepartments, useUpdateAgentPolicy } from "../hooks/useAssistantPolicy";
import type { AgentPolicy, AppointmentIntake, Department, PolicyAction } from "../types";
import { DepartmentsCard } from "./DepartmentsCard";

const ACTIONS: { key: PolicyAction; label: string }[] = [
  { key: "HANDOFF", label: "Hand off" },
  { key: "NOTIFY", label: "Notify team" },
  { key: "IGNORE", label: "Ignore" },
];

const INTAKE_OPTIONS: { key: AppointmentIntake; label: string; desc: string }[] = [
  {
    key: "REQUEST",
    label: "Take a request",
    desc: "The assistant notes the care needed and a preferred time, alerts your team, and keeps chatting",
  },
  {
    key: "HANDOFF",
    label: "Hand off",
    desc: "The assistant passes the chat to your team once the care needed is clear",
  },
];

/**
 * How this provider wants its assistant to behave where providers differ.
 * Everything starts at the platform default; only what is changed is stored.
 */
export function AssistantPolicySection() {
  const { data, isLoading } = useAgentPolicy();
  const { data: departments = [] } = useDepartments();
  const { mutate: save, isPending } = useUpdateAgentPolicy();
  // Unsaved edits sit on top of the saved policy; null means "showing what is saved".
  const [edits, setEdits] = useState<AgentPolicy | null>(null);
  const draft = edits ?? data?.policy ?? null;

  const isDirty = useMemo(
    () => Boolean(edits && data && JSON.stringify(edits) !== JSON.stringify(data.policy)),
    [edits, data],
  );

  if (isLoading || !data || !draft) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const { catalog } = data;
  const update = (changes: Partial<AgentPolicy>) => setEdits({ ...draft, ...changes });
  const labelOf = (trigger: string) => catalog.triggers.find((t) => t.trigger === trigger);
  const mediaLabelOf = (kind: string) => catalog.media.find((m) => m.kind === kind);

  return (
    <>
      <div>
        <h2 className="text-[20px] font-semibold">Assistant rules</h2>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-1">
          How your assistant handles the moments where every provider works differently. Anything you
          leave alone follows the recommended default. Emergencies and medical-advice limits always apply.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          // The saved policy comes back from the server, so the edits can go.
          save(draft, { onSuccess: () => setEdits(null) });
        }}
        className="flex flex-col gap-4"
      >
        <PolicyCard
          title="When to involve your team"
          hint="Hand off: the customer is told a person will follow up and the assistant goes quiet. Notify team: your team is alerted and the assistant keeps helping. Ignore: nothing happens."
        >
          {draft.triggers.map((setting, index) => {
            const meta = labelOf(setting.trigger);
            return (
              <div
                key={setting.trigger}
                className="flex flex-col gap-2 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{meta?.label ?? setting.trigger}</p>
                  <p className="text-[11px] text-[var(--ink-mute)]">
                    {meta?.raisedBy === "SIGNAL" ? "Raised by what the assistant finds" : "Raised by what the customer writes"}
                    {meta && setting.action !== meta.defaultAction
                      ? ` · default: ${ACTIONS.find((a) => a.key === meta.defaultAction)?.label}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ActionPicker
                    value={setting.action}
                    canIgnore={meta?.canIgnore ?? true}
                    onChange={(action) =>
                      update({
                        triggers: draft.triggers.map((t, i) => (i === index ? { ...t, action } : t)),
                      })
                    }
                  />
                  <DepartmentSelect
                    value={setting.department}
                    departments={departments}
                    disabled={setting.action === "IGNORE"}
                    onChange={(department) =>
                      update({
                        triggers: draft.triggers.map((t, i) => (i === index ? { ...t, department } : t)),
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </PolicyCard>

        <PolicyCard
          title="Files and photos customers send"
          hint="The assistant works out what was sent — a CV, a medical report, a payment proof — and answers the customer. It never interprets medical files."
        >
          <ToggleRow
            label="Let the assistant look at photos"
            desc="Photos are classified by an AI vision model. Turn off to classify from the file name and caption only."
            checked={draft.analysePhotos}
            onChange={(analysePhotos) => update({ analysePhotos })}
          />
          {draft.media.map((setting, index) => (
            <div
              key={setting.kind}
              className="flex flex-col gap-2 border-t border-[var(--line)] pt-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={setting.notifyTeam}
                  onCheckedChange={(notifyTeam) =>
                    update({ media: draft.media.map((m, i) => (i === index ? { ...m, notifyTeam } : m)) })
                  }
                />
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{mediaLabelOf(setting.kind)?.label ?? setting.kind}</p>
                  <p className="text-[11px] text-[var(--ink-mute)]">
                    {setting.notifyTeam ? "Sent to your team with the file" : "The assistant handles it alone"}
                  </p>
                </div>
              </div>
              <DepartmentSelect
                value={setting.department}
                departments={departments}
                disabled={!setting.notifyTeam}
                onChange={(department) =>
                  update({ media: draft.media.map((m, i) => (i === index ? { ...m, department } : m)) })
                }
              />
            </div>
          ))}
        </PolicyCard>

        <PolicyCard
          title="Appointments"
          hint="Applies when patients cannot book a time themselves — online booking is off in Clinic hours."
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INTAKE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => update({ appointmentIntake: option.key })}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                  draft.appointmentIntake === option.key
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]",
                )}
              >
                <span className="text-[12.5px] font-medium text-[var(--ink)]">{option.label}</span>
                <span className="text-[11px] text-[var(--ink-mute)] mt-0.5 leading-snug">{option.desc}</span>
              </button>
            ))}
          </div>
        </PolicyCard>

        <PolicyCard
          title="Handing over to a person"
          hint="Sent when the chat is handed to your team, in the language the customer writes in. A department's own message takes priority; an empty language falls back to your escalation message."
        >
          <div className="flex flex-col gap-1 max-w-[240px]">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]" htmlFor="handoff-pause">
              Assistant stays quiet for (minutes)
            </label>
            <Input
              id="handoff-pause"
              type="number"
              min={0}
              max={1440}
              value={draft.handoffPauseMinutes}
              onChange={(event) =>
                update({
                  handoffPauseMinutes: Math.min(1440, Math.max(0, Math.round(Number(event.target.value) || 0))),
                })
              }
            />
          </div>
          {catalog.languages.map(({ language, label }) => (
            <div key={language} className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[var(--ink-soft)]">Handoff message — {label}</label>
              <Textarea
                className="text-[13px] min-h-[56px] resize-y"
                maxLength={500}
                dir={language === "URDU" ? "rtl" : undefined}
                value={draft.handoffMessages[language]}
                onChange={(event) =>
                  update({ handoffMessages: { ...draft.handoffMessages, [language]: event.target.value } })
                }
              />
            </div>
          ))}
        </PolicyCard>

        <PolicyCard
          title="Your own rules"
          hint="Plain-language rules the assistant follows. They can narrow what it does, never override its safety limits."
        >
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">House rules</label>
            <Textarea
              className="text-[13px] min-h-[96px] resize-y"
              maxLength={3000}
              placeholder={"e.g. Home visits are only within city limits.\nNever confirm a nurse's name before the coordinator does."}
              value={draft.houseRules}
              onChange={(event) => update({ houseRules: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">What to tell job applicants</label>
            <Textarea
              className="text-[13px] min-h-[72px] resize-y"
              maxLength={1500}
              placeholder="e.g. Only shortlisted candidates are contacted. Salary depends on experience and the interview."
              value={draft.recruitmentPolicy}
              onChange={(event) => update({ recruitmentPolicy: event.target.value })}
            />
          </div>
        </PolicyCard>

        <SettingsSaveBar>
          <Button type="button" variant="outline" disabled={!isDirty || isPending} onClick={() => setEdits(null)}>
            Discard
          </Button>
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save rules</>}
          </Button>
        </SettingsSaveBar>
      </form>

      <DepartmentsCard />
    </>
  );
}

function PolicyCard({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="card p-[22px] flex flex-col gap-3">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">{title}</h3>
        <p className="text-[11.5px] text-[var(--ink-mute)] mt-0.5 leading-snug">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function ActionPicker({
  value,
  canIgnore,
  onChange,
}: {
  value: PolicyAction;
  canIgnore: boolean;
  onChange: (action: PolicyAction) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--line)] p-0.5" role="radiogroup">
      {ACTIONS.filter((action) => canIgnore || action.key !== "IGNORE").map((action) => (
        <button
          key={action.key}
          type="button"
          role="radio"
          aria-checked={value === action.key}
          onClick={() => onChange(action.key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            value === action.key
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

/** "" is the default department. A route to a key with no department still shows, marked as falling back. */
function DepartmentSelect({
  value,
  departments,
  disabled,
  onChange,
}: {
  value: string | null;
  departments: Department[];
  disabled?: boolean;
  onChange: (department: string | null) => void;
}) {
  const active = departments.filter((department) => department.isActive);
  const unknown = value && !active.some((department) => department.key === value);
  return (
    <NativeSelect
      size="sm"
      className="min-w-[180px]"
      disabled={disabled}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
      aria-label="Department"
    >
      <NativeSelectOption value="">Default department</NativeSelectOption>
      {unknown && <NativeSelectOption value={value}>{value} (not set up — uses default)</NativeSelectOption>}
      {active.map((department) => (
        <NativeSelectOption key={department.id} value={department.key}>
          {department.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

function ToggleRow({
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
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div>
        <p className="text-[12.5px] font-medium text-[var(--ink)]">{label}</p>
        <p className="text-[11px] text-[var(--ink-mute)]">{desc}</p>
      </div>
    </div>
  );
}
