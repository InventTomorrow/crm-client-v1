"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { usePublicCheckout, useConfirmCheckout } from "./hooks";
import { checkoutFormSchema, type CheckoutFormData } from "./validation";

function money(currency: string, n: number): string {
  return `${currency} ${Number(n).toLocaleString()}`;
}

export function CheckoutView({ token }: { token: string }) {
  const { data, isLoading, isError } = usePublicCheckout(token);
  const confirm = useConfirmCheckout(token);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    values: {
      customerName: data?.shipping?.customerName ?? data?.customerName ?? "",
      customerPhone: data?.shipping?.customerPhone ?? "",
      email: data?.shipping?.email ?? "",
      addressLine1: data?.shipping?.addressLine1 ?? "",
      city: data?.shipping?.city ?? "",
    },
  });

  if (isLoading) {
    return (
      <Centered>
        <Loader2 size={26} className="animate-spin text-[var(--accent)]" />
      </Centered>
    );
  }

  if (isError || !data) {
    return (
      <Centered>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-[var(--ink)]">
            Checkout link not found
          </p>
          <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
            This link may have expired or already been used.
          </p>
        </div>
      </Centered>
    );
  }

  const placed = data.status !== "DRAFT" && data.status !== "PENDING";

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] px-4 py-8">
      {/* Brand */}
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <ShoppingBag size={17} />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">
            {data.tenantName}
          </div>
          <div className="text-[11.5px] text-[var(--ink-mute)]">
            Order #{data.orderNumber}
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="card overflow-hidden">
        <div className="border-b border-[var(--line)] p-4">
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
            Order summary
          </p>
          <div className="flex flex-col gap-2">
            {data.items.map((it, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="text-[var(--ink)]">
                  {it.name} × {it.quantity}
                </span>
                <span className="font-medium text-[var(--ink)]">
                  {money(data.currency, it.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 p-4 text-[13px]">
          <Row label="Subtotal" value={money(data.currency, data.subtotal)} />
          {data.discount > 0 && (
            <Row
              label="Discount"
              value={`-${money(data.currency, data.discount)}`}
            />
          )}
          <div className="mt-1 flex items-center justify-between border-t border-[var(--line)] pt-2">
            <span className="text-[14px] font-semibold text-[var(--ink)]">
              Total
            </span>
            <span className="text-[15px] font-semibold text-[var(--ink)]">
              {money(data.currency, data.total)}
            </span>
          </div>
        </div>
      </div>

      {placed ? (
        <div className="card mt-4 flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(34,197,94,0.12)]">
            <CheckCircle2 size={30} className="text-[#16A34A]" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[var(--ink)]">
              Order confirmed
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
              Thank you! {data.tenantName} will be in touch shortly to arrange
              delivery.
            </p>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              confirm.mutate({
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                email: values.email || undefined,
                addressLine1: values.addressLine1,
                city: values.city || undefined,
              }),
            )}
            className="card mt-4 flex flex-col gap-3 p-4"
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
              Delivery details
            </p>
            {data?.shipping?.customerName && (
              <p className="text-[11px] text-info-foreground">
                Pre-filled from a previous attempt — please review before confirming.
              </p>
            )}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="03xx-xxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="you@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-1 w-full justify-center"
              disabled={confirm.isPending}
            >
              {confirm.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : null}
              Confirm & place order · {money(data.currency, data.total)}
            </Button>
          </form>
        </Form>
      )}

      <p className="mt-4 text-center text-[11px] text-[var(--ink-mute)]">
        Secured checkout · {data.tenantName}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--ink-mute)]">{label}</span>
      <span className="text-[var(--ink)]">{value}</span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {children}
    </div>
  );
}
