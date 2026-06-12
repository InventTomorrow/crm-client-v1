/**
 * Auth visual side panels — fully static, brand-green presentational marketing
 * panels shown on the right pane of each auth route. No animations, no
 * live/dynamic-feel elements. Pure static composition.
 */
import {
  CheckCircle2,
  Clock,
  Fingerprint,
  Lock,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';

/* ── Shared brand glyphs (social channels keep their real brand colors) ── */

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
  </svg>
);

const ShopifyIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M15.337 23.979l7.216-1.561S19.686 6.2 19.67 6.075c-.016-.124-.124-.207-.232-.207-.107 0-2.008-.042-2.008-.042s-1.595-1.553-1.769-1.728v19.881zm-2.008.438L8.34 22.9c0 0-.4-2.39-.42-2.542-.023-.153-.14-.27-.28-.27-.14 0-1.755.37-1.755.37L4.08 22.62l-.02-.16c-.015-.106-1.68-12.25-1.68-12.359 0-.014.006-.028.006-.042.003-.124.1-.22.222-.22.003 0 5.01-.083 5.01-.083S9.29.908 9.444.754a.253.253 0 0 1 .18-.075l3.705.633v23.105z" />
  </svg>
);

interface Channel {
  label: string;
  bg: string;
  icon: React.ReactNode;
}

/* Static channel tile — no live pulse dots */
function ChannelTile({ ch, size = 'lg' }: { ch: Channel; size?: 'lg' | 'sm' }) {
  const tile = size === 'lg' ? 'w-11 h-11' : 'w-10 h-10';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`${tile} rounded-xl flex items-center justify-center`} style={{ background: ch.bg }}>
        {ch.icon}
      </span>
      <span className="text-[11px] text-white/80">{ch.label}</span>
    </div>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex flex-col justify-center gap-7 px-14 py-14 w-full max-w-[500px] mx-auto">
      {children}
    </div>
  );
}

