"use client";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useLeads } from "@/features/leads/hooks/useLeads";
import type { Lead } from "@/features/leads/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import {
  getCatalogLineIndex,
  getCatalogLineOptions,
  getLineCatalogMatch,
  getLineSizeFromName,
  getOrderLineName,
  type CatalogLineOption,
} from "../utils/catalogLineOptions";
import {
  EMPTY_ORDER_LINE,
  getLeadContact,
  getNewOrderFormValues,
  getSavedOrderFormValues,
  haveOrderLinesChanged,
  toCreateOrderPayload,
  toUpdateOrderPayload,
} from "../utils/orderFormPayload";
import {
  getOrderFormSchema,
  getOrderLinesSubtotal,
  type OrderFormInput,
  type OrderFormValues,
} from "../validations.order";
import { useCreateOrder, useOrder, useUpdateOrder } from "./useOrders";

export type OrderFormApi = UseFormReturn<OrderFormInput, unknown, OrderFormValues>;

interface UseOrderFormOptions {
  orderId?: string;
  presetLeadId?: string;
  presetConversationId?: string;
}

const getInboxPath = (leadId: string) =>
  `/inbox?lead=${encodeURIComponent(leadId)}&verified=1`;

/** Owns the order page's state: catalog + customer pickers, prefill, totals, and save wiring. */
export function useOrderForm({
  orderId,
  presetLeadId,
  presetConversationId,
}: UseOrderFormOptions) {
  const router = useRouter();
  const isEditMode = !!orderId;
  const isFromInbox = !isEditMode && !!presetLeadId && !!presetConversationId;

  const {
    data: editingOrder,
    isLoading: isLoadingOrder,
    isError: isOrderError,
  } = useOrder(orderId ?? null);
  const { data: leads = [], isLoading: isLoadingLeads } = useLeads();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const isDeliveryRequired = !isEditMode || !!editingOrder?.shippingDetail;
  const formSchema = useMemo(
    () => getOrderFormSchema(isDeliveryRequired),
    [isDeliveryRequired],
  );

  const form: OrderFormApi = useForm<OrderFormInput, unknown, OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getNewOrderFormValues(presetLeadId, presetConversationId),
  });

  const savedFormValues = useMemo(
    () => (editingOrder ? getSavedOrderFormValues(editingOrder) : null),
    [editingOrder],
  );

  useEffect(() => {
    if (savedFormValues) form.reset(savedFormValues);
    // Keyed on the id so a background refetch doesn't clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingOrder?.id]);

  const lineFields = useFieldArray({ control: form.control, name: "items" });
  const watchedLines = useWatch({ control: form.control, name: "items" });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });
  const watchedCurrency = useWatch({ control: form.control, name: "currency" });
  const watchedLeadId = useWatch({ control: form.control, name: "leadId" });

  const subtotal = getOrderLinesSubtotal(watchedLines ?? []);
  const total = Math.max(0, subtotal - (Number(watchedDiscount) || 0));
  const unitCount = (watchedLines ?? []).reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  );

  const catalogLineOptions = useMemo(
    () => getCatalogLineOptions(products),
    [products],
  );
  const catalogLineIndex = useMemo(
    () => getCatalogLineIndex(catalogLineOptions),
    [catalogLineOptions],
  );
  const lineCatalogMatches = useMemo(
    () => (watchedLines ?? []).map((line) => getLineCatalogMatch(line, catalogLineIndex)),
    [watchedLines, catalogLineIndex],
  );

  // A saved line carries its size only in its name ("Shirt (Black / M)"), so the size picker is filled from it once the catalog loads.
  const prefilledSizesOrderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!editingOrder || !savedFormValues || !catalogLineOptions.length) return;
    if (prefilledSizesOrderIdRef.current === editingOrder.id) return;
    prefilledSizesOrderIdRef.current = editingOrder.id;
    savedFormValues.items.forEach((line, lineIndex) => {
      const { option } = getLineCatalogMatch(line, catalogLineIndex);
      const size = option ? getLineSizeFromName(option, line.name) : undefined;
      if (size) form.setValue(`items.${lineIndex}.size`, size);
    });
  }, [editingOrder, savedFormValues, catalogLineOptions, catalogLineIndex, form]);

  const applyLeadContact = useCallback(
    (lead: Lead) => {
      const contact = getLeadContact(lead);
      const update = { shouldDirty: true } as const;
      form.setValue("shipping.customerName", contact.customerName, update);
      form.setValue("shipping.customerPhone", contact.customerPhone, update);
      form.setValue("shipping.email", contact.email, update);
      if (!form.getValues("shipping.city")) {
        form.setValue("shipping.city", contact.city, update);
      }
    },
    [form],
  );

  const selectCustomer = useCallback(
    (lead: Lead) => {
      form.setValue("leadId", lead.id, { shouldDirty: true, shouldValidate: true });
      applyLeadContact(lead);
    },
    [form, applyLeadContact],
  );

  // A customer preset from the inbox gets their details once the leads list arrives.
  const prefilledPresetLeadRef = useRef(false);
  useEffect(() => {
    if (isEditMode || !presetLeadId || prefilledPresetLeadRef.current) return;
    const presetLead = leads.find((lead) => lead.id === presetLeadId);
    if (!presetLead) return;
    prefilledPresetLeadRef.current = true;
    applyLeadContact(presetLead);
  }, [isEditMode, presetLeadId, leads, applyLeadContact]);

  const selectCatalogLine = useCallback(
    (lineIndex: number, option: CatalogLineOption) => {
      const update = { shouldDirty: true, shouldValidate: true } as const;
      form.setValue(`items.${lineIndex}.productId`, option.productId, update);
      form.setValue(`items.${lineIndex}.variantId`, option.variantId, update);
      form.setValue(`items.${lineIndex}.size`, "", update);
      form.setValue(`items.${lineIndex}.name`, getOrderLineName(option, ""), update);
      form.setValue(`items.${lineIndex}.sku`, option.sku ?? "", update);
      form.setValue(`items.${lineIndex}.imageUrl`, option.imageUrl, update);
      form.setValue(`items.${lineIndex}.unitPrice`, option.price, update);
      // Custom options belong to the product they were answered for.
      form.setValue(`items.${lineIndex}.customOptions`, undefined, update);
      form.setValue(`items.${lineIndex}.customizationTotal`, 0, update);
    },
    [form],
  );

  const selectLineSize = useCallback(
    (lineIndex: number, option: CatalogLineOption, size: string) => {
      const update = { shouldDirty: true, shouldValidate: true } as const;
      form.setValue(`items.${lineIndex}.size`, size, update);
      form.setValue(`items.${lineIndex}.name`, getOrderLineName(option, size), update);
    },
    [form],
  );

  const appendLine = useCallback(
    () => lineFields.append({ ...EMPTY_ORDER_LINE }),
    [lineFields],
  );

  const removeLine = useCallback(
    (lineIndex: number) => {
      if (lineFields.fields.length > 1) lineFields.remove(lineIndex);
    },
    [lineFields],
  );

  const leavePath = useMemo(() => {
    if (isFromInbox && presetLeadId) return getInboxPath(presetLeadId);
    return orderId ? `/orders?order=${encodeURIComponent(orderId)}` : "/orders";
  }, [isFromInbox, presetLeadId, orderId]);

  const leaveForm = useCallback(() => router.push(leavePath), [router, leavePath]);

  const handleSubmit = form.handleSubmit((values) => {
    if (editingOrder && savedFormValues) {
      const shouldSendLines = haveOrderLinesChanged(
        savedFormValues.items,
        values.items,
      );
      updateOrder.mutate(
        { id: editingOrder.id, payload: toUpdateOrderPayload(values, shouldSendLines) },
        { onSuccess: leaveForm },
      );
      return;
    }
    createOrder.mutate(toCreateOrderPayload(values), {
      onSuccess: (createdOrder) =>
        router.push(
          isFromInbox ? leavePath : `/orders?order=${encodeURIComponent(createdOrder.id)}`,
        ),
    });
  });

  return {
    form,
    isEditMode,
    editingOrder,
    isLoadingOrder: isEditMode && isLoadingOrder,
    isOrderMissing: isEditMode && !isLoadingOrder && (isOrderError || !editingOrder),
    isDeliveryRequired,
    isCustomerLocked: isEditMode || !!presetLeadId,
    leads,
    isLoadingLeads,
    selectedLeadId: watchedLeadId,
    selectCustomer,
    catalogLineOptions,
    lineCatalogMatches,
    isLoadingProducts,
    lineFields: lineFields.fields,
    watchedLines: watchedLines ?? [],
    selectCatalogLine,
    selectLineSize,
    appendLine,
    removeLine,
    currency: watchedCurrency || "PKR",
    subtotal,
    total,
    unitCount,
    isSaving: createOrder.isPending || updateOrder.isPending,
    handleSubmit,
    leaveForm,
  };
}
