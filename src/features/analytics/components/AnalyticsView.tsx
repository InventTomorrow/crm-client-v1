'use client';
import { useState } from 'react';
import { Users, Flame, Zap, Sparkles, Upload, Check, Target, BoltIcon } from 'lucide-react';
import { Sparkline } from '@/shared/ui/Sparkline';
import { sparkData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { KPI, ChannelDatum, FunnelDatum, PhaseItem, DateRange } from '../types';

// ──────────────────── Line Chart ────────────────────
function LineChart({ data, labels, w = 600, h = 220 }: {
  data: number[];
  labels?: string[];
  w?: number;
  h?: number;
}) {
  const max = Math.max(...data) * 1.1;
  const padL = 32, padB = 28, padT = 12, padR = 8;
  const cw = w - padL - padR;
  const ch = h - padT - padB;
  const stepX = cw / (data.length - 1);
  const pts = data.map((v, i) => [padL + i * stepX, padT + ch - (v / max) * ch]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${padL + cw},${padT + ch} L${padL},${padT + ch} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="block">
      <defs>
        <linearGradient id="lc-line" x1="0" x2="1">
          <stop offset="0" stopColor="#4FC3F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="lc-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7C3AED" stopOpacity="0.30" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => {
        const y = padT + (ch / 3) * i;
        return <line key={i} x1={padL} x2={w - padR} y1={y} y2={y} stroke="rgba(15,23,42,0.06)" />;
      })}
      <path d={area} fill="url(#lc-area)" />
      <path d={d} fill="none" stroke="url(#lc-line)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="white" stroke="#7C3AED" strokeWidth="2" />
      ))}
      {labels && labels.map((l, i) => (
        <text key={i} x={padL + i * stepX} y={h - 10} fontSize="10" fill="rgba(100,116,139,0.9)"
          textAnchor="middle" fontFamily="var(--font-mono)">{l}</text>
      ))}
    </svg>
  );
}

