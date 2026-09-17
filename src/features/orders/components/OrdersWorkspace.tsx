"use client";
import { CustomizationRequestsView } from "@/features/customization-requests/components/CustomizationRequestsView";
import { useOpenCustomizationRequestsCount } from "@/features/customization-requests/hooks/useCustomizationRequests";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { PencilRuler, ShoppingBag } from "lucide-react";
import { OrdersView } from "./OrdersView";

const ORDERS_TAB = "orders";
const REQUESTS_TAB = "requests";

const tabTriggerClassName =
  "h-10 px-3 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] data-active:bg-[var(--surface-2)] data-active:text-[var(--ink)] data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-[var(--surface-2)] dark:data-active:text-[var(--ink)]";

/**
 * The orders page's two queues.
 *
 * Real orders and customization requests are deliberately separate: a request
 * has no price, no stock and no order number, because the business has not yet
 * agreed the work is possible. Mixing them would put unconfirmed asks into the
 * same list, counts and exports as money already taken.
 */
export function OrdersWorkspace() {
  const [tab, setTab] = useUrlState("tab", ORDERS_TAB);
  const { data: openRequests = 0 } = useOpenCustomizationRequestsCount();

  return (
    <Tabs
      value={tab === REQUESTS_TAB ? REQUESTS_TAB : ORDERS_TAB}
      onValueChange={setTab}
      className="w-full "
    >
      <div className="px-4 pt-4">
        <TabsList className="min-h-11 gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1">
          <TabsTrigger value={ORDERS_TAB} className={tabTriggerClassName}>
            <ShoppingBag size={14} /> Orders
          </TabsTrigger>
          <TabsTrigger value={REQUESTS_TAB} className={tabTriggerClassName}>
            <PencilRuler size={14} /> Customization requests
            {openRequests > 0 && (
              <span className="ml-1.5 rounded-full bg-[var(--warning-soft)] text-[var(--warning-foreground)] px-1.5 py-0.5 text-[10.5px] font-semibold leading-none">
                {openRequests}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={ORDERS_TAB}>
        <OrdersView />
      </TabsContent>

      <TabsContent value={REQUESTS_TAB}>
        <div className="w-full p-4">
          <h1 className="text-[22px] font-semibold text-[var(--ink)] mb-5">
            Customization requests
          </h1>
          <CustomizationRequestsView />
        </div>
      </TabsContent>
    </Tabs>
  );
}
