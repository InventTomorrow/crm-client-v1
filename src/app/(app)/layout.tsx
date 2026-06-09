'use client';
import { useAppStore } from '@/lib/appStore';
import { AppSidebar } from '@/shared/layout/AppSidebar';
import { AppTopBar } from '@/shared/layout/AppTopBar';
import { MobileDock } from '@/shared/layout/MobileDock';
import { EscalateDialog } from '@/shared/layout/EscalateDialog';
import { HotToast } from '@/shared/layout/HotToast';
import { WorkspaceSwitchingOverlay } from '@/shared/layout/WorkspaceSwitchingOverlay';
import { Toaster } from '@/shared/ui/Sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, escalatingLead, hotLead, setEscalatingLead, setHotLead } = useAppStore();

  return (
    <div className="app-shell">
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="app-main">
        <AppTopBar onMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="app-content">
          {children}
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
