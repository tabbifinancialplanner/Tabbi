import { useState } from "react";
import { Button, Field, Input, Select } from "../../components/ui/index.js";
import { CURRENCIES } from "../../data/models.js";
import { setOnboarded, updateSettings } from "../../data/store.js";

export default function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("KES");

  function start() {
    updateSettings({ displayName: name.trim(), currency });
    setOnboarded(true);
    onDone();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div className="tb-brand" style={{ fontSize: 40, justifyContent: "center" }}>Tabbi</div>
        <h1 className="font-display" style={{ fontSize: 28, margin: "8px 0 10px" }}>Let's get your money together 👏🏾</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 24 }}>
          Plan where your money should go, track what actually happens, and build a healthier relationship with money.
        </p>
        <div style={{ textAlign: "left" }}>
          <Field label="What should I call you?" hint="Your name or nickname — Tabbi will use it to greet you.">
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Waceke" onKeyDown={e => { if (e.key === "Enter" && name.trim()) start(); }} />
          </Field>
          <Field label="Primary currency" hint="You can change this later in Settings.">
            <Select value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </Select>
          </Field>
        </div>
        <Button size="lg" full onClick={start} disabled={!name.trim()} style={{ marginTop: 8 }}>Get started</Button>
      </div>
    </div>
  );
}
