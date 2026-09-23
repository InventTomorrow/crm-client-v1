"use client";
import { Button } from "@/shared/ui/Button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Plus, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import type { BusinessProfileForm } from "../../types";

export function BusinessQaFields({
  form,
  faqFields,
}: {
  form: UseFormReturn<BusinessProfileForm>;
  faqFields: UseFieldArrayReturn<BusinessProfileForm, "businessFaqs">;
}) {
  return (
    <div className="card p-[22px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[13.5px] font-semibold">Custom Q&amp;A</h4>
          <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
            Question → answer pairs the bot can use directly.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => faqFields.append({ question: "", answer: "" })}
        >
          <Plus size={13} /> Add
        </Button>
      </div>

      {faqFields.fields.length === 0 && (
        <p className="text-[12px] text-[var(--ink-mute)] py-2">
          No Q&amp;A yet. Add a pair like &ldquo;Do you deliver? → Yes,
          nationwide COD.&rdquo;
        </p>
      )}

      {faqFields.fields.map((faqField, faqIndex) => (
        <div
          key={faqField.id}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 flex flex-col gap-2"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <FormField
                control={form.control}
                name={`businessFaqs.${faqIndex}.question`}
                render={({ field: faqInput }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Question" {...faqInput} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`businessFaqs.${faqIndex}.answer`}
                render={({ field: faqInput }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="min-h-[56px] resize-y"
                        placeholder="Answer"
                        {...faqInput}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove"
              className="text-[var(--ink-mute)] hover:text-destructive mt-1"
              onClick={() => faqFields.remove(faqIndex)}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
