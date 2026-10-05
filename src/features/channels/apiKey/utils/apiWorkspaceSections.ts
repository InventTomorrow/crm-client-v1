export const API_WORKSPACE_ROOT = "/channels/api";

export const API_WORKSPACE_SECTIONS = [
  { href: `${API_WORKSPACE_ROOT}/keys`, matchPrefix: `${API_WORKSPACE_ROOT}/keys`, label: "API keys" },
  { href: `${API_WORKSPACE_ROOT}/docs`, matchPrefix: `${API_WORKSPACE_ROOT}/docs`, label: "Docs" },
  {
    href: `${API_WORKSPACE_ROOT}/sandbox/orders`,
    matchPrefix: `${API_WORKSPACE_ROOT}/sandbox`,
    label: "Sandbox",
  },
] as const;

export function isPathActive(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
