"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { CRMSwitch } from "@/shared/ui/CRMSwitch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import type { UseFormReturn } from "react-hook-form";
import type { BusinessProfileForm } from "../../types";

export function BusinessSupportFields({
  form,
}: {
  form: UseFormReturn<BusinessProfileForm>;
}) {
  const { tenant } = useCurrentTenant();
  // Patient-stage alerts are healthcare only for now.
  const isClinic = tenant?.businessVertical === "HEALTHCARE";

  return (
    <div className="card p-[22px] flex flex-col gap-3">
      <div>
        <h4 className="text-[13.5px] font-semibold">Support Contact</h4>
        <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
          {isClinic
            ? "Used when the AI hands a conversation off to a human and for the patient alerts below"
            : "Used only when the AI hands a conversation off to a human"}.{" "}
          Never as general conversation context. Phone defaults to your
          connected WhatsApp number until you set one here.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="supportName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team / Person name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Support Team" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supportPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp / Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Defaults to connected WhatsApp number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supportEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="support@yourbusiness.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="shareSupportContactOnHandoff"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <FormLabel className="text-[12.5px]">
                  Share these details with the customer on handoff
                </FormLabel>
                <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                  Off by default. The AI tells the customer a human will follow
                  up, without naming a contact. Turn on to include the
                  name/phone/email above in that message.
                </p>
              </div>
              <FormControl>
                <CRMSwitch
                  on={field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notifyOnEscalation"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <FormLabel className="text-[12.5px]">
                  {isClinic
                    ? "Notify me on WhatsApp about promising patients and escalations"
                    : "Notify me on WhatsApp when a chat is escalated"}
                </FormLabel>
                <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                  {isClinic
                    ? "Off by default. Turn on to receive the patient's details on the support number above when they're ready to book, when the AI books their appointment (the AI keeps working the chat), and whenever the AI hands a conversation off to a human."
                    : "Off by default. Turn on to receive the lead's info and escalation reason on the support number above whenever the AI hands a conversation off to a human."}
                </p>
                {isClinic && (
                  <p className="text-[11px] text-[var(--ink-mute)] mt-1">
                    Use a number other than your connected WhatsApp.
                    WhatsApp doesn&apos;t notify you about messages from your
                    own number. If they match, patient alerts go to the
                    owner&apos;s profile phone instead.
                  </p>
                )}
              </div>
              <FormControl>
                <CRMSwitch
                  on={field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="captureCustomizationRequests"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <FormLabel className="text-[12.5px]">
                  Take custom requests the assistant can&apos;t confirm
                </FormLabel>
                <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                  Off by default, so the assistant simply declines. Turn on and
                  it writes the request down instead. With no price or promise.
                  For your team to answer from the Customization requests tab
                  on Orders.
                </p>
              </div>
              <FormControl>
                <CRMSwitch
                  on={field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
