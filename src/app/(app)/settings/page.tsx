import { redirect } from "next/navigation";

// Sections that used to live behind `/settings?section=` and their new pages.
const SECTION_ROUTES: Record<string, string> = {
  profile: "/settings/profile",
  chatbot: "/settings/chatbot",
  business: "/settings/business",
  notifications: "/settings/notifications",
  usage: "/settings/usage",
  access: "/settings/access",
  system: "/settings/system",
  billing: "/settings/billing",
  workspaces: "/settings/workspaces",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirect(SECTION_ROUTES[section ?? ""] ?? "/settings/profile");
}
