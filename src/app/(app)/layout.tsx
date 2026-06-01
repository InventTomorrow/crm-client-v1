'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { AppSidebar } from '@/shared/layout/AppSidebar';
import { AppTopBar } from '@/shared/layout/AppTopBar';
import { MobileDock } from '@/shared/layout/MobileDock';
import { EscalateDialog } from '@/shared/layout/EscalateDialog';
import { HotToast } from '@/shared/layout/HotToast';
import { WorkspaceSwitchingOverlay } from '@/shared/layout/WorkspaceSwitchingOverlay';
import { Toaster } from '@/shared/ui/Sonner';
import { INITIAL_LEADS } from '@/lib/mockData';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, escalatingLead, hotLead, setEscalatingLead, setHotLead } = useAppStore();

  // Demo: ping hot lead on mount
  useEffect(() => {
    const t = setTimeout(() => {
      const ali = INITIAL_LEADS.find(l => l.id === 'L1');
      if (ali) setHotLead(ali);
    }, 2200);
    return () => clearTimeout(t);
  }, [setHotLead]);

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
