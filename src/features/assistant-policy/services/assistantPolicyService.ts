import { apiClient } from "@/lib/apiClient";
import type {
  AgentPolicy,
  AgentPolicySettings,
  Department,
  DepartmentForm,
} from "../types";

export async function getAgentPolicy(): Promise<AgentPolicySettings> {
  const res = await apiClient.get<{ success: true; data: AgentPolicySettings }>("/agent-policy");
  return res.data.data;
}

export async function updateAgentPolicy(policy: AgentPolicy): Promise<AgentPolicySettings> {
  const res = await apiClient.put<{ success: true; data: AgentPolicySettings }>("/agent-policy", policy);
  return res.data.data;
}

export async function listDepartments(): Promise<Department[]> {
  const res = await apiClient.get<{ success: true; data: Department[] }>("/departments");
  return res.data.data;
}

/** Empty strings become null, so clearing a field clears it on the server. */
const toPayload = (form: DepartmentForm) => ({
  key: form.key.trim(),
  name: form.name.trim(),
  whatsappNumber: form.whatsappNumber.trim() || null,
  email: form.email.trim() || null,
  isPublicContact: form.isPublicContact,
  handoffMessage: form.handoffMessage.trim() || null,
  isDefault: form.isDefault,
});

export async function createDepartment(form: DepartmentForm): Promise<Department> {
  const res = await apiClient.post<{ success: true; data: Department }>("/departments", toPayload(form));
  return res.data.data;
}

export async function updateDepartment(id: string, form: DepartmentForm): Promise<Department> {
  const res = await apiClient.put<{ success: true; data: Department }>(`/departments/${id}`, toPayload(form));
  return res.data.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}
