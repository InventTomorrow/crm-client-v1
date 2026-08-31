import { hasCapability, type BusinessVertical, type VerticalCapability } from '@/lib/business-verticals';
import type { Step, Tour } from 'nextstepjs';
import { TOUR_ID_BY_VERTICAL, type TourId } from '../constants';

/** Extra clearance so the sticky h-14 top bar never covers a highlighted target. */
const HEADER_CLEARANCE = 72;

/** Targets that render only after a query resolves need a few lookups. */
const ASYNC_TARGET = { selectorRetryAttempts: 10, selectorRetryDelay: 250 } as const;

/**
 * A step plus what a workspace must be able to do for it to apply. Every page
 * exposes the same two anchors — `page-actions` and `page-list` — so one
 * selector works across routes; only one page is mounted at a time.
 */
interface WorkspaceStep extends Omit<Step, 'nextRoute' | 'prevRoute'> {
  /** Route this step lives on. The builder derives nextRoute/prevRoute from it. */
  route: string;
  /** Vertical capability the step needs; omit for steps every workspace gets. */
  capability?: VerticalCapability;
  /** Permission the step needs — its target is hidden without it. */
  perm?: string;
}

/**
 * The full catalogue, in tour order. A workspace only ever sees the steps its
 * vertical and the signed-in role allow, so a restaurant walks its menu while an
 * agency walks services and bookings.
 */
