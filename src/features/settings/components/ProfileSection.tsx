"use client";
import { useMe, useUpdateMe } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { Input } from "@/shared/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { profileSchema, type ProfileFormValues } from "../types";

export function ProfileSection() {
  const { user, isLoading } = useMe();
  const { mutate: saveProfile, isPending: isSaving } = useUpdateMe();
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", avatarUrl: "" },
  });

  const avatarUrl = form.watch("avatarUrl") || "";

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user, form]);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Your Name";
  const displayEmail = user?.email ?? "";
  const currentMembership = user?.memberships?.[0];
  const workspaceName = currentMembership?.tenant?.name ?? "";
  const roleName = currentMembership?.role?.name ?? "";

  const handleSave = (data: ProfileFormValues) => {
    saveProfile(
      {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        avatarUrl: data.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Profile</h2>
      <div className="card p-[22px]">
        <div className="flex items-center gap-4 mb-5">
          <CRMAvatar name={fullName} src={avatarUrl || null} size={64} ring />
          <div>
            <h4 className="text-[15px] font-semibold">{fullName}</h4>
            <div className="text-[12.5px] text-[var(--ink-mute)]">
              {workspaceName}
              {workspaceName && roleName ? " · " : ""}
              {roleName}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  value={displayEmail}
                  readOnly
                  className="opacity-60 cursor-not-allowed"
                />
              </FormItem>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 0000000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div
                className={`text-[12.5px] flex items-center gap-1.5 ${saved ? "text-[#15803D]" : "text-[var(--ink-mute)]"}`}
              >
                {saved && (
                  <>
                    <Check size={13} /> Saved successfully
                  </>
                )}
                {!saved && form.formState.isDirty && "Unsaved changes"}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!form.formState.isDirty || isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isDirty || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {/* <DeleteAccountSection /> */}
      </div>
    </>
  );
}
