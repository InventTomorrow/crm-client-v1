"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  createDepartment,
  deleteDepartment,
  getAgentPolicy,
  listDepartments,
  updateAgentPolicy,
  updateDepartment,
} from "../services/assistantPolicyService";
import type { AgentPolicy, DepartmentForm } from "../types";

const POLICY_KEY = ["agent-policy"];
const DEPARTMENTS_KEY = ["departments"];

export function useAgentPolicy() {
  return useQuery({ queryKey: POLICY_KEY, queryFn: getAgentPolicy });
}

export function useUpdateAgentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policy: AgentPolicy) => updateAgentPolicy(policy),
    onSuccess: (settings) => {
      toast.success("Assistant rules saved");
      queryClient.setQueryData(POLICY_KEY, settings);
      // Photo analysis is stored on the chatbot config.
      queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Failed to save assistant rules")),
  });
}

export function useDepartments() {
  return useQuery({ queryKey: DEPARTMENTS_KEY, queryFn: listDepartments });
}

export function useSaveDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id?: string; form: DepartmentForm }) =>
      id ? updateDepartment(id, form) : createDepartment(form),
    onSuccess: (_department, { id }) => {
      toast.success(id ? "Department updated" : "Department added");
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Failed to save department")),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      toast.success("Department removed");
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      // A rule routed to it now falls back to the default department.
      queryClient.invalidateQueries({ queryKey: POLICY_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Failed to remove department")),
  });
}
