export type Plan = {
  name: string;
  tagline: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  period: string;
  cta: string;
  featured: boolean;
  comingSoon: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "For solo owners getting started on WhatsApp.",
    price: "2,999",
    originalPrice: "5,999",
    discountPercentage: 50,
    period: "/month",
    cta: "Start With Starter",
    featured: false,
    comingSoon: false,
    features: [
      "1 workspace (business branch)",
      "1 WhatsApp number connected",
      "AI auto-replies for common questions",
      "Lead CRM with pipeline & statuses",
      "1000 Broadcast campaigns to your leads",
      "Excel / CSV lead import",
      "Single team member",
      "Email support",
    ],
  },
  {
    name: "Business",
    tagline: "For growing teams running multiple branches.",
    price: "5,999",
    originalPrice: "12,000",
    discountPercentage: 50,
    period: "/month",
    cta: "Choose Business",
    featured: true,
    comingSoon: true,
    features: [
      "Unlimited workspaces (business branches)",
      "One WhatsApp number per workspace",
      "Unlimited AI auto-replies",
      "Advanced Lead CRM & follow-ups",
      "Unlimited broadcast campaigns",
      "Excel / CSV lead import",
      "Team members & roles per workspace",
      "Priority WhatsApp support",
    ],
  },
];
