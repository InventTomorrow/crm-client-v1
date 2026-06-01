'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function DoneView() {
  const router = useRouter();

  return (
    <div className="w-full max-w-[520px] mx-auto flex flex-col items-center text-center gap-6 py-8">
      <div className="w-[72px] h-[72px] rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center">
        <CheckCircle2 size={36} strokeWidth={1.8} className="text-[#22C55E]" />
      </div>

      <div>
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-[-0.02em]">You're all set!</h1>
        <p className="text-[14px] mt-2 text-[var(--ink-mute)] max-w-[320px] mx-auto leading-relaxed">
          Your workspace is ready. Start managing leads and conversations from the dashboard.
        </p>
      </div>

      <div className="card p-5 w-full flex flex-col gap-2.5 text-left">
        {[
          'WhatsApp channel connected',
          'AI chatbot configured',
          'Workspace ready for your team',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={12} className="text-[#22C55E]" />
            </div>
            <span className="text-[13px] text-[var(--ink-soft)]">{item}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-grad px-8 justify-center"
        onClick={() => router.push('/inbox')}
      >
        <ArrowRight size={14} />
        Go to dashboard
      </button>
    </div>
  );
}
