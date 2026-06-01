export interface KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}

export interface ChannelDatum {
  label: string;
  v: number;
  c: string;
}

export interface FunnelDatum {
  label: string;
  v: number;
}

export interface PhaseItem {
  n: number;
  label: string;
  state: 'done' | 'live' | 'next';
}

export type DateRange = '7d' | '30d' | '90d';
