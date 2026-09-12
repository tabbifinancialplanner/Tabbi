import { Card, Badge, EmptyState } from "../../components/ui/index.js";
import { generateInsights } from "../../utils/calculations.js";
import { getMonth } from "../../data/store.js";
import { monthLabel } from "../Shell/Shell.jsx";

function toneFor(type) { return type === "warning" ? "warn" : type === "celebration" ? "good" : "info"; }
function iconFor(type) { return type === "warning" ? "⚠️" : type === "celebration" ? "🎉" : "🔔"; }

export default function Insights({ state }) {
  const month = getMonth(state.currentMonthId);
  const insights = generateInsights(state, month.id);

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>What is my money telling me? — {monthLabel(month)}</p>
      {insights.length === 0 ? (
        <Card><EmptyState icon="💡" title="Nothing to flag right now" body="Once you've got some budget and transaction history, Tabbi will surface useful observations here." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insights.map((ins, i) => (
            <Card key={i}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 20 }}>{iconFor(ins.type)}</div>
                <div style={{ flex: 1 }}>
                  <Badge tone={toneFor(ins.type)}>{ins.type}</Badge>
                  <p style={{ margin: "8px 0 0", fontSize: 14.5 }}>{ins.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
