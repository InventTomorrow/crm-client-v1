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
import { Input } from "@/shared/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/RadioGroup";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateApiKey } from "../hooks/useApiKeys";
import type { CreatedApiKey } from "../types";

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  mode: z.enum(["LIVE", "SANDBOX"]),
});
type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

export function CreateApiKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: create, isPending } = useCreateApiKey();
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { name: "", mode: "SANDBOX" },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setCreatedKey(null);
      setCopied(false);
      setRevealed(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (values: CreateApiKeyFormValues) => {
    create(values, { onSuccess: (created) => setCreatedKey(created) });
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] w-full">
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                Copy this key now — for your security, it will never be shown
                again. If you lose it, revoke it and create a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="flex w-full min-w-0 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-[12.5px]">
                {revealed
                  ? createdKey.key
                  : `${createdKey.keyPrefix}${"•".repeat(24)}`}
              </code>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="shrink-0"
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? "Hide key" : "Reveal key"}
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={handleCopy}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleClose(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New API key</DialogTitle>
              <DialogDescription>
                Sandbox keys are for testing your integration; they never notify
                real customers. Live keys create real orders and send real
                WhatsApp/email receipts.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My storefront integration"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <label className="flex items-center gap-2 text-[13px]">
                            <RadioGroupItem value="SANDBOX" />
                            Sandbox
                          </label>
                          <label className="flex items-center gap-2 text-[13px]">
                            <RadioGroupItem value="LIVE" />
                            Live
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : null}
                    Create key
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
