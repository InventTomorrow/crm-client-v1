"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import type { Lead } from "../types";
import { STATUS_META } from "../types";

// Common cities for the creatable city field (type a new one to add it).
const CITY_OPTIONS = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Rawalpindi",
  "Sialkot",
  "Quetta",
  "Hyderabad",
  "Gujranwala",
];

const leadFormSchema = z.object({
  name: z.string().min(1, "Name required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().optional(),
  channel: z.enum(["wa"]),
  status: z.enum(["prospect", "cold", "warm", "hot", "closed"]),
});
export type LeadFormData = z.infer<typeof leadFormSchema>;

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
              {mode === "edit" ? "Edit lead" : "Add new lead"}
            </DialogTitle>
            <DialogDescription className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
              {mode === "edit"
                ? "Update this lead’s information."
                : "Manually create a lead — channel sync will fill the rest."}
            </DialogDescription>
          </div>
          <button
            className="btn btn-ghost p-1.5 flex-shrink-0"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                      <input
                        className="input"
                        placeholder="Ali Hassan"
                        autoFocus
                        {...field}
                      />
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
                        <input
                          className="input"
                          placeholder="+92 321 ..."
                          {...field}
                        />
                      </FormControl>
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
                        <input
                          className="input"
                          placeholder="name@example.com"
                          {...field}
                        />
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
                        {/* Creatable: pick a suggestion or type a new city */}
                        <input
                          className="input"
                          list="lead-city-options"
                          placeholder="Type or pick a city"
                          {...field}
                        />
                      </FormControl>
                      <datalist id="lead-city-options">
                        {CITY_OPTIONS.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <FormControl>
                        <select className="input" {...field}>
                          <option value="wa">WhatsApp</option>
                        </select>
                      </FormControl>
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
                        {Object.entries(STATUS_META).map(([k, v]) => (
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
                                background: field.value === k ? "white" : v.color,
                              }}
                            />
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[var(--line)]">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-grad" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />{" "}
                    {mode === "edit" ? "Saving…" : "Adding…"}
                  </>
                ) : (
                  <>
                    {mode === "edit" ? <Check size={13} /> : <Plus size={13} />}{" "}
                    {mode === "edit" ? "Save changes" : "Add lead"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
