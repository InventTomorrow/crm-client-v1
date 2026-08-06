"use client";
import { WelcomeDemoDialog } from "@/features/demo/components/WelcomeDemoDialog";
import { useSyncActiveWorkspace } from "@/features/tenant/hooks/useSyncActiveWorkspace";
import { useAppStore } from "@/lib/appStore";
import { AppSidebar } from "@/shared/layout/AppSidebar";
import { AppTopBar } from "@/shared/layout/AppTopBar";
import { AuthGate } from "@/shared/layout/AuthGate";
import { EscalateDialog } from "@/shared/layout/EscalateDialog";
import { HotToast } from "@/shared/layout/HotToast";
import { MobileDock } from "@/shared/layout/MobileDock";
import { RouteGuard } from "@/shared/layout/RouteGuard";
import { WorkspaceSwitchingOverlay } from "@/shared/layout/WorkspaceSwitchingOverlay";
import { Toaster } from "@/shared/ui/Sonner";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    escalatingLead,
    hotLead,
    setEscalatingLead,
    setHotLead,
    currentWorkspaceId,
  } = useAppStore();

  // Keep the displayed workspace in lock-step with the tenant the server serves.
  useSyncActiveWorkspace();

  return (
    <AuthGate>
      <div className="app-shell">
        {/* AppSidebar reads `?section=` to light the active Settings tab. */}
        <Suspense>
          <AppSidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        </Suspense>
        <div className="app-main">
          <AppTopBar onMobileMenu={() => setMobileMenuOpen(true)} />
          <main key={currentWorkspaceId} className="app-content">
            <RouteGuard>{children}</RouteGuard>
          </main>
        </div>
        <MobileDock />

        {escalatingLead && (
          <EscalateDialog
            lead={escalatingLead}
            onClose={() => setEscalatingLead(null)}
            onConfirm={() => {
              setEscalatingLead(null);
              setHotLead(escalatingLead);
            }}
          />
        )}
        {hotLead && <HotToast lead={hotLead} onClose={() => setHotLead(null)} />}
        <Toaster richColors position="top-right" />
        <WorkspaceSwitchingOverlay />
        <WelcomeDemoDialog />
      </div>
    </AuthGate>
  );
}