const WORKSPACE_STEPS: WorkspaceStep[] = [
  // ── Orientation ───────────────────────────────────────────────────────────
  {
    route: '/dashboard',
    title: 'Your workspace, section by section',
    content:
      'Every part of the CRM lives here — conversations, leads, orders and settings. You only see the sections your role can open, and the workspace switcher above swaps between businesses.',
    selector: '[data-tour="sidebar-nav"]',
    side: 'right',
    pointerPadding: 8,
    pointerRadius: 12,
  },
  {
    route: '/dashboard',
    title: 'Find anything, fast',
    content:
      'Search leads, orders and conversations from one box — press ⌘K (Ctrl+K on Windows) from any page. The bell beside it collects new messages and escalations.',
    selector: '[data-tour="global-search"]',
    side: 'bottom-right',
    pointerPadding: 6,
    pointerRadius: 10,
  },

  // ── Teach the assistant who you are ───────────────────────────────────────
  {
    route: '/settings/business',
    perm: 'settings:view',
    title: 'Pick your business category',
    content:
      'This decides which AI agents you get and which pages appear in your sidebar — a restaurant gets a menu, a store gets inventory. Changing it switches the assistant immediately.',
    selector: '[data-tour="business-category"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/settings/business',
    perm: 'settings:view',
    title: 'Describe what you do',
    content:
      'Write a couple of lines about your business, then generate the intro message customers get when they ask about you. Edit it freely — the assistant answers from exactly this.',
    selector: '[data-tour="business-description"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/settings/business',
    perm: 'settings:view',
    title: 'Add your common questions',
    content:
      'Question and answer pairs — delivery times, refunds, opening hours. Every pair you add here is one less chat that has to reach you.',
    selector: '[data-tour="business-qa"]',
    side: 'top',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/settings/business',
    perm: 'settings:view',
    title: 'Say who takes over from the bot',
    content:
      'The name, phone and email shared when a conversation is handed to a human, plus whether you want notifying on every escalation.',
    selector: '[data-tour="business-support"]',
    side: 'top',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/settings/chatbot',
    perm: 'chatbot:view',
    title: 'Set up the assistant itself',
    content:
      'Switch AI replies on, set the greeting customers get first, and decide when a chat is escalated to you. This is the personality behind every conversation.',
    selector: '[data-tour="settings-chatbot"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },

  // ── Fill the catalogue it sells from ──────────────────────────────────────
  {
    route: '/menu/cards',
    capability: 'CATALOG_MENU',
    perm: 'inventory:view',
    title: 'Upload your menu cards',
    content:
      'Photos or a PDF of your printed menu. Customers who ask to see the menu get these straight away, in the order you arrange them.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },
  {
    route: '/menu',
    capability: 'CATALOG_MENU',
    perm: 'inventory:view',
    title: 'Then add the dishes themselves',
    content:
      'Cards are pictures; these are the real items. Add dishes with prices, categories and add-ons — this is what the assistant quotes and takes orders from.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },
  {
    route: '/inventory',
    capability: 'CATALOG_PRODUCTS',
    perm: 'inventory:view',
    title: 'Stock your catalogue',
    content:
      'Add products one by one or in bulk, with sizes, prices and stock levels. Stock drops as orders are booked and comes back when one is cancelled.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },
  {
    route: '/services',
    capability: 'CATALOG_SERVICES',
    perm: 'services:view',
    title: 'List what you sell',
    content:
      'Add your services and packages with pricing. The assistant quotes from this list instead of guessing.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },
  {
    route: '/clinical-services',
    capability: 'CATALOG_CLINICAL',
    perm: 'clinical_services:view',
    title: 'List the care you provide',
    content:
      'Add each service with what it covers, how long it takes and what it costs. The assistant answers scope and pricing questions from this list alone, so anything missing here is a chat that reaches you.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/practitioners',
    capability: 'PRACTITIONERS',
    perm: 'practitioners:view',
    title: 'Add the doctors patients ask for',
    content:
      'Every practitioner gets a profile, their expertise and a weekly schedule. That schedule is exactly what the assistant offers when a patient asks for a named doctor, and visibility decides whether it names them at all.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/coverage-areas',
    capability: 'CLINIC_COVERAGE',
    perm: 'clinic_coverage:view',
    title: 'Say where you operate',
    content:
      'Match each service to the cities and locations that actually offer it. A patient outside your coverage is told so up front, instead of being booked into a visit the clinic cannot serve.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/qualification',
    capability: 'QUALIFICATION',
    perm: 'qualification:view',
    title: 'Teach the bot what to ask',
    content:
      'Set the questions that qualify a new enquiry — budget, timeline, company size — and how each answer scores. High scorers reach you as hot leads; the rest are answered without you.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/resources',
    capability: 'RESOURCES',
    perm: 'resources:view',
    title: 'Give the bot something to send',
    content:
      'Brochures, portfolios and case studies. Attach conditions so a file only goes to the right kind of lead — enterprise enquiries get the deck, small ones get the price list.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },

  // ── Where the work happens ────────────────────────────────────────────────
  {
    route: '/inbox',
    perm: 'conversations:view',
    title: 'Every conversation, one inbox',
    content:
      'WhatsApp chats land here. The assistant replies on its own, and you can open any chat to read the history and take over.',
    selector: '[data-tour="page-list"]',
    side: 'right',
    pointerPadding: 10,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/leads',
    perm: 'leads:view',
    title: 'Chats become leads automatically',
    content:
      'Every enquiry is captured and scored, so nothing is lost in a thread. Below this the pipeline board holds a column per status — drag a card across to move it along.',
    selector: '[data-tour="page-list"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
  {
    route: '/orders',
    capability: 'ORDERS',
    perm: 'orders:view',
    title: 'Orders captured from chat',
    content:
      'Orders the assistant takes appear alongside ones you add by hand. Change a status and the customer is notified on WhatsApp automatically.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 10,
    pointerRadius: 12,
    ...ASYNC_TARGET,
  },
  {
    route: '/bookings',
    capability: 'BOOKINGS',
    perm: 'bookings:view',
    title: 'Calls the bot books for you',
    content:
      'Appointments land here as the assistant agrees them with leads. Set your working hours under Availability first — that is what it offers, so it never books you twice.',
    selector: '[data-tour="page-actions"]',
    side: 'bottom-right',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },

  // ── The one thing that switches it all on ─────────────────────────────────
  {
    route: '/channels',
    perm: 'channels:view',
    title: 'Connect WhatsApp to go live',
    content:
      'Scan the QR to link your number — that is the moment real conversations start flowing into everything you just set up, and your dashboard begins filling in. Replay this guide any time from your profile menu.',
    selector: '[data-tour="page-content"]',
    side: 'bottom',
    scrollOffset: HEADER_CLEARANCE,
    pointerPadding: 12,
    pointerRadius: 14,
    ...ASYNC_TARGET,
  },
];

/** Drops the gating metadata so only what NextStep understands reaches it. */
function withoutGating(definition: WorkspaceStep): Omit<Step, 'nextRoute' | 'prevRoute'> {
  const step: Partial<WorkspaceStep> = { ...definition };
  delete step.route;
  delete step.capability;
  delete step.perm;
  return step as Omit<Step, 'nextRoute' | 'prevRoute'>;
}

interface BuildWorkspaceTourOptions {
  businessVertical: BusinessVertical | undefined;
  can: (permission: string) => boolean;
}

/**
 * Builds the tour for the active workspace: capability decides which pages
 * belong to this business, permissions decide which of those the user can open,
 * and routes are chained across whatever survives.
 */
export function buildWorkspaceTour({
  businessVertical,
  can,
}: BuildWorkspaceTourOptions): Tour | null {
  if (!businessVertical) return null;

  const applicableSteps = WORKSPACE_STEPS.filter(
    (step) =>
      (!step.capability || hasCapability(businessVertical, step.capability)) &&
      (!step.perm || can(step.perm)),
  );

  // A role that can open nothing is left with the chrome steps alone, which is
  // not a walkthrough worth interrupting anyone for.
  if (applicableSteps.filter((step) => step.perm || step.capability).length === 0) return null;

  const steps: Step[] = applicableSteps.map((definition, index) => {
    const { route } = definition;
    const step = withoutGating(definition);
    // An empty route means "stay put", so it never triggers navigation.
    const previousRoute = applicableSteps[index - 1]?.route || route;
    const nextRoute = applicableSteps[index + 1]?.route || route;

    return {
      ...step,
      ...(nextRoute && nextRoute !== route ? { nextRoute } : {}),
      ...(previousRoute && previousRoute !== route ? { prevRoute: previousRoute } : {}),
    };
  });

  return { tour: TOUR_ID_BY_VERTICAL[businessVertical], steps };
}

export function tourIdFor(businessVertical: BusinessVertical | undefined): TourId | null {
  return businessVertical ? TOUR_ID_BY_VERTICAL[businessVertical] : null;
}
