import { useState } from "react";

let toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  function push(message, tone) {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, tone: tone || "default" }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }
  const node = (
    <div className="tb-toast-stack" aria-live="polite">
      {toasts.map(t => <div key={t.id} className={"tb-toast tb-toast-" + t.tone}>{t.message}</div>)}
    </div>
  );
  return [push, node];
}

export function Donut({ value, max, size = 120, stroke = 14, color }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(pct * 100)} percent`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || "var(--plum)"} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - pct * c} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .6s ease" }} />
    </svg>
  );
}

export function BarChart({ data, valueKey = "value", labelKey = "label", color, height = 160 }) {
  const max = Math.max(1, ...data.map(d => d[valueKey]));
  return (
    <div className="tb-barchart" style={{ height }} role="img" aria-label={data.map(d => `${d[labelKey]}: ${Math.round(d[valueKey])}`).join(", ")}>
      {data.map((d, i) => (
        <div className="tb-bar-col" key={i}>
          <div className="tb-bar" style={{ height: (d[valueKey] / max * 100) + "%", background: d.color || color || "var(--plum)" }} title={`${d[labelKey]}: ${d[valueKey]}`} />
          <div className="tb-bar-label">{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

export function LineSpark({ points, width = 300, height = 80, color }) {
  if (!points.length) return null;
  const max = Math.max(...points, 1), min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = width / Math.max(1, points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color || "var(--plum)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
