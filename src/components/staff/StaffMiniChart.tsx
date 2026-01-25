'use client';

type Series = {
  name: string;
  colorClassName: string;
  points: number[];
};

function normalize(points: number[], height: number) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  return points.map((p) => height - ((p - min) / span) * height);
}

export function StaffMiniLineChart({
  series,
  height = 110,
}: {
  series: Series[];
  height?: number;
}) {
  const width = 320;
  const pad = 8;

  return (
    <div className="h-[140px]">
      <svg viewBox={`0 0 ${width} ${height + pad * 2}`} className="h-full w-full">
        <defs>
          <linearGradient id="grid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={width} height={height + pad * 2} fill="url(#grid)" />

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            x2={width}
            y1={pad + height * t}
            y2={pad + height * t}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />
        ))}

        {series.map((s, idx) => {
          const y = normalize(s.points, height);
          const step = (width - pad * 2) / (Math.max(1, s.points.length - 1));
          const d = y
            .map((yy, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step} ${pad + yy}`)
            .join(' ');
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              strokeWidth="2"
              className={s.colorClassName}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function StaffMiniBarChart({
  bars,
  barClassName,
}: {
  bars: number[];
  barClassName?: string;
}) {
  const max = Math.max(...bars, 1);
  return (
    <div className="flex h-[140px] items-end gap-2">
      {bars.map((v, i) => (
        <div key={i} className="flex-1">
          <div
            className={`w-full rounded-md ${barClassName || 'bg-gray-900/80'}`}
            style={{ height: `${(v / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}
