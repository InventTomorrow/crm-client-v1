/**
 * Legacy auth visual panels — preserved reference of the original animated
 * (dynamic-feel) side panels. No longer rendered; kept for design history.
 */
import { CheckCircle2, Lock, Users } from 'lucide-react';

export function LoginVisualPanel() {
  return (
    <div className="auth-visual-inner relative z-10 flex flex-col justify-center gap-7 px-14 py-14 w-full max-w-[500px] mx-auto">
      <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
        One inbox for every
        <br />
        Pakistani seller.
      </h2>

      {/* Channel pills */}
      <div className="flex gap-4">
        {[
          {
            label: "WhatsApp",
            bg: "#25D366",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
              </svg>
            ),
          },
          {
            label: "Instagram",
            bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            ),
          },
          {
            label: "Facebook",
            bg: "#1877F2",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
              </svg>
            ),
          },
        ].map((ch, i) => (
          <div
            key={ch.label}
            className={`flex flex-col items-center gap-1.5 auth-bob-${i + 1}`}
          >
            <span className="relative">
              <span className="auth-pulse-dot absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] border border-white/50 z-10" />
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: ch.bg }}
              >
                {ch.icon}
              </span>
            </span>
            <span className="text-[11px] text-white/80">{ch.label}</span>
          </div>
        ))}
      </div>

      {/* Live hot leads card */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-white/85 uppercase tracking-[0.10em] font-semibold">
            <span
              className="auth-pulse-dot w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block"
              style={{ boxShadow: "0 0 0 0 rgba(34,197,94,0.5)" }}
            />
            Live · hot leads
          </div>
          <span className="text-[11px] text-white/60 font-mono">just now</span>
        </div>
        {[
          {
            init: "AH",
            from: "#22D3EE",
            to: "#7C3AED",
            name: "Ali Hassan",
            city: "Karachi",
            msg: "Bhai final price kya hai?",
            badge: "HOT",
            live: true,
            typing: false,
          },
          {
            init: "ZM",
            from: "#F472B6",
            to: "#7C3AED",
            name: "Zara Malik",
            city: "typing",
            msg: "",
            badge: "WARM",
            live: false,
            typing: true,
          },
          {
            init: "UT",
            from: "#34D399",
            to: "#0EA5E9",
            name: "Usman Tariq",
            city: "Islamabad",
            msg: "COD available? I want 2 pieces.",
            badge: "HOT",
            live: false,
            typing: false,
          },
        ].map((r) => (
          <div key={r.init} className="flex items-center gap-2.5">
            <div
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg,${r.from},${r.to})`,
              }}
            >
              {r.init}
              {r.live && (
                <span className="auth-pulse-dot absolute -top-px -right-px w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-white leading-none">
                {r.name}{" "}
                <span className="text-white/55 text-[11px] font-normal">
                  · {r.city}
                </span>
              </div>
              {r.typing ? (
                <div className="flex items-center gap-[3px] mt-0.5">
                  <span className="auth-typing-1 w-[5px] h-[5px] rounded-full bg-white/75 inline-block" />
                  <span className="auth-typing-2 w-[5px] h-[5px] rounded-full bg-white/75 inline-block" />
                  <span className="auth-typing-3 w-[5px] h-[5px] rounded-full bg-white/75 inline-block" />
                </div>
              ) : (
                <div className="text-[11.5px] text-white/65 truncate mt-0.5">
                  {r.msg}
                </div>
              )}
            </div>
            <span
              className={`text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full tracking-wide ${r.badge === "HOT" ? "auth-pulse-ring bg-[#EF4444]" : "bg-[#F59E0B]"}`}
            >
              {r.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="rounded-[14px] bg-white/10 border border-white/20 p-4 backdrop-blur-[8px] flex flex-col gap-2">
        {[
          { label: "Inquiries", val: "3.1K", w: "92%", delay: "0.15s" },
          { label: "Qualified", val: "1.2K", w: "64%", delay: "0.30s" },
          { label: "Hot", val: "412", w: "38%", delay: "0.45s" },
          { label: "Closed", val: "96", w: "18%", delay: "0.60s" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-2.5 text-[11.5px] text-white/95 font-medium"
          >
            <span className="w-[72px] flex-shrink-0">{row.label}</span>
            <div className="relative flex-1 h-[18px] rounded-[5px] bg-white/12 overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 rounded-[5px] bg-white/85"
                style={{
                  width: row.w,
                  animation: `fvGrow 2.2s ${row.delay} ease-out forwards`,
                }}
              />
            </div>
            <span className="w-9 text-right font-mono text-[11px] text-white/85">
              {row.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Register Visual Panel
export function RegisterVisualPanel() {
  const channels = [
    {
      label: "WhatsApp",
      bg: "#25D366",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      bg: "#1877F2",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
        </svg>
      ),
    },
    {
      label: "Shopify",
      bg: "#96BF48",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M15.337 23.979l7.216-1.561S19.686 6.2 19.67 6.075c-.016-.124-.124-.207-.232-.207-.107 0-2.008-.042-2.008-.042s-1.595-1.553-1.769-1.728v19.881zm-2.008.438L8.34 22.9c0 0-.4-2.39-.42-2.542-.023-.153-.14-.27-.28-.27-.14 0-1.755.37-1.755.37L4.08 22.62l-.02-.16c-.015-.106-1.68-12.25-1.68-12.359 0-.014.006-.028.006-.042.003-.124.1-.22.222-.22.003 0 5.01-.083 5.01-.083S9.29.908 9.444.754a.253.253 0 0 1 .18-.075c.01 0 .02 0 .03.002l3.675.633v22.703z" />
        </svg>
      ),
    },
    {
      label: "Daraz",
      bg: "#F85606",
      icon: (
        <span className="text-white text-[10px] font-black leading-none">
          D
        </span>
      ),
    },
  ];

  return (
    <div className="auth-visual-inner relative z-10 flex flex-col justify-center gap-7 px-14 py-14 w-full max-w-[500px] mx-auto">
      <div>
        <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white mb-1">
          Sell everywhere.
          <br />
          Manage from one place.
        </h2>
        <p className="text-[14px] text-white/70">
          Connect your store, chat, and leads in minutes.
        </p>
      </div>

      {/* Channel grid */}
      <div className="flex gap-3 flex-wrap">
        {channels.map((ch, i) => (
          <div
            key={ch.label}
            className={`flex flex-col items-center gap-1.5 auth-bob-${i + 1}`}
          >
            <span className="relative">
              <span className="auth-pulse-dot absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] border border-white/50 z-10" />
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: ch.bg }}
              >
                {ch.icon}
              </span>
            </span>
            <span className="text-[10.5px] text-white/75">{ch.label}</span>
          </div>
        ))}
      </div>

      {/* Mini kanban preview */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
        <div className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-3">
          Pipeline
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              col: "Inquiries",
              color: "#60A5FA",
              cards: ["Ali Hassan", "Zara Malik", "Usman T."],
            },
            {
              col: "Hot Leads",
              color: "#F97316",
              cards: ["Kashif Raza", "Mehwish A."],
            },
            { col: "Closed", color: "#22C55E", cards: ["Adnan Syed"] },
          ].map((col) => (
            <div key={col.col}>
              <div
                className="text-[10px] text-white/55 mb-1.5 font-medium"
                style={{ color: col.color }}
              >
                {col.col}
              </div>
              <div className="flex flex-col gap-1">
                {col.cards.map((c) => (
                  <div
                    key={c}
                    className="rounded-lg bg-white/10 px-2 py-1.5 text-[10.5px] text-white/80"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[
          "🤖 AI lead extraction",
          "🔥 Hot lead detection",
          "🔐 AES-256 encrypted",
          "⚡ Real-time sync",
        ].map((p) => (
          <span
            key={p}
            className="bg-white/10 border border-white/20 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-sm"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

// 3. Forgot Password Visual Panel
export function ForgotPasswordVisualPanel() {
  return (
    <div className="auth-visual-inner relative z-10 flex flex-col justify-center items-center gap-6 px-14 py-14 w-full max-w-[500px] mx-auto text-center">
      {/* Animated shield */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <span className="auth-ring-1 absolute inset-0 rounded-full border border-white/30" />
        <span className="auth-ring-2 absolute inset-0 rounded-full border border-white/30" />
        <span className="auth-ring-3 absolute inset-0 rounded-full border border-white/30" />
        <div className="auth-bob relative z-10 w-[88px] h-[88px] rounded-[22px] bg-white/18 border border-white/30 backdrop-blur-[8px] flex items-center justify-center">
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      </div>

      <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
        Your data is safe.
      </h2>

      {/* Icon pills */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[
          {
            icon: (
              <svg
                key="l"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ),
            label: "AES-256",
          },
          {
            icon: (
              <svg
                key="s"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
            label: "ISO 27001",
          },
          {
            icon: (
              <svg
                key="p"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
            label: "SOC 2 ready",
          },
        ].map((p) => (
          <span
            key={p.label}
            className="inline-flex items-center gap-1.5 px-[10px] py-1.5 bg-white/10 border border-white/20 rounded-full text-[11.5px] font-medium text-white/92 backdrop-blur-[8px]"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-white/22 inline-flex items-center justify-center">
              {p.icon}
            </span>
            {p.label}
          </span>
        ))}
      </div>

      {/* Security stat grid */}
      <div className="w-full rounded-[14px] bg-white/10 border border-white/20 p-4 backdrop-blur-[10px]">
        <div className="text-[11px] text-white/75 uppercase tracking-[0.10em] font-semibold mb-3">
          Security on every reset
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              val: "30 min",
              sub: "Link expires in",
            },
            {
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ),
              val: "Single-use",
              sub: "Signed tokens",
            },
            {
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              ),
              val: "2FA",
              sub: "For all roles",
            },
            {
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              ),
              val: "90 days",
              sub: "Audit retention",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 p-3 bg-white/8 border border-white/15 rounded-[10px]"
            >
              <span className="w-7 h-7 rounded-full bg-white/18 inline-flex items-center justify-center">
                {s.icon}
              </span>
              <div className="text-[13px] font-semibold text-white">
                {s.val}
              </div>
              <div className="text-[10.5px] text-white/72">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Reset Password Visual Panel
export function ResetPasswordVisualPanel() {
  return (
    <div className="relative z-10 flex flex-col justify-center gap-6 px-14 py-14 w-full max-w-[500px] mx-auto">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 text-white mb-2">
        <Lock size={24} className="text-white" />
      </div>
      <h2 className="text-[28px] font-semibold leading-tight text-white">
        Re-secure your
        <br />
        workspace.
      </h2>
      <p className="text-[14px] text-white/70 leading-relaxed">
        Create a robust new password to keep your client communication, WhatsApp
        chats, and financial summaries safe.
      </p>

      {/* Password Checklist display */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 flex flex-col gap-3">
        <div className="text-[11px] text-white/75 font-semibold uppercase tracking-wider">
          Strong Password Checklist
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            "Minimum 8 characters long",
            "At least 1 uppercase character (A-Z)",
            "At least 1 numeric digit (0-9)",
            "One special symbol is highly recommended",
          ].map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-white/90 text-[12px]"
            >
              <CheckCircle2
                size={13}
                className="text-[#34D399] flex-shrink-0"
              />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Accept Invite Visual Panel
export function AcceptInviteVisualPanel() {
  return (
    <div className="relative z-10 flex flex-col justify-center gap-6 px-14 py-14 w-full max-w-[500px] mx-auto">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 text-white mb-2">
        <Users size={24} className="text-white" />
      </div>
      <h2 className="text-[28px] font-semibold leading-tight text-white">
        Your team is
        <br />
        waiting for you.
      </h2>
      <p className="text-[14px] text-white/70 leading-relaxed">
        Join the shared workspace, connect with your teammates, and start
        converting incoming WhatsApp leads in real-time.
      </p>

      {/* Workspace Preview */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 flex flex-col gap-4.5">
        <div className="text-[11px] text-white/80 font-semibold uppercase tracking-wider">
          Workspace Roles Enabled
        </div>

        <div className="flex flex-col gap-3">
          {[
            { role: "Workspace Owner", desc: "Full administrative access" },
            { role: "Manager", desc: "Pipeline & chat assignments" },
            { role: "Agent", desc: "Dedicated client conversions" },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-[12.5px] font-semibold text-white leading-tight">
                  {r.role}
                </div>
                <div className="text-[11.5px] text-white/60 mt-0.5 leading-none">
                  {r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
