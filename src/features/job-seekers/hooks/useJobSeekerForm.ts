"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  jobSeekerFormSchema,
  type JobSeeker,
  type JobSeekerFormValues,
} from "../types";
import {
  useCreateJobSeeker,
  useCvUpload,
  useJobSeeker,
  useJobSeekerConfig,
  useUpdateJobSeeker,
} from "./useJobSeekers";

const EMPTY_VALUES: JobSeekerFormValues = {
  name: "",
  phone: "",
  city: "",
  details: {},
  cv: null,
};

const toFormValues = (jobSeeker: JobSeeker): JobSeekerFormValues => ({
  name: jobSeeker.name ?? "",
  phone: jobSeeker.phone ?? "",
  city: jobSeeker.city ?? "",
  details: Object.fromEntries(
    jobSeeker.details.map((detail) => [detail.key, detail.value]),
  ),
  cv: jobSeeker.cv
    ? {
        url: jobSeeker.cv.url,
        fileName: jobSeeker.cv.fileName,
        mimeType: jobSeeker.cv.mimeType,
      }
    : null,
});

/** Drives the add and edit page; `leadId` present means editing that applicant. */
export function useJobSeekerForm(leadId?: string) {
  const router = useRouter();
  const isEditing = Boolean(leadId);
  const { data: jobSeeker, isLoading: isLoadingApplicant } = useJobSeeker(
    leadId ?? "",
    { enabled: isEditing },
  );
  const { data: config, isLoading: isLoadingConfig } = useJobSeekerConfig();
  const { mutate: createApplicant, isPending: isCreating } =
    useCreateJobSeeker();
  const { mutate: updateApplicant, isPending: isUpdating } =
    useUpdateJobSeeker();
  const cvUpload = useCvUpload();

  const form = useForm<JobSeekerFormValues>({
    resolver: zodResolver(jobSeekerFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (jobSeeker) form.reset(toFormValues(jobSeeker));
  }, [jobSeeker, form]);

  const backToList = () =>
    router.push(leadId ? `/job-seekers/${leadId}` : "/job-seekers");

  const submit = form.handleSubmit((values) => {
    const options = { onSuccess: backToList };
    if (leadId) updateApplicant({ leadId, values }, options);
    else createApplicant(values, options);
  });

  /** Uploads straight away and keeps the file's name and type for the record. */
  const uploadCv = async (file: File): Promise<string> => {
    const url = await cvUpload.upload(file);
    form.setValue(
      "cv",
      { url, fileName: file.name, mimeType: file.type || null },
      { shouldDirty: true },
    );
    return url;
  };

  return {
    form,
    config,
    isEditing,
    isLoading: isLoadingConfig || (isEditing && isLoadingApplicant),
    isSaving: isCreating || isUpdating,
    isUploadingCv: cvUpload.isUploading,
    cvUploadProgress: cvUpload.progress,
    cvUploadPhase: cvUpload.phase,
    uploadCv,
    removeCv: () => form.setValue("cv", null, { shouldDirty: true }),
    submit,
    backToList,
  };
}
