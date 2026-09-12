import { Card } from "../../components/ui/index.js";

const ITEMS = [
  { key: "settings", label: "Settings", em: "⚙️", body: "Profile, currency, theme, personality, notifications, privacy." },
  { key: "history", label: "Money History", em: "🗓️", body: "Every past month, preserved exactly as it happened." },
  { key: "annual", label: "Annual View", em: "📊", body: "Your bigger financial picture for the year." },
  { key: "help", label: "How Tabbi works", em: "❓", body: "Quick explanations for every part of the app." },
];

export default function More({ setRoute }) {
  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>Everything else, in one place.</p>
      <div className="tb-grid tb-grid-2">
        {ITEMS.map(it => (
          <Card key={it.key} onClick={() => setRoute(it.key)} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{it.em}</div>
            <h3 className="font-display" style={{ margin: "0 0 4px", fontSize: 18 }}>{it.label}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: 0 }}>{it.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
