"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { hasCapability } from "@/lib/business-verticals";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import {
  Building2,
  Check,
  Headset,
  Info,
  Loader2,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { useBusinessProfileForm } from "../hooks/useBusinessProfileForm";
import { BusinessAboutFields } from "./business/BusinessAboutFields";
import { BusinessCategoryCard } from "./business/BusinessCategoryCard";
import { BusinessQaFields } from "./business/BusinessQaFields";
import { BusinessSupportFields } from "./business/BusinessSupportFields";
import { BusinessNameCard } from "./BusinessNameCard";
import { PaymentAccountsCard } from "./payment/PaymentAccountsCard";
import { SettingsSaveBar } from "./SettingsSaveBar";

const GENERAL_TAB = "general";
const PAYMENTS_TAB = "payments";
const PROFILE_FORM_TABS = ["about", "qa", "support"] as const;

// Radix marks the selected tab with data-state="active", not a data-active attribute.
const tabTriggerClassName =
  "h-9 flex-none px-3 text-[13px] text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] data-[state=active]:border-[var(--accent)]/30 data-[state=active]:bg-[var(--accent-soft)] data-[state=active]:font-semibold data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm dark:data-[state=active]:border-[var(--accent)]/30 dark:data-[state=active]:bg-[var(--accent-soft)] dark:data-[state=active]:text-[var(--accent)]";

// Kept mounted so the shared form keeps every field registered; only the active tab shows.
const formTabContentClassName =
  "flex flex-col gap-3.5 data-[state=inactive]:hidden";

export function BusinessSection() {
  const { tenant } = useCurrentTenant();
  const [activeTab, setActiveTab] = useUrlState("tab", GENERAL_TAB);
  const {
    form,
    faqFields,
    isLoading,
    isSaving,
    isGenerating,
    generateIntro,
    handleSubmit,
  } = useBusinessProfileForm(setActiveTab);

  const showsPayments =
    !!tenant && hasCapability(tenant.businessVertical, "SERVICE_ORDERS");
  const isProfileFormTab = (PROFILE_FORM_TABS as readonly string[]).includes(
    activeTab,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Business</h2>
      <p className="text-[12.5px] text-[var(--ink-mute)] -mt-2">
        Describe your business and add common Q&amp;A — the chatbot uses these
        to answer questions about you.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-3.5">
        <div className="overflow-x-auto">
          <TabsList className="min-h-11 gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1">
            <TabsTrigger value={GENERAL_TAB} className={tabTriggerClassName}>
              <Building2 size={14} /> General
            </TabsTrigger>
            {/* Tour targets sit on the triggers — hidden tab content has nothing to spotlight. */}
            <TabsTrigger
              value="about"
              data-tour="business-description"
              className={tabTriggerClassName}
            >
              <Info size={14} /> About
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              data-tour="business-qa"
              className={tabTriggerClassName}
            >
              <MessageCircle size={14} /> Q&amp;A
            </TabsTrigger>
            <TabsTrigger
              value="support"
              data-tour="business-support"
              className={tabTriggerClassName}
            >
              <Headset size={14} /> Support
            </TabsTrigger>
            {showsPayments && (
              <TabsTrigger value={PAYMENTS_TAB} className={tabTriggerClassName}>
                <Wallet size={14} /> Payments
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value={GENERAL_TAB} className="flex flex-col gap-3.5">
          <BusinessNameCard />
          <BusinessCategoryCard />
        </TabsContent>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className={isProfileFormTab ? "flex flex-col gap-3.5" : "hidden"}
          >
            <TabsContent
              value="about"
              forceMount
              className={formTabContentClassName}
            >
              <BusinessAboutFields
                form={form}
                isGenerating={isGenerating}
                onGenerateIntro={generateIntro}
              />
            </TabsContent>
            <TabsContent
              value="qa"
              forceMount
              className={formTabContentClassName}
            >
              <BusinessQaFields form={form} faqFields={faqFields} />
            </TabsContent>
            <TabsContent
              value="support"
              forceMount
              className={formTabContentClassName}
            >
              <BusinessSupportFields form={form} />
            </TabsContent>

            <SettingsSaveBar>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check size={14} /> Save changes
                  </>
                )}
              </Button>
            </SettingsSaveBar>
          </form>
        </Form>

        {showsPayments && (
          <TabsContent value={PAYMENTS_TAB} className="flex flex-col gap-3.5">
            <PaymentAccountsCard />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
