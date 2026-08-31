"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createIntakeQuestion,
  deleteIntakeQuestion,
  getIntakeQuestions,
  getIntakeQuestionUsage,
  updateIntakeQuestion,
  type UpdateIntakeQuestionPayload,
} from "../services/intakeQuestionsService";
import type { IntakeQuestion, IntakeQuestionFormData } from "../types";

export const intakeQuestionKeys = {
  all: ["intake-questions"] as const,
  usage: (questionId: string) =>
    ["intake-questions", "usage", questionId] as const,
};

/**
 * The workspace's whole question pool. Small and shared by every service form,
 * so it is fetched once and cached rather than paged.
 */
export function useIntakeQuestions() {
  return useQuery({
    queryKey: intakeQuestionKeys.all,
    queryFn: getIntakeQuestions,
    staleTime: 5 * 60 * 1000,
  });
}

/** Deferred until the delete is actually being considered. */
export function useIntakeQuestionUsage(questionId: string | undefined) {
  return useQuery({
    queryKey: intakeQuestionKeys.usage(questionId ?? ""),
    queryFn: () => getIntakeQuestionUsage(questionId!),
    enabled: Boolean(questionId),
  });
}

export function useCreateIntakeQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IntakeQuestionFormData) =>
      createIntakeQuestion(payload),
    // No optimistic insert: the server derives the key, and a row invented here
    // would carry a fake one that the service's checkbox then writes down.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeQuestionKeys.all });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateIntakeQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: UpdateIntakeQuestionPayload;
    }) => updateIntakeQuestion(questionId, payload),

    onMutate: async ({ questionId, payload }) => {
      await queryClient.cancelQueries({ queryKey: intakeQuestionKeys.all });
      const previousQuestions = queryClient.getQueryData<IntakeQuestion[]>(
        intakeQuestionKeys.all,
      );

      queryClient.setQueryData<IntakeQuestion[]>(
        intakeQuestionKeys.all,
        (questions) =>
          questions?.map((question) =>
            question.id === questionId
              ? { ...question, ...payload }
              : question,
          ),
      );

      return { previousQuestions };
    },

    onError: (error, _variables, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          intakeQuestionKeys.all,
          context.previousQuestions,
        );
      }
      toast.error(extractErrorMessage(error));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: intakeQuestionKeys.all });
    },
  });
}

export function useDeleteIntakeQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteIntakeQuestion(questionId),

    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: intakeQuestionKeys.all });
      const previousQuestions = queryClient.getQueryData<IntakeQuestion[]>(
        intakeQuestionKeys.all,
      );

      queryClient.setQueryData<IntakeQuestion[]>(
        intakeQuestionKeys.all,
        (questions) =>
          questions?.filter((question) => question.id !== questionId),
      );

      return { previousQuestions };
    },

    onError: (error, _questionId, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          intakeQuestionKeys.all,
          context.previousQuestions,
        );
      }
      toast.error(extractErrorMessage(error));
    },

    onSuccess: () => {
      toast.success("Question removed");
      // Deleting unhooks the key from every service that asked it.
      queryClient.invalidateQueries({ queryKey: ["clinical-services"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: intakeQuestionKeys.all });
    },
  });
}
