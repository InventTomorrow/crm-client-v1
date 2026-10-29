"use client";
import { SeedRecordsButton } from "@/features/seed/components/SeedRecordsButton";
import { useUrlEnumState } from "@/shared/hooks/useUrlEnumState";
import { ListChecks, Users } from "lucide-react";
import {
  LINE_TAB_LIST_CLASS,
  LINE_TAB_TRIGGER_CLASS,
} from "@/shared/ui/tabStyles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { JobSeekerSettingsForm } from "./JobSeekerSettingsForm";
import { JobSeekersList } from "./JobSeekersList";

const TABS = [
  { key: "applicants", label: "Applicants", Icon: Users },
  { key: "settings", label: "What the assistant collects", Icon: ListChecks },
] as const;

type JobSeekersTab = (typeof TABS)[number]["key"];
const TAB_KEYS = TABS.map((tab) => tab.key);

export function JobSeekersView() {
  const [tab, setTab] = useUrlEnumState<JobSeekersTab>(
    "tab",
    TAB_KEYS,
    "applicants",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold">Job applicants</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-mute)]">
            People who reached out about a job or to help your business, and
            what the assistant collected from them.
          </p>
        </div>
        <SeedRecordsButton
          target={{ recordType: "JOB_APPLICANT", label: "Job applicants" }}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(nextTab) => setTab(nextTab as JobSeekersTab)}
      >
        <TabsList variant="line" className={LINE_TAB_LIST_CLASS}>
          {TABS.map((option) => (
            <TabsTrigger
              key={option.key}
              value={option.key}
              className={LINE_TAB_TRIGGER_CLASS}
            >
              <option.Icon className="size-4" />
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="applicants" className="pt-4">
          <JobSeekersList />
        </TabsContent>
        <TabsContent value="settings" className="pt-4">
          <JobSeekerSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
