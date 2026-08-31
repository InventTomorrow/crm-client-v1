import { apiClient } from "@/lib/apiClient";
import type {
  IntakeQuestion,
  IntakeQuestionFormData,
  IntakeQuestionUsage,
} from "../types";

export type UpdateIntakeQuestionPayload = Partial<
  IntakeQuestionFormData & { isActive: boolean }
>;

export async function getIntakeQuestions() {
  const res = await apiClient.get<{ success: true; data: IntakeQuestion[] }>(
    "/intake-questions",
  );
  return res.data.data;
}

/** Which services still ask this question — read before offering to delete it. */
export async function getIntakeQuestionUsage(questionId: string) {
  const res = await apiClient.get<{
    success: true;
    data: IntakeQuestionUsage[];
  }>(`/intake-questions/${questionId}/services`);
  return res.data.data;
}

export async function createIntakeQuestion(payload: IntakeQuestionFormData) {
  const res = await apiClient.post<{ success: true; data: IntakeQuestion }>(
    "/intake-questions",
    payload,
  );
  return res.data.data;
}

export async function updateIntakeQuestion(
  questionId: string,
  payload: UpdateIntakeQuestionPayload,
) {
  const res = await apiClient.patch<{ success: true; data: IntakeQuestion }>(
    `/intake-questions/${questionId}`,
    payload,
  );
  return res.data.data;
}

export async function deleteIntakeQuestion(questionId: string) {
  await apiClient.delete(`/intake-questions/${questionId}`);
}
