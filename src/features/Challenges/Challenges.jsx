import { useState } from "react";
import { Card, Button, ProgressBar, Badge, Modal, Field, Input, Select, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES, challengeProgress, challengeMilestones } from "../../utils/calculations.js";
import { CHALLENGE_DEFS, SAVE_1M_CHALLENGE_ID } from "../../data/models.js";
import { joinChallenge, leaveChallenge, updateChallengeProgress, contributeChallengeProgress, addCustomChallenge, deleteCustomChallenge } from "../../data/store.js";
import SaveOneMillionCard from "./SaveOneMillion.jsx";

export default function Challenges({ state, toast }) {
  const joined = state.challenges.joined;
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🎯", trackingType: "days", days: "", targetAmount: "", deadline: "" });
  const [contribFor, setContribFor] = useState(null);
  const [contribAmt, setContribAmt] = useState("");
  const [delId, setDelId] = useState(null);

  const otherDefs = CHALLENGE_DEFS.filter(d => d.id !== SAVE_1M_CHALLENGE_ID);
  const allChallenges = [...otherDefs, ...state.challenges.custom];

  function isJoined(id) { return joined.find(c => c.challengeId === id); }

  function join(def) {
    joinChallenge(def.id);
    toast(`Joined "${def.title}" — let's go! 🔥`);
  }

  function bumpProgress(def) {
    const jc = isJoined(def.id);
    const next = Math.min(def.days, (jc.progress || 0) + 1);
    updateChallengeProgress(def.id, next, def.days);
    if (next >= def.days) toast(`You just completed "${def.title}" 🎉`);
    else toast(`${next} day${next === 1 ? "" : "s"} tracked 🔥`);
  }

  function contribute() {
    const def = allChallenges.find(d => d.id === contribFor);
    contributeChallengeProgress(contribFor, Number(contribAmt) || 0, def.targetAmount);
    setContribFor(null);
    setContribAmt("");
    toast("Contribution added 🎉");
  }

  function saveCustomChallenge() {
    if (!form.name.trim()) return;
    let days = null, targetAmount = null;
    if (form.trackingType === "days") {
      days = form.deadline ? Math.max(1, Math.ceil((new Date(form.deadline) - new Date()) / 86400000)) : (Number(form.days) || 7);
    } else {
      targetAmount = Number(form.targetAmount) || 0;
    }
    addCustomChallenge({ title: form.name.trim(), icon: form.icon || "🎯", trackingType: form.trackingType, days, targetAmount, deadline: form.deadline || null });
    setCreateOpen(false);
    setForm({ name: "", icon: "🎯", trackingType: "days", days: "", targetAmount: "", deadline: "" });
    toast("Challenge created — join it whenever you're ready.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <p style={{ color: "var(--ink-soft)", margin: 0 }}>Small money habits, made fun.</p>
        <Button onClick={() => setCreateOpen(true)}>+ Create Challenge</Button>
      </div>

      <SaveOneMillionCard state={state} toast={toast} />

      <div className="tb-grid tb-grid-3">
        {allChallenges.map(def => {
          const jc = isJoined(def.id);
          const isAmount = def.trackingType === "amount";
          const prog = challengeProgress(def, jc);
          const completed = jc && jc.completedAt;
          return (
            <Card key={def.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{def.icon}</div>
                {def.custom && <Button size="sm" variant="ghost" onClick={() => setDelId(def.id)}>Delete</Button>}
              </div>
              <h3 className="font-display" style={{ margin: "0 0 4px", fontSize: 17 }}>{def.title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 12px" }}>{def.description}</p>
              {jc ? (
                <div>
                  <ProgressBar pct={prog.pct} color={completed ? "var(--sage)" : "var(--plum)"} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-soft)", margin: "8px 0 12px" }}>
                    <span>{isAmount ? `${fmtKES(prog.saved)} / ${fmtKES(prog.target)}` : `${prog.progress} / ${prog.target} days`}</span>
                    {completed ? <Badge tone="good">Completed 🎉</Badge> : <Badge tone="neutral">In progress</Badge>}
                  </div>
                  {isAmount && !completed && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {challengeMilestones(def.targetAmount).map(m => (
                        <span key={m.pct} className={"tb-chip" + (prog.saved >= m.amount ? " active" : "")}>{m.pct}%</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {!completed && isAmount && <Button size="sm" onClick={() => setContribFor(def.id)}>+ Contribute</Button>}
                    {!completed && !isAmount && <Button size="sm" onClick={() => bumpProgress(def)}>Log today</Button>}
                    <Button size="sm" variant="ghost" onClick={() => { leaveChallenge(def.id); toast("Left the challenge."); }}>Leave</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" onClick={() => join(def)}>Join challenge</Button>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create your own challenge" width={420}>
        <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. No Boda Boda Month" /></Field>
        <Field label="Icon (emoji, optional)"><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength={2} /></Field>
        <Field label="Tracking type">
          <Select value={form.trackingType} onChange={e => setForm({ ...form, trackingType: e.target.value })}>
            <option value="days">Day streak — log progress daily</option>
            <option value="amount">Save an amount — track contributions</option>
          </Select>
        </Field>
        {form.trackingType === "days" ? (
          <div>
            <Field label="Duration (days)" hint="Or set a deadline below instead"><Input type="number" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} placeholder="7" /></Field>
            <Field label="Deadline (optional)"><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></Field>
          </div>
        ) : (
          <Field label={`Target amount (${state.settings.currency})`}><Input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} /></Field>
        )}
        <Button full onClick={saveCustomChallenge}>Create challenge</Button>
      </Modal>

      <Modal open={!!contribFor} onClose={() => setContribFor(null)} title="Add contribution" width={360}>
        <Field label={`Amount (${state.settings.currency})`}><Input type="number" value={contribAmt} onChange={e => setContribAmt(e.target.value)} /></Field>
        <Button full onClick={contribute}>Add</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete this challenge?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteCustomChallenge(delId); toast("Challenge deleted."); }} />
    </div>
  );
}
