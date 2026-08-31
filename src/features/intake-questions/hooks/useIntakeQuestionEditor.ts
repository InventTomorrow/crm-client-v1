"use client";
import { useMemo, useState } from "react";
import {
  useCreateIntakeQuestion,
  useDeleteIntakeQuestion,
  useIntakeQuestions,
  useIntakeQuestionUsage,
  useUpdateIntakeQuestion,
} from "./useIntakeQuestions";
import type { IntakeQuestion } from "../types";

/**
 * All the editing state the intake section needs, kept out of the component so
 * it renders and nothing more.
 *
 * The pool is workspace-wide: a question added here is available to every
 * service, and one deleted here stops being asked everywhere. The section says
 * so, but the consequence lives in the copy, not in this hook.
 */
export function useIntakeQuestionEditor() {
  const { data: questions = [], isLoading } = useIntakeQuestions();

  const createQuestion = useCreateIntakeQuestion();
  const updateQuestion = useUpdateIntakeQuestion();
  const deleteQuestion = useDeleteIntakeQuestion();

  const [draftText, setDraftText] = useState("");
  const [draftAsksAlways, setDraftAsksAlways] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [questionBeingEditedId, setQuestionBeingEditedId] = useState<
    string | null
  >(null);
  const [editedText, setEditedText] = useState("");

  const [questionPendingDeletion, setQuestionPendingDeletion] =
    useState<IntakeQuestion | null>(null);
  const { data: servicesAskingPendingDeletion = [] } = useIntakeQuestionUsage(
    questionPendingDeletion?.id,
  );

  const activeQuestions = useMemo(
    () => questions.filter((question) => question.isActive),
    [questions],
  );

  const alwaysAskedCount = useMemo(
    () => activeQuestions.filter((question) => question.askAlways).length,
    [activeQuestions],
  );

  const startAdding = () => {
    setIsAdding(true);
    setDraftText("");
    setDraftAsksAlways(false);
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setDraftText("");
  };

  /** Returns the new question so the caller can tick it for this service. */
  const submitDraft = async (): Promise<IntakeQuestion | null> => {
    const questionText = draftText.trim();
    if (!questionText) return null;

    const created = await createQuestion
      .mutateAsync({ questionText, askAlways: draftAsksAlways })
      .catch(() => null);

    if (created) cancelAdding();
    return created;
  };

  const startEditing = (question: IntakeQuestion) => {
    setQuestionBeingEditedId(question.id);
    setEditedText(question.questionText);
  };

  const cancelEditing = () => {
    setQuestionBeingEditedId(null);
    setEditedText("");
  };

  const submitEdit = async () => {
    const questionText = editedText.trim();
    if (!questionBeingEditedId || !questionText) return;

    await updateQuestion
      .mutateAsync({
        questionId: questionBeingEditedId,
        payload: { questionText },
      })
      .catch(() => null);

    cancelEditing();
  };

  const setAsksAlways = (question: IntakeQuestion, askAlways: boolean) => {
    updateQuestion.mutate({
      questionId: question.id,
      payload: { askAlways },
    });
  };

  const confirmDeletion = async () => {
    if (!questionPendingDeletion) return;
    await deleteQuestion.mutateAsync(questionPendingDeletion.id).catch(() => null);
    setQuestionPendingDeletion(null);
  };

  return {
    questions: activeQuestions,
    alwaysAskedCount,
    isLoading,

    isAdding,
    draftText,
    setDraftText,
    draftAsksAlways,
    setDraftAsksAlways,
    startAdding,
    cancelAdding,
    submitDraft,
    isCreating: createQuestion.isPending,

    questionBeingEditedId,
    editedText,
    setEditedText,
    startEditing,
    cancelEditing,
    submitEdit,
    isUpdating: updateQuestion.isPending,

    setAsksAlways,

    questionPendingDeletion,
    setQuestionPendingDeletion,
    servicesAskingPendingDeletion,
    confirmDeletion,
    isDeleting: deleteQuestion.isPending,
  };
}
