"use client";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { useAffiliateJoinForm } from "../../hooks/useAffiliateJoin";
import type { AffiliateJoinFormValues, ValidAffiliateInvite } from "../../types";

const labelClass = "text-[12.5px] font-medium text-[var(--ink-soft)]";

function PasswordField({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<AffiliateJoinFormValues>;
  name: "password" | "confirmPassword";
  label: string;
  placeholder: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label} *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                className="pr-9"
                type={isVisible ? "text" : "password"}
                placeholder={placeholder}
                autoComplete="new-password"
                {...field}
              />
              <button
                type="button"
                aria-label={isVisible ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function AffiliateJoinForm({ token, invite }: { token: string; invite: ValidAffiliateInvite }) {
  const { form, isSignup, onSubmit, isSubmitting } = useAffiliateJoinForm(token, invite);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        {isSignup && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>First name *</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" autoFocus {...field} />
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
                    <FormLabel className={labelClass}>Last name</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>WhatsApp number</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" placeholder="03XX XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
        />
        <PasswordField control={form.control} name="confirmPassword" label="Confirm password" placeholder="Repeat password" />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="mt-0.5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="affiliate-accept-terms"
                  className="mt-0.5 cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label htmlFor="affiliate-accept-terms" className="cursor-pointer text-[12px] text-[var(--ink-soft)]">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[var(--accent)] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-[var(--accent)] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isSubmitting ? "Setting up…" : isSignup ? "Create account" : "Set password and continue"}
        </Button>
      </form>
    </Form>
  );
}
