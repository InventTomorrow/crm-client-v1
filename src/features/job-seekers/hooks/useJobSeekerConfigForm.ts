"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  jobSeekerConfigSchema,
  type JobSeekerConfig,
  type JobSeekerConfigValues,
} from "../types";
import { useJobSeekerConfig, useUpdateJobSeekerConfig } from "./useJobSeekers";

const EMPTY_CONFIG: JobSeekerConfigValues = {
  fields: [],
  afterDetailsInstructions: [],
  requestCv: true,
};

const toFormValues = (config: JobSeekerConfig): JobSeekerConfigValues => ({
  fields: config.fields,
  afterDetailsInstructions: config.afterDetailsInstructions,
  requestCv: config.requestCv,
});

export function useJobSeekerConfigForm() {
  const { data: savedConfig, isLoading } = useJobSeekerConfig();
  const { mutate: saveConfig, isPending: isSaving } =
    useUpdateJobSeekerConfig();

  const form = useForm<JobSeekerConfigValues>({
    resolver: zodResolver(jobSeekerConfigSchema),
    defaultValues: EMPTY_CONFIG,
  });
  const fieldRows = useFieldArray({ control: form.control, name: "fields" });

  useEffect(() => {
    if (savedConfig) form.reset(toFormValues(savedConfig));
  }, [savedConfig, form]);

  const submit = form.handleSubmit((values) => saveConfig(values));
  const discardChanges = () =>
    form.reset(savedConfig ? toFormValues(savedConfig) : EMPTY_CONFIG);

  return {
    form,
    fieldRows,
    isLoading,
    isSaving,
    isDirty: form.formState.isDirty,
    submit,
    discardChanges,
    addField: () => fieldRows.append({ label: "", isRequired: false }),
  };
}
