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
  MARKETING_AGENCY: (workspace) => ({
    greetingMessage: `Hi! 👋 Thanks for reaching out to ${workspace}. What are you looking to grow?`,
    escalationMessage: `Let me connect you with someone from the ${workspace} team — please hold on a moment.`,
    fallbackMessage: `Sorry, I didn't quite catch that. Could you rephrase — or tell me a bit about your business?`,
  }),
  HEALTHCARE: (workspace) => ({
    greetingMessage: `Assalam-o-Alaikum 👋 Welcome to ${workspace}. Please tell me how we can help — you can describe the requirement in your own words.`,
    escalationMessage: `Let me arrange for our team to assist you — please allow us a little time to get back to you.`,
    fallbackMessage: `Sorry, I didn't quite catch that. Could you rephrase — or tell me a bit about the patient and what care is needed?`,
  }),
};

/** Personalized starter messages seeded with the workspace name, flavored by business vertical. */
export function getDefaultMessages(workspace: string, businessVertical: BusinessVertical) {
  return TEMPLATES[businessVertical](workspace);
}
