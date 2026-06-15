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

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex flex-col justify-center gap-7 px-14 py-14 w-full max-w-[500px] mx-auto">
      {children}
    </div>
  );
}

/* ── 1. Login ── */
export function LoginVisualPanel() {
  const stats = [
    { label: 'New inquiries', value: '48' },
    { label: 'Replies sent', value: '132' },
    { label: 'Booked orders', value: '19' },
  ];
  const funnel = [
    { label: 'Inquiries', val: '3.1K', w: '92%' },
    { label: 'Qualified leads', val: '1.2K', w: '64%' },
    { label: 'Hot leads', val: '412', w: '38%' },
    { label: 'Booked orders', val: '96', w: '18%' },
  ];

  return (
    <PanelShell>
      <div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
          Turn every WhatsApp<br />chat into more orders.
        </h2>
        <p className="text-[14px] text-white/70 mt-2">
          Reply faster, manage leads, and close customers from one simple screen.
        </p>
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
        <div className="text-[11px] text-white/70 uppercase tracking-[0.10em] font-semibold mb-1">Lead pipeline</div>
        {funnel.map((row) => (
          <div key={row.label} className="flex items-center gap-2.5 text-[11.5px] text-white/95 font-medium">
            <span className="w-[96px] flex-shrink-0">{row.label}</span>
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
  const stats = [
    { label: 'Inquiries', value: '3.1K' },
    { label: 'Qualified leads', value: '1.2K' },
    { label: 'Booked orders', value: '412' },
  ];
  const board = [
    { col: 'Inquiries', color: '#A7F3D0', cards: ['Ali Hassan', 'Zara Malik', 'Usman T.'] },
    { col: 'Hot Leads', color: '#FDE68A', cards: ['Kashif Raza', 'Mehwish A.'] },
    { col: 'Booked', color: '#FFFFFF', cards: ['Adnan Syed'] },
  ];

  return (
    <PanelShell>
      <div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white mb-1">
          Every chat, lead<br />and order in one place.
        </h2>
        <p className="text-[14px] text-white/70">Capture inquiries, qualify leads, and close orders in minutes.</p>
      </div>

      {/* Headline metrics */}
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span className="text-[22px] font-semibold text-white leading-none">{s.value}</span>
              <span className="text-[11px] text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
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
