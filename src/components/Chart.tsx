import { useEffect, useRef, useState, type PointerEvent } from "react";

type Series = {
  label: string;
  values: number[];
  color: string;
  dashed?: boolean;
  faint?: boolean;
};

type Props = {
  series: Series[];
  errors?: number[];
  xLabel?: (index: number) => string;
};

const HEIGHT = 220;
const PAD = { left: 34, right: 14, top: 12, bottom: 26 };
const INNER_H = HEIGHT - PAD.top - PAD.bottom;

// round up so all 4 lines on the axis get round numbers
function niceMax(value: number) {
  const step = value > 100 ? 40 : 20;
  return Math.max(step, Math.ceil(value / step) * step);
}

export default function Chart({ series, errors = [], xLabel = (i) => String(i + 1) }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const boxRef = useRef<HTMLDivElement>(null);

  // the svg is drawn at its real width, so the labels stay the same size on phones
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const WIDTH = width;
  const INNER_W = WIDTH - PAD.left - PAD.right;
  const count = Math.max(...series.map((line) => line.values.length));
  const max = niceMax(Math.max(...series.flatMap((line) => line.values)));

  const x = (i: number) => PAD.left + (count === 1 ? INNER_W / 2 : (i / (count - 1)) * INNER_W);
  const y = (value: number) => PAD.top + INNER_H - (value / max) * INNER_H;
  const path = (values: number[]) => values.map((value, i) => `${i ? "L" : "M"}${x(i)},${y(value)}`).join(" ");
  const step = Math.ceil(count / Math.max(2, Math.floor(INNER_W / 55)));
  // the last label always shows, so skip the one before it if they'd touch
  const showLabel = (i: number) => i === count - 1 || (i % step === 0 && count - 1 - i >= step / 2);

  function handlePointer(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const pointX = ((event.clientX - box.left) / box.width) * WIDTH;
    const index = Math.round(((pointX - PAD.left) / INNER_W) * (count - 1));
    setHover(Math.min(count - 1, Math.max(0, index)));
  }

  if (count === 0) return null;

  return (
    <div ref={boxRef} className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full touch-none overflow-visible" onPointerMove={handlePointer} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={series[0].color} stopOpacity="0.22" />
            <stop offset="1" stopColor={series[0].color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((part) => (
          <g key={part}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(max * part)} y2={y(max * part)} stroke="var(--sub)" strokeOpacity="0.2" />
            <text x={PAD.left - 8} y={y(max * part)} dy="0.35em" textAnchor="end" className="fill-sub font-mono text-[11px]">
              {Math.round(max * part)}
            </text>
          </g>
        ))}
        {Array.from({ length: count }, (_, i) =>
          showLabel(i) ? (
            <text key={i} x={x(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-sub font-mono text-[11px]">
              {xLabel(i)}
            </text>
          ) : null
        )}

        {count > 1 && <path d={`${path(series[0].values)} L${x(count - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="url(#area)" />}
        {series.map((line) => (
          <path
            key={line.label}
            d={path(line.values)}
            fill="none"
            stroke={line.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={line.dashed ? "5 6" : undefined}
            strokeOpacity={line.faint ? 0.3 : 1}
          />
        ))}
        {count === 1 && series.map((line) => <circle key={line.label} cx={x(0)} cy={y(line.values[0])} r="5" fill={line.color} />)}
        {errors.map((amount, i) =>
          amount > 0 ? (
            <text key={i} x={x(i)} y={y(series[0].values[i])} dy="-0.7em" textAnchor="middle" className="fill-error font-mono text-[13px] font-bold">
              ×
            </text>
          ) : null
        )}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + INNER_H} stroke="var(--sub)" strokeOpacity="0.5" />
            {series.map((line) => (
              <circle key={line.label} cx={x(hover)} cy={y(line.values[hover] ?? 0)} r="4.5" fill={line.color} stroke="var(--bg)" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-text px-2.5 py-1.5 font-mono text-xs whitespace-nowrap text-bg"
          style={{ left: `${(x(hover) / WIDTH) * 100}%` }}
        >
          <p className="opacity-60">{xLabel(hover)}</p>
          {series.map((line) => (
            <p key={line.label}>
              {line.label} {line.values[hover]}
            </p>
          ))}
          {errors[hover] > 0 && <p>errors {errors[hover]}</p>}
        </div>
      )}
    </div>
  );
}
