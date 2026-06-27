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
                        className="pl-8 h-10"
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
                        className="pl-8 h-10"
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

            <Button
              type="submit"
              size="lg"
              className="w-full mt-1"
              disabled={isPending}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
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
