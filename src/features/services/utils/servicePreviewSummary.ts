import {
  DELIVERY_TYPE_LABELS,
  PRICING_TYPE_LABELS,
  type ServiceOffering,
  type ServicePlanFormData,
} from '../types';
import { toPlanFormValues } from './serviceFormMapping';

/** Quote-only services carry no number by design, so the headline reads as the conversation it
 * actually is rather than an empty slot. */
export function formatServiceStartingPrice(service: ServiceOffering): string {
  if (service.startingPrice == null) return 'On request';
  return `${service.currency} ${service.startingPrice.toLocaleString()}`;
}

/** Suffix for the headline price — only a retainer is genuinely per-month. */
export function formatServicePriceCadence(service: ServiceOffering): string | null {
  if (service.startingPrice == null) return null;
  return service.deliveryType === 'MONTHLY_RETAINER' ? 'per month' : 'one-off';
}

export function formatServiceDeliveryType(service: ServiceOffering): string {
  return DELIVERY_TYPE_LABELS[service.deliveryType];
}

export function formatServicePricingType(service: ServiceOffering): string {
  return PRICING_TYPE_LABELS[service.pricingType];
}

export function formatServiceDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function countHighlightedPlans(service: ServiceOffering): number {
  return service.plans.filter((plan) => plan.isHighlighted).length;
}

/** Plans in the order the bot leads with them, in the shape `PlanPreviewCard` reads — so the
 * preview and the editor's plan cards render from the same values. */
export function toPlanPreviewList(service: ServiceOffering): ServicePlanFormData[] {
  return [...service.plans]
    .sort((first, second) => first.displayOrder - second.displayOrder)
    .map(toPlanFormValues);
}
