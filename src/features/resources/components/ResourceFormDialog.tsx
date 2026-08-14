"use client";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { FileUpload } from "@/shared/ui/FileUpload";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { useResourceForm } from "../hooks/useResourceForm";
import {
  MAX_RESOURCE_FILE_SIZE_BYTES,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type TenantResource,
} from "../types";
import { ResourceConditionsBuilder } from "./ResourceConditionsBuilder";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The resource being edited, or null to create a new one. */
  editing: TenantResource | null;
}

// Images go out as WhatsApp image messages, PDFs as documents.
const ACCEPTED_TYPES = "image/*,application/pdf";

export function ResourceFormDialog({
  open,
  onOpenChange,
  editing,
}: ResourceFormDialogProps) {
  const {
    form,
    isSaving,
    isUploading,
    uploadProgress,
    uploadPhase,
    handleFilePicked,
    clearFile,
    handleSubmit,
    resetForm,
  } = useResourceForm({
    editing,
    onSaved: () => onOpenChange(false),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] min-w-xl max-w-5xl w-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit resource" : "Add a resource"}
          </DialogTitle>
          <DialogDescription>
            Files the bot shares with leads at the right moment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <FileUpload
                      compact
                      value={field.value || null}
                      onChange={(url) => {
                        if (!url) clearFile();
                      }}
                      onUpload={handleFilePicked}
                      isUploading={isUploading}
                      progress={uploadProgress}
                      uploadPhase={uploadPhase}
                      accept={ACCEPTED_TYPES}
                      maxSize={MAX_RESOURCE_FILE_SIZE_BYTES}
                      description="Drop a brochure, portfolio or case study"
                      hint="Image or PDF — up to 10 MB"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2026 Services Brochure"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What the bot calls it when sharing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger size="lg" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESOURCE_TYPES.map((resourceType) => (
                        <SelectItem key={resourceType} value={resourceType}>
                          {RESOURCE_TYPE_LABELS[resourceType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Full breakdown of packages and pricing."
                      disabled={isSaving}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who gets this</FormLabel>
                  <FormControl>
                    <ResourceConditionsBuilder
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    All conditions must match. Leave empty to share with every
                    lead.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <FormLabel>Available to the bot</FormLabel>
                    <FormDescription>
                      Turn off to keep the file without sharing it.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSaving || isUploading}>
                {isSaving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Add resource"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
