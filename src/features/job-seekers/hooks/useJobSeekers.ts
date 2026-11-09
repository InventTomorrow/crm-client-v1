"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  getPresignedUrl,
  uploadToS3,
} from "@/features/inventory/services/productsService";
import { extractErrorMessage } from "@/lib/utils";
import {
  createJobSeeker,
  deleteJobSeeker,
  getJobSeeker,
  getJobSeekerConfig,
  listJobSeekers,
  updateJobSeeker,
  updateJobSeekerConfig,
} from "../services/jobSeekersService";
import type {
  JobSeekerConfigValues,
  JobSeekerFormValues,
  JobSeekersPage,
} from "../types";

const JOB_SEEKERS_KEY = ["job-seekers"] as const;
const CONFIG_KEY = [...JOB_SEEKERS_KEY, "config"] as const;

export function useInfiniteJobSeekers(search: string) {
  return useInfiniteQuery({
    queryKey: [...JOB_SEEKERS_KEY, "list", search] as const,
    queryFn: ({ pageParam }) => listJobSeekers({ search, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
    // Applicants arrive from chats while the page is open.
    refetchInterval: 60_000,
  });
}

export function useJobSeeker(leadId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...JOB_SEEKERS_KEY, "detail", leadId] as const,
    queryFn: () => getJobSeeker(leadId),
    enabled: options?.enabled ?? true,
  });
}

export function useJobSeekerConfig() {
  return useQuery({ queryKey: CONFIG_KEY, queryFn: getJobSeekerConfig });
}

export function useUpdateJobSeekerConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: JobSeekerConfigValues) =>
      updateJobSeekerConfig(config),
    onSuccess: (config) => {
      toast.success("Job applicant settings saved");
      queryClient.setQueryData(CONFIG_KEY, config);
      // Saved answers are labelled with the current field names.
      queryClient.invalidateQueries({ queryKey: [...JOB_SEEKERS_KEY, "list"] });
    },
    onError: (error) =>
      toast.error(
        extractErrorMessage(error, "Failed to save job applicant settings"),
      ),
  });
}

export function useCreateJobSeeker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: JobSeekerFormValues) => createJobSeeker(values),
    onSuccess: () => {
      toast.success("Applicant added");
      queryClient.invalidateQueries({ queryKey: JOB_SEEKERS_KEY });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to add the applicant")),
  });
}

export function useUpdateJobSeeker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJobSeeker,
    onSuccess: () => {
      toast.success("Applicant updated");
      queryClient.invalidateQueries({ queryKey: JOB_SEEKERS_KEY });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to update the applicant")),
  });
}

type InfiniteJobSeekers = { pages: JobSeekersPage[]; pageParams: unknown[] };

/** Optimistic: the row leaves every cached list at once and returns if the delete fails. */
export function useDeleteJobSeeker() {
  const queryClient = useQueryClient();
  const listKey = [...JOB_SEEKERS_KEY, "list"] as const;

  return useMutation({
    mutationFn: (leadId: string) => deleteJobSeeker(leadId),
    onMutate: async (leadId) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previousLists = queryClient.getQueriesData<InfiniteJobSeekers>({
        queryKey: listKey,
      });
      queryClient.setQueriesData<InfiniteJobSeekers>(
        { queryKey: listKey },
        (cached) =>
          cached && {
            ...cached,
            pages: cached.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.leadId !== leadId),
              total: Math.max(page.total - 1, 0),
            })),
          },
      );
      return { previousLists };
    },
    onError: (error, _leadId, context) => {
      context?.previousLists.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      );
      toast.error(extractErrorMessage(error, "Failed to delete the applicant"));
    },
    onSuccess: () => toast.success("Applicant deleted"),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: JOB_SEEKERS_KEY }),
  });
}

/** Presigned upload of a CV, reporting progress for the drop zone. */
export function useCvUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "requesting-url" | "uploading">(
    "idle",
  );

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setPhase("requesting-url");
      const { uploadUrl, publicUrl } = await getPresignedUrl(
        file.name,
        file.type,
        "cvs",
      );
      setPhase("uploading");
      await uploadToS3(uploadUrl, file, setProgress);
      return publicUrl;
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "CV upload failed")),
    onSettled: () => {
      setProgress(null);
      setPhase("idle");
    },
  });

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    phase,
  };
}
