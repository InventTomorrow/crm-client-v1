"use client";
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
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/useAuth";
import { loginSchema, type LoginData } from "../types";
import { AuthFormError } from "./AuthFormError";

/* ── Login View ── */
export function LoginView() {
  const [showPw, setShowPw] = useState(false);
  const { mutate, isPending, error } = useLogin();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginData) => {
    mutate(data);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">
            Welcome back
          </h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
            Sign in to manage your conversations, leads, and inventory.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3.5"
          >
            <AuthFormError error={error} />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Work email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8 h-10"
                        type="email"
                        placeholder="you@company.pk"
                        autoComplete="email"
                        autoFocus
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8 h-10"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between mt-0.5">
              <label className="flex items-center gap-2 text-[12.5px] text-[var(--ink-soft)] cursor-pointer select-none">
                <Checkbox defaultChecked />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[12px] text-[var(--accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-grad w-full justify-center mt-1"
              disabled={isPending}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-px bg-[var(--line)]" />
              <span className="text-[11.5px] text-[var(--ink-mute)] whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-[var(--line)]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn btn-outline justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h5.9a5.04 5.04 0 0 1-2.18 3.31v2.75h3.53c2.07-1.9 3.26-4.71 3.26-8.3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.95 0 5.42-.98 7.23-2.66l-3.53-2.74c-.98.66-2.24 1.04-3.7 1.04-2.84 0-5.25-1.92-6.11-4.5H2.25v2.82A11 11 0 0 0 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.89 14.14a6.6 6.6 0 0 1 0-4.28V7.04H2.25a11 11 0 0 0 0 9.92l3.64-2.82z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.46c1.6 0 3.04.55 4.17 1.63l3.13-3.13C17.42 2.13 14.95 1 12 1A11 11 0 0 0 2.25 7.04l3.64 2.82C6.75 7.38 9.16 5.46 12 5.46z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="btn btn-outline justify-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12-1.13.42-2.29 1.1-3.08.748-.85 2.05-1.5 3.064-1.57zM21.5 17.5c-.665 1.46-.99 2.11-1.847 3.4-1.197 1.81-2.886 4.06-4.978 4.08-1.86.02-2.34-1.21-4.86-1.2-2.52.01-3.05 1.22-4.91 1.2-2.09-.02-3.69-2.05-4.88-3.85C-.5 16.46-.86 9.97 2.42 6.74c1.31-1.29 3.06-2.11 4.93-2.11 1.86 0 3.03 1.02 4.55 1.02 1.49 0 2.4-1.02 4.55-1.02 1.66 0 3.42.9 4.66 2.46-4.1 2.25-3.43 8.1.39 10.41z" />
                </svg>
                Apple
              </button>
            </div>
          </form>
        </Form>

        <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
          By signing in you agree to our{" "}
          <Link href="#" className="text-[var(--ink-soft)] hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[var(--ink-soft)] hover:underline">
            Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
