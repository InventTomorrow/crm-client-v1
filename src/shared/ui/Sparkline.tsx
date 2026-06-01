interface SparklineProps {
  values: number[];
  w?: number;
  h?: number;
}

export function Sparkline({ values, w = 100, h = 30 }: SparklineProps) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = w / (values.length - 1);
  const pts = values.map((v, i) => [i * stepX, h - ((v - min) / span) * (h - 4) - 2] as [number, number]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className="block">
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#4FC3F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7C3AED" stopOpacity="0.25" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={d} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
