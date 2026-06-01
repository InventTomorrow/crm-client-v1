"use client";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
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
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/useAuth";
import { registerSchema, type RegisterData } from "../types";

/* ── Register View ── */

const strengthMeta: Record<number, { label: string; color: string }> = {
  1: { label: "Weak", color: "#EF4444" },
  2: { label: "Fair", color: "#F59E0B" },
  3: { label: "Good", color: "#3B82F6" },
  4: { label: "Strong", color: "#10B981" },
};

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length > 0) score += 1;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}
export function RegisterView() {
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useRegister();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      tenantName: "",
    },
  });

  const pw = form.watch("password");
  const strength = passwordStrength(pw);
  const meta = pw ? strengthMeta[strength] : null;

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">
            Create your workspace
          </h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
            Start selling smarter with SaleFlow CRM
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) =>
              mutate(d, {
                onSuccess: () =>
                  router.push(
                    `/auth/verify-email?email=${encodeURIComponent(d.email)}`,
                  ),
              }),
            )}
            className="flex flex-col gap-3.5"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                      First name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="input"
                        placeholder="Ali"
                        autoFocus
                        {...field}
                      />
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
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                      Last name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="input"
                        placeholder="Hassan"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Workspace name */}
            <FormField
              control={form.control}
              name="tenantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Workspace / business name *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8"
                        placeholder="e.g. Karachi Karahi Co."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Work email *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8"
                        type="email"
                        placeholder="you@company.pk"
                        autoComplete="email"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Password *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8 pr-9"
                        type={showPw ? "text" : "password"}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </FormControl>
                  {/* Strength bar */}
                  {pw && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-[3px] flex-1 rounded-full transition-all duration-300"
                            style={{
                              background:
                                i <= strength ? meta?.color : "var(--line)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-[11px]"
                        style={{ color: meta?.color }}
                      >
                        {meta?.label}
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <label className="flex items-start gap-2 text-[12px] text-[var(--ink-soft)] cursor-pointer mt-0.5">
              <Checkbox className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="#" className="text-[var(--accent)] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-[var(--accent)] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              variant="default"
              className="btn btn-grad w-full justify-center mt-1"
              disabled={isPending}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Creating workspace…" : "Create workspace"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--accent)] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
