import { useState } from "react";
import { Card, Button, Field, Input, Select, ConfirmDialog } from "../../components/ui/index.js";
import { updateSettings, updateNotificationSettings, resetAllData } from "../../data/store.js";
import { CURRENCIES } from "../../data/models.js";

const PERSONALITIES = ["Supportive", "Playful", "Direct", "Roast Me"];
const NOTIF_LABELS = {
  upcomingBill: "Upcoming bill", goalMilestone: "Goal milestone", challengeProgress: "Challenge progress",
  budgetWarning: "Budget warning", newMonth: "New month", recurringPayment: "Recurring payment", sinkingFundDeadline: "Sinking fund deadline",
};

function Section({ title, children, hint }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <h3 className="font-display" style={{ margin: "0 0 4px", fontSize: 18 }}>{title}</h3>
      {hint && <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "0 0 14px" }}>{hint}</p>}
      {children}
    </Card>
  );
}

export default function Settings({ state, toast, onToggleTheme }) {
  const s = state.settings;
  const [resetOpen, setResetOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(s.displayName || "");

  function saveName() {
    updateSettings({ displayName: nameDraft.trim() });
    toast("Name updated.");
  }

  return (
    <div>
      <Section title="Profile" hint="What Tabbi calls you around the app.">
        <Field label="Preferred name / nickname">
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={nameDraft} onChange={e => setNameDraft(e.target.value)} placeholder="e.g. Waceke" />
            <Button onClick={saveName} disabled={nameDraft.trim() === (s.displayName || "")}>Save</Button>
          </div>
        </Field>
      </Section>

      <Section title="Personality" hint="How Tabbi talks to you.">
        <Field label="Tabbi's tone">
          <Select value={s.personality} onChange={e => { updateSettings({ personality: e.target.value }); toast("Personality updated."); }}>
            {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>
      </Section>

      <Section title="Theme">
        <Button variant="secondary" onClick={onToggleTheme}>Switch to {s.theme === "dark" ? "light" : "dark"} mode</Button>
      </Section>

      <Section title="Currency">
        <Field label="Primary currency" hint="Used across your budget, goals, and totals.">
          <Select value={s.currency} onChange={e => { updateSettings({ currency: e.target.value }); toast("Currency updated."); }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </Select>
        </Field>
      </Section>

      <Section title="Notifications" hint="Choose what Tabbi should nudge you about.">
        {Object.entries(NOTIF_LABELS).map(([key, label]) => (
          <label key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <span>{label}</span>
            <input type="checkbox" checked={!!s.notifications[key]} onChange={e => updateNotificationSettings({ [key]: e.target.checked })} />
          </label>
        ))}
      </Section>

      <Section title="Privacy" hint="Tabbi keeps your data on this device. We don't claim bank-level security — just sensible, honest protections.">
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
          <span>PIN protection</span>
          <input type="checkbox" checked={s.pinEnabled} onChange={e => updateSettings({ pinEnabled: e.target.checked })} />
        </label>
        {s.pinEnabled && (
          <Field label="4-digit PIN">
            <Input type="password" maxLength={4} value={s.pin || ""} onChange={e => updateSettings({ pin: e.target.value })} />
          </Field>
        )}
      </Section>

      <Section title="Data management">
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>This clears every account, transaction, goal, and note on this device. It cannot be undone.</p>
        <Button variant="danger" onClick={() => setResetOpen(true)}>Reset all data</Button>
      </Section>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} title="Reset all data?" danger confirmLabel="Reset everything"
        body="This permanently deletes all Tabbi data stored on this device."
        onConfirm={() => { resetAllData(); toast("All data has been reset."); }} />
    </div>
  );
}
