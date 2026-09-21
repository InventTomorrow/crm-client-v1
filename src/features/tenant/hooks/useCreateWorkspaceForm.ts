"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useWorkspaceAllowance } from "@/features/billing/hooks/useBilling";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createWorkspaceSchema, type CreateWorkspaceForm } from "../types";
import { useCreateTenant } from "./useTenant";

export function useCreateWorkspaceForm(onCreated: () => void) {
  const { mutate: createTenant, isPending } = useCreateTenant();
  const { user } = useMe();
  const { data: workspaceAllowance } = useWorkspaceAllowance();
  const isWorkspaceLimitReached = workspaceAllowance?.canCreate === false;

  const ownedWorkspaces = (user?.memberships ?? [])
    .filter((membership) => membership.role.name === "OWNER")
    .map((membership) => ({ id: membership.tenant.id, name: membership.tenant.name }));

  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", businessName: "" },
  });

  const handleCreateWorkspace = form.handleSubmit((values) => {
    // At the plan cap the owner must pick which workspace gives up its slot.
    if (isWorkspaceLimitReached && !values.replaceTenantId) {
      form.setError("replaceTenantId", { message: "Pick a workspace to replace" });
      return;
    }
    createTenant(
      {
        name: values.name,
        businessName: values.businessName,
        businessVertical: values.businessVertical,
        ...(isWorkspaceLimitReached ? { replaceTenantId: values.replaceTenantId } : {}),
      },
      { onSuccess: onCreated },
    );
  });

  return {
    form,
    handleCreateWorkspace,
    isPending,
    isWorkspaceLimitReached,
    workspaceAllowance,
    ownedWorkspaces,
  };
}
