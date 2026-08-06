'use client';
import { Badge } from '@/shared/ui/Badge';
import { ArrowRight } from 'lucide-react';
import type { QualificationQuestionFormData } from '../types';
import { describeQuestionInputType } from '../utils/qualificationPreview';

/** The questions in the order a lead meets them, worded as the bot sends them. Each card carries
 * the answer contract underneath — type, required, and where the answer lands. */
export function QualificationQuestionsPreview({
  questions,
}: {
  questions: QualificationQuestionFormData[];
}) {
  return (
    <ol className="flex flex-col gap-3">
      {questions.map((question, index) => (
        <li key={question.fieldName || index} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--accent)]">
            {index + 1}
          </span>

          <div className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
            <p className="text-[13px] leading-relaxed text-[var(--ink)]">
              {question.questionText}
            </p>

            {question.inputType === 'QUICK_REPLY' && question.options.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {question.options.map((option) => (
                  <span
                    key={option}
                    className="rounded-full border border-[var(--accent)]/40 bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--accent)]"
                  >
                    {option}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] pt-2.5">
              <Badge variant="outline" className="text-[10px]">
                {describeQuestionInputType(question)}
              </Badge>
              <Badge
                variant={question.isRequired ? 'secondary' : 'ghost'}
                className="text-[10px]"
              >
                {question.isRequired ? 'Required' : 'Optional'}
              </Badge>
              <span className="ml-auto flex items-center gap-1 text-[10.5px] text-[var(--ink-mute)]">
                <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--ink-soft)]">
                  {question.fieldName}
                </code>
                {question.mapsToLeadField && (
                  <>
                    <ArrowRight size={10} />
                    <span className="text-[var(--ink-soft)]">lead.{question.mapsToLeadField}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
