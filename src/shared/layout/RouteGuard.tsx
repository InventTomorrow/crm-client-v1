"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { Button } from "@/shared/ui/Button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRequiredPermission } from "./routePermissions";

/**
 * Client-side gate for `(app)` pages. Resolves the permission required by the
 * current route and blocks render when the active role lacks it. The server
 * still enforces every mutation — this only stops a user landing on a page they
 * have no access to.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can, isLoading } = usePermissions();
  const required = getRequiredPermission(pathname);

  if (!required) return <>{children}</>;
  // Wait for permissions to resolve so we never flash "no access" on load.
  if (isLoading) return null;
  if (can(required)) return <>{children}</>;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="card flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)]">
          <Lock size={20} />
        </div>
        <div className="text-[15px] font-semibold text-[var(--ink)]">
          You don&apos;t have access
        </div>
        <p className="text-[13px] text-[var(--ink-mute)]">
          Your role doesn&apos;t include permission to view this page. Ask a
          workspace owner if you need access.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/inbox">Back to Inbox</Link>
        </Button>
      </div>
    </div>
  );
}
