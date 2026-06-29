'use client';
import { Flame, Phone, MapPin, Target, X, Users, Handshake } from 'lucide-react';
import { pkr } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import type { Lead } from '@/lib/mockData';

interface EscalateDialogProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: () => void;
}

export function EscalateDialog({ lead, onClose, onConfirm }: EscalateDialogProps) {
  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[500px] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-2 px-[22px] py-[18px] border-b border-[var(--line)] relative">
          <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={onClose}>
            <X size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-[26px] h-[26px] rounded-lg bg-[rgba(239,68,68,0.12)] text-[#DC2626] inline-flex items-center justify-center flex-shrink-0">
                <Flame size={14} />
              </span>
              <span className="badge bg-[rgba(239,68,68,0.10)] text-[#DC2626] font-semibold tracking-[0.06em]">HOT LEAD ESCALATION</span>
            </div>
            <DialogTitle className="text-[18px] font-semibold mt-0.5">Escalate {lead.name}?</DialogTitle>
            <DialogDescription className="text-[12.5px] mt-1 text-[var(--ink-mute)]">
              AI confidence: 92% · Estimated order value {pkr(lead.value || 17998)}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="p-5 flex flex-col gap-3.5">
          <div className="card p-[14px] bg-[var(--surface-2)]">
            <div className="text-[11px] text-[var(--ink-mute)] uppercase tracking-[0.06em] font-semibold mb-2">Query summary</div>
            <div className="text-[13.5px] leading-[1.55] italic text-[var(--ink-soft)]">
              "Bhai final price kya hai? Karachi delivery confirm karein. Mera number 0321-4567890 hai, 2 pieces order karna hai — pink aur teal."
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="entity-chip entity-phone"><Phone size={10} /> 0321-4567890</span>
              <span className="entity-chip entity-location"><MapPin size={10} /> {lead.city}</span>
              <span className="entity-chip entity-intent"><Target size={10} /> Checkout intent</span>
              <span className="entity-chip entity-money">{pkr(lead.value || 17998)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 justify-center" onClick={onClose}>
              <Users size={14} /> SR Will Contact
            </Button>
            <Button className="flex-[1.4] justify-center" onClick={onConfirm}>
              <Handshake size={14} /> Handle Personally
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