// ──────────────────── Pie Chart ────────────────────
function PieChart({ data, size = 200 }: { data: ChannelDatum[]; size?: number }) {
  const total = data.reduce((a, d) => a + d.v, 0);
  const r = size / 2;
  const ri = size * 0.32;
  let acc = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {data.map((d, i) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += d.v;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = r + Math.cos(start) * r,  y1 = r + Math.sin(start) * r;
        const x2 = r + Math.cos(end)   * r,  y2 = r + Math.sin(end)   * r;
        const x3 = r + Math.cos(end)   * ri, y3 = r + Math.sin(end)   * ri;
        const x4 = r + Math.cos(start) * ri, y4 = r + Math.sin(start) * ri;
        return (
          <path key={i} fill={d.c} stroke="white" strokeWidth="2"
            d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ri},${ri} 0 ${large} 0 ${x4},${y4} Z`} />
        );
      })}
      <text x="50%" y="48%" textAnchor="middle" fontSize="22" fontWeight="600" fontFamily="var(--font-head)" fill="currentColor">{total}</text>
      <text x="50%" y="62%" textAnchor="middle" fontSize="10" fill="#94A3B8">Total leads</text>
    </svg>
  );
}

// ──────────────────── Funnel Chart ────────────────────
function FunnelChart({ data }: { data: FunnelDatum[] }) {
  const max = data[0].v;
  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => {
        const pct = (d.v / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[110px] text-[12px] font-medium text-[var(--ink-soft)]">{d.label}</div>
            <div className="flex-1 h-[26px] rounded-md overflow-hidden relative bg-[var(--surface-2)] border border-[var(--line)]">
              <div
                className="h-full flex items-center justify-end pr-2.5 text-[11px] font-medium text-white transition-all bg-[var(--accent)]"
                style={{ width: `${pct}%` }}
              >
                {d.v.toLocaleString()}
              </div>
            </div>
            <div className="w-12 text-[11px] text-right text-[var(--ink-mute)] font-[var(--font-mono)]">
              {Math.round(pct)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────── Analytics data ────────────────────
const KPIS: KPI[] = [
  { label: 'New Leads',       value: '247',  delta: '+18%', up: true },
  { label: 'Hot Conversions', value: '38',   delta: '+24%', up: true },
  { label: 'Revenue (PKR)',   value: '4.2L', delta: '+12%', up: true },
  { label: 'Avg Response',    value: '42s',  delta: '−31%', up: true },
  { label: 'AI Resolution',   value: '76%',  delta: '+8%',  up: true },
];
const KPI_ICONS = [Users, Flame, Zap, Zap, Sparkles];

const VELOCITY = [12, 18, 22, 28, 24, 30, 38, 45, 42, 48, 55, 62];
const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];

const CHANNEL_DATA: ChannelDatum[] = [
  { label: 'WhatsApp',  v: 142, c: '#25D366' },
  { label: 'Instagram', v: 64,  c: '#DD2A7B' },
  { label: 'Facebook',  v: 32,  c: '#1877F2' },
  { label: 'TikTok',    v: 9,   c: '#0F172A' },
];

const FUNNEL: FunnelDatum[] = [
  { label: 'Visitors',        v: 8420 },
  { label: 'Conversations',   v: 3120 },
  { label: 'Qualified Leads', v: 1245 },
  { label: 'Hot Leads',       v: 412  },
  { label: 'Checkout Sent',   v: 188  },
  { label: 'Orders',          v: 96   },
];

const PHASES: PhaseItem[] = [
  { n: 1, label: 'Inbox + Mock Replies', state: 'done' },
  { n: 2, label: 'AI Entity Extraction', state: 'done' },
  { n: 3, label: 'Hot Lead Detection',   state: 'live' },
  { n: 4, label: 'Multi-channel Sync',   state: 'next' },
  { n: 5, label: 'ERP Integration',      state: 'next' },
];

// ──────────────────── AnalyticsView (root) ────────────────────
export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  return (
    <div className="scroll overflow-y-auto h-full p-[18px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Analytics</h2>
          <div className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
            Last {dateRange} · auto-refreshes every 5 min
          </div>
        </div>
        <div className="flex gap-2">
          <div className="seg">
            {(['7d', '30d', '90d'] as DateRange[]).map(r => (
              <button key={r} className={dateRange === r ? 'on' : ''} onClick={() => setDateRange(r)}>{r}</button>
            ))}
          </div>
          <button className="btn btn-outline"><Upload size={13} /> Export HubSpot</button>
          <button className="btn btn-outline"><Upload size={13} /> Export Salesforce</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 mb-4 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {KPIS.map((k, i) => {
          const Icon = KPI_ICONS[i];
          return (
            <div key={i} className="card kpi">
              <div className="flex items-center justify-between">
                <span className="ic"><Icon size={16} /></span>
                <span className={cn('badge font-medium', k.up ? 'bg-[rgba(34,197,94,0.12)] text-[#15803D]' : 'bg-[rgba(239,68,68,0.12)] text-[#DC2626]')}>
                  {k.delta}
                </span>
              </div>
              <div className="font-semibold leading-none text-[26px] text-[var(--ink)] font-[var(--font-head)]">
                {k.value}
              </div>
              <div className="text-[12px] text-[var(--ink-mute)]">{k.label}</div>
              <Sparkline values={sparkData(10, 30, 8)} w={130} h={26} />
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-3.5 mb-3.5 grid-cols-[2fr_1fr]">
        <div className="card p-[18px]">
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <h3 className="text-[14px] font-semibold">Lead Velocity</h3>
              <div className="text-[12px] text-[var(--ink-mute)]">Net new leads / month</div>
            </div>
            <div className="text-[11px] flex gap-4 text-[var(--ink-soft)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" /> Leads
              </span>
            </div>
          </div>
          <LineChart data={VELOCITY} labels={MONTHS} />
        </div>
        <div className="card flex flex-col p-[18px]">
          <h3 className="text-[14px] font-semibold mb-1">Channel Breakdown</h3>
          <div className="text-[12px] mb-3.5 text-[var(--ink-mute)]">Where your leads come from</div>
          <div className="flex items-center justify-center">
            <PieChart data={CHANNEL_DATA} size={170} />
          </div>
          <div className="flex flex-col gap-1.5 mt-3.5">
            {CHANNEL_DATA.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[12px]">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.c }} />
                <span className="flex-1">{d.label}</span>
                <span className="font-[var(--font-mono)] text-[var(--ink-mute)]">{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="card mb-3.5 p-[18px]">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-[14px] font-semibold">Lead Funnel</h3>
            <div className="text-[12px] text-[var(--ink-mute)]">Conversion stages · {dateRange}</div>
          </div>
          <span className="badge font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
            <Target size={11} /> Overall 1.14%
          </span>
        </div>
        <FunnelChart data={FUNNEL} />
      </div>

      {/* Phase rollout */}
      <div className="card p-[18px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold">Phase Rollout</h3>
            <div className="text-[12px] text-[var(--ink-mute)]">Q3 product roadmap</div>
          </div>
          <span className="badge font-medium bg-[var(--accent-soft)] text-[var(--accent)]">3 / 5 shipped</span>
        </div>
        <div className="hscroll flex items-center pb-1.5">
          {PHASES.map((p, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 min-w-[130px]">
                <span
                  className={cn('step-dot w-7 h-7 text-[11px]', p.state === 'done' ? 'done' : p.state === 'live' ? 'live' : '')}
                >
                  {p.state === 'done' ? <Check size={14} strokeWidth={3} /> : p.n}
                </span>
                <div className="text-[12px] font-medium text-center">{p.label}</div>
                {p.state === 'live' && (
                  <span className="badge font-semibold bg-[rgba(239,68,68,0.15)] text-[#DC2626]">Live</span>
                )}
                {p.state === 'next' && (
                  <span className="badge bg-[rgba(15,23,42,0.06)] text-[var(--ink-mute)]">Next</span>
                )}
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={cn('flex-1 h-0.5 self-start mt-[14px] min-w-6', p.state === 'done' ? 'bg-[var(--grad-h)]' : 'bg-[rgba(148,163,184,0.4)]')}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