/* ── 1. Login ── */
export function LoginVisualPanel() {
  const channels: Channel[] = [
    { label: 'WhatsApp', bg: '#25D366', icon: <WhatsAppIcon /> },
    { label: 'Instagram', bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', icon: <InstagramIcon /> },
    { label: 'Facebook', bg: '#1877F2', icon: <FacebookIcon /> },
  ];
  const stats = [
    { label: 'New leads', value: '48' },
    { label: 'Replies sent', value: '132' },
    { label: 'Orders', value: '19' },
  ];
  const funnel = [
    { label: 'Inquiries', val: '3.1K', w: '92%' },
    { label: 'Qualified', val: '1.2K', w: '64%' },
    { label: 'Hot', val: '412', w: '38%' },
    { label: 'Closed', val: '96', w: '18%' },
  ];

  return (
    <PanelShell>
      <div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
          One inbox for every<br />Pakistani seller.
        </h2>
        <p className="text-[14px] text-white/70 mt-2">Every chat, lead, and order — managed from one screen.</p>
      </div>

      <div className="flex gap-4">
        {channels.map((ch) => <ChannelTile key={ch.label} ch={ch} />)}
      </div>

      {/* Static daily snapshot */}
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
        <div className="text-[11px] text-white/70 uppercase tracking-[0.10em] font-semibold mb-3">Today at a glance</div>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span className="text-[22px] font-semibold text-white leading-none">{s.value}</span>
              <span className="text-[11px] text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Static funnel — fixed bar widths */}
      <div className="rounded-[14px] bg-white/10 border border-white/20 p-4 flex flex-col gap-2">
        {funnel.map((row) => (
          <div key={row.label} className="flex items-center gap-2.5 text-[11.5px] text-white/95 font-medium">
            <span className="w-[72px] flex-shrink-0">{row.label}</span>
            <div className="relative flex-1 h-[18px] rounded-[5px] bg-white/12 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 rounded-[5px] bg-white/85" style={{ width: row.w }} />
            </div>
            <span className="w-9 text-right font-mono text-[11px] text-white/85">{row.val}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

/* ── 2. Register ── */
export function RegisterVisualPanel() {
  const channels: Channel[] = [
    { label: 'WhatsApp', bg: '#25D366', icon: <WhatsAppIcon size={18} /> },
    { label: 'Instagram', bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', icon: <InstagramIcon size={18} /> },
    { label: 'Facebook', bg: '#1877F2', icon: <FacebookIcon size={18} /> },
    { label: 'Shopify', bg: '#96BF48', icon: <ShopifyIcon /> },
    { label: 'Daraz', bg: '#F85606', icon: <span className="text-white text-[10px] font-black leading-none">D</span> },
  ];
  const board = [
    { col: 'Inquiries', color: '#A7F3D0', cards: ['Ali Hassan', 'Zara Malik', 'Usman T.'] },
    { col: 'Hot Leads', color: '#FDE68A', cards: ['Kashif Raza', 'Mehwish A.'] },
    { col: 'Closed', color: '#FFFFFF', cards: ['Adnan Syed'] },
  ];

  return (
    <PanelShell>
      <div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white mb-1">
          Sell everywhere.<br />Manage from one place.
        </h2>
        <p className="text-[14px] text-white/70">Connect your store, chats, and leads in minutes.</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {channels.map((ch) => <ChannelTile key={ch.label} ch={ch} size="sm" />)}
      </div>

      {/* Static pipeline board */}
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
        <div className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-3">Pipeline</div>
        <div className="grid grid-cols-3 gap-2">
          {board.map((col) => (
            <div key={col.col}>
              <div className="text-[10px] mb-1.5 font-medium" style={{ color: col.color }}>{col.col}</div>
              <div className="flex flex-col gap-1">
                {col.cards.map((c) => (
                  <div key={c} className="rounded-lg bg-white/10 px-2 py-1.5 text-[10.5px] text-white/80">{c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['AI lead extraction', 'Hot lead detection', 'AES-256 encrypted', 'Real-time sync'].map((p) => (
          <span key={p} className="bg-white/10 border border-white/20 text-white text-[11px] px-3 py-1 rounded-full">{p}</span>
        ))}
      </div>
    </PanelShell>
  );
}

/* ── 3. Forgot password ── */
export function ForgotPasswordVisualPanel() {
  const pills = [
    { icon: <Lock size={11} className="text-white" />, label: 'AES-256' },
    { icon: <ShieldCheck size={11} className="text-white" />, label: 'ISO 27001' },
    { icon: <CheckCircle2 size={11} className="text-white" />, label: 'SOC 2 ready' },
  ];
  const grid = [
    { icon: <Clock size={14} className="text-white" />, val: '30 min', sub: 'Link expires in' },
    { icon: <CheckCircle2 size={14} className="text-white" />, val: 'Single-use', sub: 'Signed tokens' },
    { icon: <Fingerprint size={14} className="text-white" />, val: '2FA', sub: 'For all roles' },
    { icon: <ScrollText size={14} className="text-white" />, val: '90 days', sub: 'Audit retention' },
  ];

  return (
    <PanelShell>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-[88px] h-[88px] rounded-[22px] bg-white/15 border border-white/25 flex items-center justify-center">
          <ShieldCheck size={42} className="text-white" strokeWidth={1.6} />
        </div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">Your data is safe.</h2>

        <div className="flex gap-2 flex-wrap justify-center">
          {pills.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-1.5 px-[10px] py-1.5 bg-white/10 border border-white/20 rounded-full text-[11.5px] font-medium text-white/92">
              <span className="w-[18px] h-[18px] rounded-full bg-white/22 inline-flex items-center justify-center">{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>

        <div className="w-full rounded-[14px] bg-white/10 border border-white/20 p-4">
          <div className="text-[11px] text-white/75 uppercase tracking-[0.10em] font-semibold mb-3 text-left">Security on every reset</div>
          <div className="grid grid-cols-2 gap-2.5">
            {grid.map((s) => (
              <div key={s.val} className="flex flex-col items-center gap-1.5 p-3 bg-white/8 border border-white/15 rounded-[10px]">
                <span className="w-7 h-7 rounded-full bg-white/18 inline-flex items-center justify-center">{s.icon}</span>
                <div className="text-[13px] font-semibold text-white">{s.val}</div>
                <div className="text-[10.5px] text-white/72">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

/* ── 4. Reset password ── */
export function ResetPasswordVisualPanel() {
  const checklist = [
    'Minimum 8 characters long',
    'At least 1 uppercase character (A-Z)',
    'At least 1 numeric digit (0-9)',
    'One special symbol is highly recommended',
  ];
  return (
    <PanelShell>
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 text-white mb-2">
        <Lock size={24} className="text-white" />
      </div>
      <h2 className="text-[28px] font-semibold leading-tight text-white">
        Re-secure your<br />workspace.
      </h2>
      <p className="text-[14px] text-white/70 leading-relaxed">
        Create a strong new password to keep your client conversations, WhatsApp chats, and order data safe.
      </p>

      <div className="rounded-2xl bg-white/10 border border-white/20 p-5 flex flex-col gap-3">
        <div className="text-[11px] text-white/75 font-semibold uppercase tracking-wider">Strong password checklist</div>
        <div className="flex flex-col gap-2.5">
          {checklist.map((c) => (
            <div key={c} className="flex items-center gap-2 text-white/90 text-[12px]">
              <CheckCircle2 size={13} className="text-white flex-shrink-0" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

/* ── 5. Accept invite ── */
export function AcceptInviteVisualPanel() {
  const roles = [
    { role: 'Workspace Owner', desc: 'Full administrative access' },
    { role: 'Manager', desc: 'Pipeline & chat assignments' },
    { role: 'Agent', desc: 'Dedicated client conversions' },
  ];
  return (
    <PanelShell>
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 text-white mb-2">
        <Users size={24} className="text-white" />
      </div>
      <h2 className="text-[28px] font-semibold leading-tight text-white">
        Your team is<br />waiting for you.
      </h2>
      <p className="text-[14px] text-white/70 leading-relaxed">
        Join the shared workspace, connect with your teammates, and start converting incoming WhatsApp leads together.
      </p>

      <div className="rounded-2xl bg-white/10 border border-white/20 p-5 flex flex-col gap-4">
        <div className="text-[11px] text-white/80 font-semibold uppercase tracking-wider">Workspace roles enabled</div>
        <div className="flex flex-col gap-3">
          {roles.map((r) => (
            <div key={r.role} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-[12.5px] font-semibold text-white leading-tight">{r.role}</div>
                <div className="text-[11.5px] text-white/60 mt-0.5 leading-none">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}
