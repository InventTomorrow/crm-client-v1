"use client";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { FileUpload } from "@/shared/ui/FileUpload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useJobSeekerForm } from "../hooks/useJobSeekerForm";
import { MAX_CV_FILE_SIZE_BYTES } from "../types";

/** Name and city have their own inputs, so their detail rows would be a second copy to keep in sync. */
const DETAIL_KEYS_WITH_OWN_INPUT = ["fullName", "city"];

const sectionClass = "card flex flex-col gap-4 rounded-xl p-5";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-l-2 border-[var(--accent)] pl-3 text-[13.5px] font-semibold text-[var(--ink)]">
      {children}
    </h2>
  );
}

/** One page for adding an applicant by hand and for correcting what the assistant collected. */
export function JobSeekerFormView({ leadId }: { leadId?: string }) {
  const {
    form,
    config,
    isEditing,
    isLoading,
    isSaving,
    isUploadingCv,
    cvUploadProgress,
    cvUploadPhase,
    uploadCv,
    removeCv,
    submit,
    backToList,
  } = useJobSeekerForm(leadId);

  const extraFields = (config?.fields ?? []).filter(
    (field) => !DETAIL_KEYS_WITH_OWN_INPUT.includes(field.key),
  );

  const header = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Back"
        onClick={backToList}
      >
        <ArrowLeft size={16} />
      </Button>
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--ink)]">
          {isEditing ? "Edit applicant" : "Add applicant"}
        </h1>
        <p className="text-[12px] text-[var(--ink-mute)]">
          {isEditing
            ? "Correct the contact details, what was collected, or replace the CV."
            : "For someone who applied outside chat, such as a walk-in or a referral."}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        className="mx-auto flex max-w-[860px] flex-col gap-4"
        aria-busy="true"
      >
        {header}
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-4">
      {header}

      <Form {...form}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <section className={sectionClass}>
            <SectionTitle>Contact</SectionTitle>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+923001234567"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input disabled={isSaving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {extraFields.length > 0 && (
            <section className={sectionClass}>
              <SectionTitle>Details collected</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {extraFields.map((detail) => (
                  <FormField
                    key={detail.key}
                    control={form.control}
                    name={`details.${detail.key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{detail.label}</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isSaving}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </section>
          )}

          <section className={sectionClass}>
            <SectionTitle>CV</SectionTitle>
            <FormField
              control={form.control}
              name="cv"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      compact
                      value={field.value?.url ?? null}
                      onChange={(url) => {
                        if (!url) removeCv();
                      }}
                      onUpload={uploadCv}
                      isUploading={isUploadingCv}
                      progress={cvUploadProgress}
                      uploadPhase={cvUploadPhase}
                      accept="application/pdf,image/*"
                      maxSize={MAX_CV_FILE_SIZE_BYTES}
                      description="Drop the CV here"
                      hint="PDF preferred, or a photo of it — up to 10 MB"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    Replacing the CV removes the previous file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <div className="card sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSaving}
              onClick={backToList}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSaving || isUploadingCv}
            >
              {isSaving ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Check size={14} className="mr-1.5" />
              )}
              {isEditing ? "Save changes" : "Add applicant"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
