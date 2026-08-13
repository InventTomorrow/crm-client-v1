'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { EditableListField } from '@/shared/ui/EditableListField';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import { Switch } from '@/shared/ui/Switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  LEAD_FIELD_MAPPINGS,
  QUESTION_INPUT_TYPES,
  QUESTION_INPUT_TYPE_LABELS,
} from '../types';

const questionDialogSchema = z
  .object({
    questionText: z.string().min(1, 'Question text is required'),
    inputType: z.enum(QUESTION_INPUT_TYPES),
    options: z.array(z.string()).default([]),
    isRequired: z.boolean().default(true),
    mapsToLeadField: z.enum(LEAD_FIELD_MAPPINGS).nullable(),
  })
  .refine(
    (data) => data.inputType !== 'QUICK_REPLY' || data.options.filter(Boolean).length >= 2,
    { message: 'Quick reply questions need at least two options', path: ['options'] },
  );

export type QuestionDialogData = z.infer<typeof questionDialogSchema>;
type QuestionDialogInput = z.input<typeof questionDialogSchema>;

interface QuestionDialogProps {
  open: boolean;
  initial?: QuestionDialogData | null;
  onClose: () => void;
  onSubmit: (data: QuestionDialogData) => void;
}

const emptyValues: QuestionDialogInput = {
  questionText: '',
  inputType: 'FREE_TEXT',
  options: [],
  isRequired: true,
  mapsToLeadField: null,
};

export function QuestionDialog({ open, initial, onClose, onSubmit }: QuestionDialogProps) {
  const isEdit = initial != null;
  const form = useForm<QuestionDialogInput, unknown, QuestionDialogData>({
    resolver: zodResolver(questionDialogSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) form.reset(initial ?? emptyValues);
  }, [open, initial, form]);

  const inputType = form.watch('inputType');

  function handleValidSubmit(data: QuestionDialogData) {
    onSubmit(data);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit question' : 'Add question'}</DialogTitle>
          <DialogDescription>
            What the bot asks, and how the lead&apos;s answer gets stored.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleValidSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's your monthly marketing budget?"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="inputType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer type</FormLabel>
                    <FormControl>
                      <NativeSelect size="lg" {...field}>
                        {QUESTION_INPUT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {QUESTION_INPUT_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapsToLeadField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Save to lead field</FormLabel>
                    <FormControl>
                      <NativeSelect
                        size="lg"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      >
                        <option value="">Don&apos;t save</option>
                        {LEAD_FIELD_MAPPINGS.map((leadField) => (
                          <option key={leadField} value={leadField}>
                            {leadField}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {inputType === 'QUICK_REPLY' && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <EditableListField
                        label="Reply options"
                        values={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="e.g. Under 50k"
                        addLabel="Add option"
                        emptyHint="Quick replies need at least two options."
                        showOrderHandle
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Required</FormLabel>
                    <FormDescription>The bot waits here until it gets an answer.</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? <Check size={13} /> : <Plus size={13} />}
                {isEdit ? 'Save changes' : 'Add question'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
