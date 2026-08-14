'use client';
import { Button } from '@/shared/ui/Button';
import { ClipboardList, Plus } from 'lucide-react';
import { QUALIFICATION_FORM_STEPS } from '../utils/qualificationFormSections';

/** Shown until a form has actually been saved. It doubles as the preview: the sections listed
 * here are the same ones the editor walks, so the page reads the same before and after setup. */
export function QualificationEmptyState({ onSetup }: { onSetup: () => void }) {
  return (
    <section className="card flex flex-col items-center gap-6 border-dashed px-5 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--ink-mute)]">
        <ClipboardList size={24} />
      </span>

      <div>
        <p className="text-[15px] font-semibold text-[var(--ink)]">No questions yet</p>
        <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
          Leads still reach your pipeline — they just arrive unscored. Add questions and the bot
          will ask, score and sort them before anyone opens a chat.
        </p>
      </div>

      <ul className="grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {QUALIFICATION_FORM_STEPS.map(({ id, label, description, Icon }) => (
          <li
            key={id}
            className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3"
          >
            {Icon && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)]">
                <Icon size={14} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-[var(--ink)]">{label}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-mute)]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Button size="lg" onClick={onSetup}>
        <Plus size={14} className="mr-1.5" /> Add bot questions
      </Button>
    </section>
  );
}
