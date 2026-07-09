import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Check, Cloud, Crown, Link, Zap } from "lucide-react";
import { memo } from "react";
import { ERP_SYSTEMS, STOREFRONTS } from "../types";

/** Tier 2 — static preview of the URL-sync flow, not yet wired to a backend. */
export const UrlSyncPanel = memo(function UrlSyncPanel() {
  return (
    <div className="card p-[22px]">
      <h3 className="text-[15px] font-semibold mb-1.5">URL Sync</h3>
      <p className="text-[13px] mb-4 text-[var(--ink-soft)]">
        Paste a product page URL — we extract title, price, images, and stock
        automatically.
      </p>
      <div className="flex gap-2 mb-4">
        <Input
          className="flex-1"
          placeholder="https://daraz.pk/products/lawn-suit-3-piece-..."
        />
        <Button>
          <Zap size={13} /> Extract
        </Button>
      </div>
      <div className="card flex gap-3 items-center p-3">
        <div className="placeholder-img w-16 h-16 aspect-auto">IMG</div>
        <div className="flex-1">
          <div className="font-medium">
            Lawn Suit 3-Piece — Pink Embroidery
          </div>
          <div className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
            daraz.pk · extracted just now
          </div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="entity-chip entity-money">Rs. 8,499</span>
            <span className="badge font-medium bg-[rgba(34,197,94,0.12)] text-[#15803D]">
              In stock
            </span>
          </div>
        </div>
        <Button>Save</Button>
      </div>
    </div>
  );
});

/** Tier 3 — static preview of storefront connection cards. */
export const StorefrontPanel = memo(function StorefrontPanel() {
  return (
    <div className="card p-[22px]">
      <h3 className="text-[15px] font-semibold mb-1">Storefront Connections</h3>
      <p className="text-[13px] mb-4 text-[var(--ink-soft)]">
        Connect your e-commerce platform for live two-way sync.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[10px]">
        {STOREFRONTS.map((s) => (
          <div key={s.name} className="card p-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
                style={{ background: s.color }}
              >
                {s.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[13px]">{s.name}</div>
                <div className="text-[11px] text-[var(--ink-mute)]">
                  {s.acct}
                </div>
              </div>
            </div>
            {s.status === "connected" ? (
              <Button variant="outline" className="w-full">
                <Check size={12} /> Connected
              </Button>
            ) : (
              <Button className="w-full">
                <Link size={12} /> Connect
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

/** Tier 4 — static preview of the enterprise ERP invitation panel. */
export const ErpPanel = memo(function ErpPanel() {
  return (
    <div className="card p-[22px]">
      <div className="card flex items-center gap-3 mb-3.5 p-[14px] bg-[var(--surface-2)] border-[var(--accent)]">
        <span className="w-[34px] h-[34px] rounded-[9px] inline-flex items-center justify-center flex-shrink-0 bg-[var(--accent)] text-white">
          <Crown size={16} />
        </span>
        <div className="flex-1">
          <div className="font-medium">Enterprise ERP · by invitation</div>
          <div className="text-[11.5px] text-[var(--ink-soft)]">
            Connect SAP, Oracle, Odoo. Real-time stock + order sync via secure
            middleware.
          </div>
        </div>
        <Button>Request access</Button>
      </div>
      <div className="grid grid-cols-3 gap-[10px]">
        {ERP_SYSTEMS.map((n) => (
          <div key={n} className="card text-center p-3">
            <Cloud size={18} className="text-[var(--accent)] mx-auto" />
            <div className="font-medium mt-1.5 text-[13px]">{n}</div>
            <div className="text-[11px] mt-0.5 text-[var(--ink-mute)]">
              Coming Q3
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
