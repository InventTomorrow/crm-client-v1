"use client";
import { Button } from "@/shared/ui/Button";
import { FormSection } from "@/shared/ui/FormSection";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { ArrowLeft, MapPin, Package, StickyNote, UserRound } from "lucide-react";
import { useOrderForm } from "../hooks/useOrderForm";
import { OrderCustomerPicker } from "./OrderCustomerPicker";
import { OrderAddressFields, OrderContactFields } from "./OrderDeliveryFields";
import { OrderFormSkeleton } from "./OrderFormSkeleton";
import { OrderItemsField } from "./OrderItemsField";
import { OrderSummaryPanel } from "./OrderSummaryPanel";

interface OrderFormViewProps {
  orderId?: string;
  presetLeadId?: string;
  presetConversationId?: string;
}

export function OrderFormView({
  orderId,
  presetLeadId,
  presetConversationId,
}: OrderFormViewProps) {
  const orderForm = useOrderForm({ orderId, presetLeadId, presetConversationId });
  const { form, isEditMode, editingOrder, isSaving, isDeliveryRequired, leaveForm } =
    orderForm;

  if (orderForm.isLoadingOrder) return <OrderFormSkeleton />;

  if (orderForm.isOrderMissing) {
    return (
      <OrderFormMessage
        title="Order not found"
        body="This order no longer exists or you don't have access to it."
        onBack={leaveForm}
      />
    );
  }

  const title =
    isEditMode && editingOrder ? `Edit order #${editingOrder.orderNumber}` : "New order";

  return (
    <PermissionGuard
      permission={isEditMode ? "orders:edit" : "orders:create"}
      fallback={
        <OrderFormMessage
          title="No access"
          body={`Your role can't ${isEditMode ? "edit" : "create"} orders. Ask a workspace admin for access.`}
          onBack={leaveForm}
        />
      }
    >
      <div className="scroll h-full overflow-y-auto">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-8">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Back"
              onClick={leaveForm}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-[18px] font-semibold text-[var(--ink)]">{title}</h1>
              <p className="text-[12px] text-[var(--ink-mute)]">Orders · Manual entry</p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={orderForm.handleSubmit}
              noValidate
              className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <div className="flex min-w-0 flex-col gap-5">
                <FormSection
                  hideLabelColumn
                  Icon={UserRound}
                  title="Customer"
                  description="Who the order is for, and how to reach them about it."
                >
                  <OrderCustomerPicker
                    form={form}
                    leads={orderForm.leads}
                    isLoadingLeads={orderForm.isLoadingLeads}
                    selectedLeadId={orderForm.selectedLeadId}
                    onSelectCustomer={orderForm.selectCustomer}
                    isCustomerLocked={orderForm.isCustomerLocked}
                    isEditMode={isEditMode}
                    disabled={isSaving}
                  />
                  <OrderContactFields
                    form={form}
                    isDeliveryRequired={isDeliveryRequired}
                    disabled={isSaving}
                  />
                </FormSection>

                <FormSection
                  hideLabelColumn
                  Icon={MapPin}
                  title="Delivery address"
                  description={
                    isDeliveryRequired
                      ? "Where the order ships to."
                      : "This order was saved without an address — add one, or leave it blank."
                  }
                >
                  <OrderAddressFields
                    form={form}
                    isDeliveryRequired={isDeliveryRequired}
                    disabled={isSaving}
                  />
                </FormSection>

                <FormSection
                  hideLabelColumn
                  Icon={Package}
                  title="Items"
                  description="Pick a product or one of its variants. The price comes from your catalog and can be changed for this order."
                >
                  <OrderItemsField
                    form={form}
                    lineFields={orderForm.lineFields}
                    watchedLines={orderForm.watchedLines}
                    catalogLineOptions={orderForm.catalogLineOptions}
                    lineCatalogMatches={orderForm.lineCatalogMatches}
                    isLoadingProducts={orderForm.isLoadingProducts}
                    currency={orderForm.currency}
                    onSelectLine={orderForm.selectCatalogLine}
                    onSelectSize={orderForm.selectLineSize}
                    onAppendLine={orderForm.appendLine}
                    onRemoveLine={orderForm.removeLine}
                    disabled={isSaving}
                  />
                </FormSection>

                <FormSection
                  hideLabelColumn
                  Icon={StickyNote}
                  title="Notes"
                  description="Anything your team should know about this order."
                >
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            rows={3}
                            placeholder="Gift wrap, paid by bank transfer, deliver after 5pm…"
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>
              </div>

              <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
                <OrderSummaryPanel
                  form={form}
                  isEditMode={isEditMode}
                  currency={orderForm.currency}
                  subtotal={orderForm.subtotal}
                  total={orderForm.total}
                  unitCount={orderForm.unitCount}
                  isSaving={isSaving}
                  onCancel={leaveForm}
                />
              </aside>
            </form>
          </Form>
        </div>
      </div>
    </PermissionGuard>
  );
}

function OrderFormMessage({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon-lg" aria-label="Back" onClick={onBack}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-[18px] font-semibold text-[var(--ink)]">{title}</h1>
      </div>
      <p className="text-[13px] text-[var(--ink-mute)]">{body}</p>
    </div>
  );
}
