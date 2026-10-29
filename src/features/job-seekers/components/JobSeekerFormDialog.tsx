"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import {
  useCreateJobSeeker,
  useJobSeekerConfig,
  useUpdateJobSeeker,
} from "../hooks/useJobSeekers";
import {
  jobSeekerFormSchema,
  type JobSeeker,
  type JobSeekerFormValues,
} from "../types";

/** Name and city have their own inputs, so their detail rows would be a second copy to keep in sync. */
const DETAIL_KEYS_WITH_OWN_INPUT = ["fullName", "city"];

const EMPTY_VALUES: JobSeekerFormValues = {
  name: "",
  phone: "",
  city: "",
  details: {},
};

const toFormValues = (jobSeeker: JobSeeker | null): JobSeekerFormValues =>
  jobSeeker
    ? {
        name: jobSeeker.name ?? "",
        phone: jobSeeker.phone ?? "",
        city: jobSeeker.city ?? "",
        details: Object.fromEntries(
          jobSeeker.details.map((detail) => [detail.key, detail.value]),
        ),
      }
    : EMPTY_VALUES;

interface JobSeekerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The applicant being edited; null adds a new one. */
  jobSeeker: JobSeeker | null;
}

/** Add an applicant by hand, or correct what the assistant collected. */
export function JobSeekerFormDialog({
  open,
  onOpenChange,
  jobSeeker,
}: JobSeekerFormDialogProps) {
  const isEditing = jobSeeker !== null;
  const { data: config } = useJobSeekerConfig();
  const { mutate: createApplicant, isPending: isCreating } =
    useCreateJobSeeker();
  const { mutate: updateApplicant, isPending: isUpdating } =
    useUpdateJobSeeker();
  const isSaving = isCreating || isUpdating;

  const form = useForm<JobSeekerFormValues>({
    resolver: zodResolver(jobSeekerFormSchema),
    defaultValues: toFormValues(jobSeeker),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(jobSeeker));
  }, [open, jobSeeker, form]);

  const extraFields = (config?.fields ?? []).filter(
    (field) => !DETAIL_KEYS_WITH_OWN_INPUT.includes(field.key),
  );

  const submit = form.handleSubmit((values) => {
    const options = { onSuccess: () => onOpenChange(false) };
    if (jobSeeker) {
      updateApplicant({ leadId: jobSeeker.leadId, values }, options);
    } else {
      createApplicant(values, options);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSaving && onOpenChange(next)}
    >
      <DialogContent className="rounded-none sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit applicant" : "Add applicant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Correct the contact details or what was collected."
              : "For someone who applied outside chat, such as a walk-in or a referral."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                ) : (
                  <Check size={14} className="mr-1.5" />
                )}
                {isEditing ? "Save changes" : "Add applicant"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
