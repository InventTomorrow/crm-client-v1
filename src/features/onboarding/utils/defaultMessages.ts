import type { BusinessVertical } from '@/lib/business-verticals';

const TEMPLATES: Record<BusinessVertical, (workspace: string) => { greetingMessage: string; escalationMessage: string; fallbackMessage: string }> = {
  ECOMMERCE: (workspace) => ({
    greetingMessage: `Hi! 👋 Welcome to ${workspace}. How can I help you today?`,
    escalationMessage: `Let me connect you with someone from the ${workspace} team — please hold on a moment.`,
    fallbackMessage: `Sorry, I didn't quite catch that. Could you rephrase it so I can help you better?`,
  }),
  RESTAURANT: (workspace) => ({
    greetingMessage: `Hi! 👋 Welcome to ${workspace}. Want to see the menu or place an order?`,
    escalationMessage: `Let me connect you with someone from the ${workspace} team — please hold on a moment.`,
    fallbackMessage: `Sorry, I didn't quite catch that. Could you rephrase — or tell me what you're in the mood for?`,
  }),
};

/** Personalized starter messages seeded with the workspace name, flavored by business vertical. */
export function getDefaultMessages(workspace: string, businessVertical: BusinessVertical) {
  return TEMPLATES[businessVertical](workspace);
}
