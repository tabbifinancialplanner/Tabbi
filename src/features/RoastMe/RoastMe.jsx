import { useState } from "react";
import { Card, Button, Tabs } from "../../components/ui/index.js";
import { generateRoasts } from "../../utils/calculations.js";
import { getMonth, updateSettings } from "../../data/store.js";

const LEVELS = [{ value: "GENTLE", label: "Gentle" }, { value: "PLAYFUL", label: "Playful" }, { value: "BRUTAL", label: "Brutal" }];

export default function RoastMe({ state }) {
  const [level, setLevel] = useState((state.settings.roastLevel || "PLAYFUL").toUpperCase());
  const month = getMonth(state.currentMonthId);
  const roasts = generateRoasts(state, month.id, level);

  function setLevelAndSave(l) {
    setLevel(l);
    updateSettings({ roastLevel: l });
  }

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>Call me out 😂 — based on your actual spending this month.</p>
      <Tabs value={level} onChange={setLevelAndSave} items={LEVELS} />
      <div style={{ height: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {roasts.map((r, i) => (
          <Card key={i} style={{ background: level === "BRUTAL" ? "var(--blush)" : undefined }}>
            <p className="font-hand" style={{ fontSize: 22, margin: 0 }}>{r}</p>
          </Card>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 16 }}>
        Tabbi roasts spending behaviour, never your circumstances. If something here doesn't feel fair, tell us.
      </p>
    </div>
  );
}
