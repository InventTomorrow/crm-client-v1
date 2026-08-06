'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { PreviewDetailRow, PreviewEmptyHint, PreviewPanel } from '@/shared/ui/PreviewPanel';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import {
  Calculator,
  Gauge,
  ListChecks,
  MessageSquare,
  Pencil,
  Target,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQualificationFormQuery } from '../hooks/useQualification';
import {
  countRequiredQuestions,
  describeScoringRule,
  getMappedLeadFields,
  getMaxAchievableScore,
  getQualificationBands,
  getScoringGroupsByQuestion,
  isQualificationConfigured,
} from '../utils/qualificationPreview';
import { QualificationEmptyState } from './QualificationEmptyState';
import { QualificationQuestionsPreview } from './QualificationQuestionsPreview';

/** Read-only view of the single qualification form. There is only ever one per workspace, so this
 * is the landing page for the section — the editor sits behind the Edit action. */
export function QualificationPreviewView() {
  const router = useRouter();
  const { data: savedForm, isLoading, isError } = useQualificationFormQuery();

  const goToEditor = () => router.push('/qualification/edit');

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">Bot questions</h1>
          {savedForm && isQualificationConfigured(savedForm) && (
            <>
              <Badge
                variant={savedForm.isActive ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {savedForm.isActive ? 'Active' : 'Paused'}
              </Badge>
              {savedForm.version > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  Version {savedForm.version}
                </Badge>
              )}
            </>
          )}
        </div>
        <p className="text-[12px] text-[var(--ink-mute)]">
          What the bot asks a new lead, and how their answers score them.
        </p>
      </div>

      {savedForm && isQualificationConfigured(savedForm) && (
        <Button size="lg" onClick={goToEditor}>
          <Pencil size={14} className="mr-1.5" /> Edit
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !savedForm) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        {header}
        <p className="py-12 text-center text-sm text-destructive">
          Failed to load the qualification form. Please refresh.
        </p>
      </div>
    );
  }

  if (!isQualificationConfigured(savedForm)) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        {header}
        <QualificationEmptyState onSetup={goToEditor} />
      </div>
    );
  }

  const bands = getQualificationBands(savedForm);
  const maxScore = getMaxAchievableScore(savedForm);
  const { groups: scoringGroups, orphanedRules } = getScoringGroupsByQuestion(savedForm);
  const mappedLeadFields = getMappedLeadFields(savedForm);
  const requiredCount = countRequiredQuestions(savedForm);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Questions"
          value={savedForm.questions.length}
          hint={`${requiredCount} required`}
          Icon={MessageSquare}
        />
        <StatCard
          label="Scoring rules"
          value={savedForm.scoringRules.length}
          hint={savedForm.scoringRules.length === 0 ? 'Every lead scores zero' : undefined}
          Icon={Calculator}
        />
        <StatCard
          label="Max score"
          value={maxScore}
          hint={maxScore >= savedForm.hotThreshold ? 'Hot is reachable' : 'Hot is unreachable'}
          Icon={Target}
        />
        <StatCard
          label="Hot at"
          value={savedForm.hotThreshold}
          hint={`Warm at ${savedForm.warmThreshold}`}
          Icon={Gauge}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="flex min-w-0 flex-col gap-5">
          <PreviewPanel
            Icon={MessageSquare}
            title="Questions"
            description="Asked in this order. The bot stops at the first unanswered required question."
            action={
              <span className="text-[11px] text-[var(--ink-mute)]">
                {savedForm.questions.length} total
              </span>
            }
          >
            {savedForm.questions.length === 0 ? (
              <PreviewEmptyHint>
                No questions saved — the bot has nothing to ask.
              </PreviewEmptyHint>
            ) : (
              <QualificationQuestionsPreview questions={savedForm.questions} />
            )}
          </PreviewPanel>

          <PreviewPanel
            Icon={Calculator}
            title="Scoring"
            description="Each matching rule adds its score. The total decides the lead's temperature."
          >
            {savedForm.scoringRules.length === 0 ? (
              <PreviewEmptyHint>
                No rules yet — every lead totals zero and lands as cold.
              </PreviewEmptyHint>
            ) : (
              <div className="flex flex-col gap-3">
                {scoringGroups.map((group) => (
                  <div
                    key={group.fieldName}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <p className="text-[12.5px] font-medium text-[var(--ink)]">
                      {group.questionText}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {group.rules.map((rule, ruleIndex) => (
                        <li
                          key={`${rule.operator}-${rule.value}-${ruleIndex}`}
                          className="flex items-center gap-2 text-[12px] text-[var(--ink-soft)]"
                        >
                          <ListChecks size={12} className="shrink-0 text-[var(--accent)]" />
                          <span className="min-w-0">{describeScoringRule(rule)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {orphanedRules.length > 0 && (
                  <p className="rounded-xl border border-dashed border-destructive/40 px-4 py-3 text-[11.5px] text-destructive">
                    {orphanedRules.length} rule{orphanedRules.length === 1 ? '' : 's'} point at a
                    question that no longer exists and will never match.
                  </p>
                )}
              </div>
            )}
          </PreviewPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <PreviewPanel
            Icon={Gauge}
            title="Thresholds"
            description="Where a total score lands on the scale."
          >
            <div className="flex flex-col gap-2">
              {bands.map((band) => (
                <div
                  key={band.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5"
                >
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ink)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: band.color }}
                    />
                    {band.label}
                  </span>
                  <span className="text-[11.5px] text-[var(--ink-mute)]">{band.range}</span>
                </div>
              ))}
            </div>
          </PreviewPanel>

          <PreviewPanel
            Icon={Users}
            title="Saved to the lead"
            description="Answers written straight onto the lead record."
          >
            {mappedLeadFields.length === 0 ? (
              <PreviewEmptyHint>
                No answers are mapped — they stay on the qualification record only.
              </PreviewEmptyHint>
            ) : (
              <div className="flex flex-col gap-2">
                {mappedLeadFields.map((mapping) => (
                  <PreviewDetailRow
                    key={mapping.fieldName}
                    label={mapping.fieldName}
                    value={`lead.${mapping.leadField}`}
                  />
                ))}
              </div>
            )}
          </PreviewPanel>
        </div>
      </div>
    </div>
  );
}
