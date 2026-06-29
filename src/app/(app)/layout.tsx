'use client';
import { useAppStore } from '@/lib/appStore';
import { AppSidebar } from '@/shared/layout/AppSidebar';
import { AppTopBar } from '@/shared/layout/AppTopBar';
import { MobileDock } from '@/shared/layout/MobileDock';
import { RouteGuard } from '@/shared/layout/RouteGuard';
import { EscalateDialog } from '@/shared/layout/EscalateDialog';
import { HotToast } from '@/shared/layout/HotToast';
import { WorkspaceSwitchingOverlay } from '@/shared/layout/WorkspaceSwitchingOverlay';
import { Toaster } from '@/shared/ui/Sonner';
import { Minimize2 } from 'lucide-react';

function FullScreenBar() {
  const { toggleFullScreen } = useAppStore();
  return (
    <div className="h-8 flex-shrink-0 flex items-center justify-end px-3 bg-[var(--surface)] border-b border-[var(--line)]">
      <button
        onClick={toggleFullScreen}
        className="btn btn-ghost p-1 text-[var(--ink-mute)] text-[11px] flex items-center gap-1.5"
        title="Exit full screen"
      >
        <Minimize2 size={13} />
        <span>Exit full screen</span>
      </button>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, escalatingLead, hotLead, setEscalatingLead, setHotLead, isFullScreen, currentWorkspaceId } = useAppStore();

  return (
    <div className="app-shell">
      {!isFullScreen && (
        <AppSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="app-main">
        {!isFullScreen && <AppTopBar onMobileMenu={() => setMobileMenuOpen(true)} />}
        {isFullScreen && <FullScreenBar />}
        <main key={currentWorkspaceId} className="app-content">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>
      <MobileDock />

      {escalatingLead && (
        <EscalateDialog
          lead={escalatingLead}
          onClose={() => setEscalatingLead(null)}
          onConfirm={() => { setEscalatingLead(null); setHotLead(escalatingLead); }}
        />
      )}
      {hotLead && <HotToast lead={hotLead} onClose={() => setHotLead(null)} />}
      <Toaster richColors position="top-right" />
      <WorkspaceSwitchingOverlay />
    </div>
  );
}
