import Container from "../Container";
import Reveal from "../Reveal";
import { UsersIcon, HeartIcon, CheckIcon, BarChartIcon } from "../icons";

const VALUES = [
  {
    icon: UsersIcon,
    title: "Clarity First",
    body: "We simplify the complex so users can act with confidence.",
  },
  {
    icon: HeartIcon,
    title: "Build With Empathy",
    body: "We design for real people, not just numbers.",
  },
  {
    icon: CheckIcon,
    title: "Always Improving",
    body: "We embrace innovation, learning, and continuous growth.",
  },
  {
    icon: BarChartIcon,
    title: "Data With Purpose",
    body: "Insights are only useful if they're actionable—we make sure they are.",
  },
];

export default function Values() {
  return (
    <section className="py-24 md:py-28 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal
              as="h2"
              className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-tight text-brand-dark"
            >
              More Than
              <br /> WhatsApp Business.
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-brand-text text-[16px] leading-relaxed max-w-md">
                WhatsApp Business gives you basic tools. AsaanRabta gives you a
                full WhatsApp sales system.
              </p>
            </Reveal>
            <div className="mt-10 pt-8 border-t border-gray-100 grid sm:grid-cols-2 gap-y-8 gap-x-6 max-w-lg">
              {VALUES.map((v, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="w-10 h-10 rounded-full bg-brand-leaf flex items-center justify-center mb-3 text-brand-dark">
                    <v.icon className="w-5 h-5" strokeWidth={2.3} />
                  </div>
                  <h3 className="text-base font-bold text-brand-dark mb-1.5">
                    {v.title}
                  </h3>
                  <p className="text-brand-text text-[14px] leading-relaxed">
                    {v.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.2}>
            <OfficeWindowArt />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/** Stylized SVG placeholder for the "businessman at office window" photo. */
function OfficeWindowArt() {
  return (
    <div className="rounded-3xl overflow-hidden aspect-square relative shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
      <svg
        viewBox="0 0 600 600"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <pattern
            id="windows"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <rect width="60" height="60" fill="url(#sky)" opacity="0.6" />
            <rect
              x="2"
              y="2"
              width="56"
              height="56"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect x="240" y="0" width="360" height="600" fill="url(#windows)" />
        <g transform="translate(120, 200)">
          <ellipse cx="80" cy="60" rx="35" ry="40" fill="#1e293b" />
          <path
            d="M30 100 Q30 220 80 240 Q130 220 130 100 Q130 90 80 90 Q30 90 30 100 Z"
            fill="#1e293b"
          />
        </g>
        <rect x="0" y="540" width="600" height="60" fill="#0f172a" />
        <rect x="430" y="500" width="120" height="40" rx="4" fill="#0f172a" />
      </svg>
    </div>
  );
}
