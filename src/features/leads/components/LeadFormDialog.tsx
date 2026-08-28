"use client";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Lead } from "../types";
import { useLeadVocabulary } from "../utils/leadVocabulary";
import { leadFormSchema, type LeadFormData } from "../validations.lead";
import {
  describeConflict,
  useLeadPhoneConflicts,
} from "../hooks/useLeadPhoneConflicts";

export default function LeadFormDialog({
  open,
  mode,
  initial,
  defaultStatus,
  onClose,
  onSubmit,
  isSaving,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Lead | null;
  /** Pre-selected status for new leads (e.g. the Kanban column the user clicked). */
  defaultStatus?: LeadFormData["status"];
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
  isSaving?: boolean;
}) {
  const vocabulary = useLeadVocabulary();
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "Lahore",
      channel: "wa",
      status: "prospect",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: initial?.name && initial.name !== "Unknown" ? initial.name : "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      city: initial?.city && initial.city !== "Unknown" ? initial.city : "",
      channel: "wa",
      status:
        (initial?.status as LeadFormData["status"]) ??
        defaultStatus ??
        "prospect",
    });
  }, [open, initial, defaultStatus, form]);

  const { findMatch, resetConflicts, isVerifying } = useLeadPhoneConflicts();

  useEffect(() => {
    if (open) resetConflicts();
  }, [open, resetConflicts]);

  /**
   * Flags a phone that already belongs to another lead. Returns true when the phone
   * is free to use — a match on the lead being edited is its own number, not a clash.
   */
  const isPhoneAvailable = async (phone: string): Promise<boolean> => {
    if (!phone.trim()) return true;

    const match = await findMatch(phone);
    if (!match || match.leadId === initial?.id) {
      form.clearErrors("phone");
      return true;
    }

    const conflict = describeConflict(match);
    form.setError("phone", { type: "duplicate", message: conflict.message });
    return !conflict.blocking;
  };

  const handleValidSubmit = async (data: LeadFormData) => {
    if (!(await isPhoneAvailable(data.phone ?? ""))) return;
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSaving) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[500px] max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-4 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">
              {mode === "edit"
                ? `Edit ${vocabulary.singular}`
                : `Add new ${vocabulary.singular}`}
            </DialogTitle>
            <DialogDescription className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
              {mode === "edit"
                ? `Update this ${vocabulary.singular}'s information.`
                : `Manually create a ${vocabulary.singular} — channel sync will fill the rest.`}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X size={18} />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValidSubmit)}
            className="overflow-y-auto flex-1"
          >
            <div className="p-5 flex flex-col gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ali Hassan" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+92 321 ..."
                          {...field}
                          onBlur={(event) => {
                            field.onBlur();
                            void isPhoneAvailable(event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lahore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wa">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(vocabulary.statusMeta).map(([k, v]) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => field.onChange(k)}
                            className="badge flex items-center gap-1.5 cursor-pointer font-medium py-[5px] px-3"
                            style={{
                              background: field.value === k ? v.color : v.tint,
                              color: field.value === k ? "white" : v.color,
                              border: `1px solid ${field.value === k ? v.color : "transparent"}`,
                            }}
                          >
                            <span
                              className="dot w-1.5 h-1.5"
                              style={{
                                background:
                                  field.value === k ? "white" : v.color,
                              }}
                            />
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[var(--line)]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isVerifying}>
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />{" "}
                    {mode === "edit" ? "Saving…" : "Adding…"}
                  </>
                ) : (
                  <>
                    {mode === "edit" ? <Check size={13} /> : <Plus size={13} />}{" "}
                    {mode === "edit"
                      ? "Save changes"
                      : `Add ${vocabulary.singular}`}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
