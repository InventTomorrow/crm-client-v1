"use client";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { Check, Loader2 } from "lucide-react";
import { Fragment } from "react";
import { usePaymentAccountDialogForm } from "../../hooks/usePaymentAccountDialogForm";
import {
  PAYMENT_ACCOUNT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentAccountForm,
} from "../../types";

type TextFieldName =
  | "bankName"
  | "accountTitle"
  | "accountNumber"
  | "iban"
  | "instructions";

interface TextFieldConfig {
  name: TextFieldName;
  label: string;
  placeholder: string;
  maxLength: number;
  inputMode?: "numeric" | "text";
  /** Only a bank transfer has an IBAN. */
  bankOnly?: boolean;
}

const getTextFields = (isBankTransfer: boolean): TextFieldConfig[] => [
  {
    name: "bankName",
    label: isBankTransfer ? "Bank name" : "Wallet / provider name (optional)",
    placeholder: isBankTransfer ? "e.g. Meezan Bank" : "e.g. Easypaisa",
    maxLength: 100,
  },
  {
    name: "accountTitle",
    label: "Account title",
    placeholder: "e.g. Asaan Digital Pvt Ltd",
    maxLength: 100,
  },
  {
    name: "accountNumber",
    label: isBankTransfer ? "Account number" : "Wallet / account number",
    placeholder: isBankTransfer
      ? "e.g. 0123 4567 8901 23"
      : "e.g. 0300 1234567",
    maxLength: 30,
    inputMode: isBankTransfer ? "numeric" : "text",
  },
  {
    name: "iban",
    label: "IBAN (optional)",
    placeholder: "PK36 SCBL 0000 0011 2345 6702",
    maxLength: 34,
    bankOnly: true,
  },
  {
    name: "instructions",
    label: "Note for the customer (optional)",
    placeholder: "e.g. Add your order number in the reference",
    maxLength: 300,
  },
];

interface PaymentAccountDialogProps {
  isOpen: boolean;
  /** Null adds a new account. */
  editedAccount: PaymentAccountForm | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (account: PaymentAccountForm) => void;
}

export function PaymentAccountDialog({
  isOpen,
  editedAccount,
  isSaving,
  onClose,
  onSave,
}: PaymentAccountDialogProps) {
  const { form, isBankTransfer, changeMethod } = usePaymentAccountDialogForm(
    isOpen,
    editedAccount,
  );
  const textFields = getTextFields(isBankTransfer).filter(
    (textField) => !textField.bankOnly || isBankTransfer,
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => !nextOpen && !isSaving && onClose()}
    >
      <DialogContent aria-describedby={undefined} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">
            {editedAccount ? "Edit payment account" : "Add payment account"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              // Stops the submit bubbling (through the portal) into a surrounding form.
              event.stopPropagation();
              void form.handleSubmit(onSave)(event);
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={changeMethod}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger size="lg" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_ACCOUNT_METHODS.map((method, methodIndex) => (
                          <Fragment key={method}>
                            {methodIndex > 0 && (
                              <SelectSeparator className="mx-1 bg-[var(--line)]" />
                            )}
                            <SelectItem value={method} className="h-10 pl-2.5">
                              {PAYMENT_METHOD_LABELS[method]}
                            </SelectItem>
                          </Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {textFields.map((textField) => (
                <FormField
                  key={textField.name}
                  control={form.control}
                  name={textField.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{textField.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={textField.placeholder}
                          maxLength={textField.maxLength}
                          inputMode={textField.inputMode}
                          autoComplete="off"
                          disabled={isSaving}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {editedAccount ? "Save account" : "Add account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
