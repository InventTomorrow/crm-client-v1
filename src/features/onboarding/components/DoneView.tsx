'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useOnboardingStatus } from '../hooks/useOnboarding';

export function DoneView() {
  const router = useRouter();
  const { data: status } = useOnboardingStatus();
  const workspaceName = status?.workspaceName?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[520px] mx-auto flex flex-col items-center text-center gap-6 py-8"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
        className="w-[72px] h-[72px] rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center"
      >
        <CheckCircle2 size={36} strokeWidth={1.8} className="text-[#22C55E]" />
      </motion.div>

      <div>
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-[-0.02em]">You're all set!</h1>
        <p className="text-[14px] mt-2 text-[var(--ink-mute)] max-w-[320px] mx-auto leading-relaxed">
          {workspaceName ? <><span className="font-semibold text-[var(--ink-soft)]">{workspaceName}</span> is ready.</> : 'Your workspace is ready.'}{' '}
          Start managing leads and conversations from the dashboard.
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
    </motion.div>
  );
}
