import { useState } from "react";
import { Card, ProgressBar, Badge, Button, Modal, Field, Input } from "../../components/ui/index.js";
import { fmtKES, challengeMilestones } from "../../utils/calculations.js";
import { CHALLENGE_DEFS, SAVE_1M_CHALLENGE_ID } from "../../data/models.js";
import { joinChallenge, contributeChallengeProgress, setChallengeMonthlyTarget } from "../../data/store.js";

const DEF = CHALLENGE_DEFS.find(c => c.id === SAVE_1M_CHALLENGE_ID);

export default function SaveOneMillionCard({ state, toast, compact }) {
  const joined = state.challenges.joined.find(c => c.challengeId === SAVE_1M_CHALLENGE_ID);
  const [contribOpen, setContribOpen] = useState(false);
  const [amt, setAmt] = useState("");
  const [targetOpen, setTargetOpen] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState((joined && joined.monthlyTarget) || "");

  const target = DEF.targetAmount;
  const saved = joined ? (joined.progress || 0) : 0;
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const milestones = challengeMilestones(target);
  const completed = joined && joined.completedAt;

  function join() { joinChallenge(SAVE_1M_CHALLENGE_ID); toast("Challenge joined — let's build that million 💎"); }
  function contribute() {
    contributeChallengeProgress(SAVE_1M_CHALLENGE_ID, Number(amt) || 0, target);
    setContribOpen(false); setAmt("");
    toast("Nice — added toward your million 💎");
  }
  function saveTarget() {
    setChallengeMonthlyTarget(SAVE_1M_CHALLENGE_ID, Number(monthlyTarget) || 0);
    setTargetOpen(false);
    toast("Contribution target saved.");
  }

  return (
    <Card style={{ marginBottom: compact ? 0 : 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <h3 className="font-display" style={{ margin: 0, fontSize: compact ? 17 : 20 }}>💎 Save Yourself First</h3>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "4px 0 0" }}>The {fmtKES(target)} milestone.</p>
        </div>
        {completed ? <Badge tone="good">Completed 🎉</Badge> : joined ? <Badge tone="info">In progress</Badge> : <Badge tone="neutral">Not joined</Badge>}
      </div>

      {!joined ? (
        <Button size="sm" onClick={join}>Join the challenge</Button>
      ) : (
        <div>
          {!compact && (
            <div className="tb-grid tb-grid-3" style={{ marginBottom: 12 }}>
              <div><div className="tb-stat-label">Target</div><div className="tb-stat-value" style={{ fontSize: 18 }}>{fmtKES(target)}</div></div>
              <div><div className="tb-stat-label">Saved</div><div className="tb-stat-value" style={{ fontSize: 18 }}>{fmtKES(saved)}</div></div>
              <div><div className="tb-stat-label">Remaining</div><div className="tb-stat-value" style={{ fontSize: 18 }}>{fmtKES(remaining)}</div></div>
            </div>
          )}
          <ProgressBar pct={pct} color={completed ? "var(--sage)" : "var(--plum)"} height={compact ? 8 : 10} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-soft)", margin: "8px 0 12px" }}>
            <span>{Math.round(pct)}% funded</span>
            {joined.monthlyTarget ? <span>{fmtKES(joined.monthlyTarget)}/mo target</span> : null}
          </div>
          {!compact && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {milestones.map(m => (
                <span key={m.pct} className={"tb-chip" + (saved >= m.amount ? " active" : "")}>{m.pct}% · {fmtKES(m.amount)}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button size="sm" onClick={() => setContribOpen(true)}>+ Add contribution</Button>
            {!compact && <Button size="sm" variant="ghost" onClick={() => setTargetOpen(true)}>Set contribution target</Button>}
          </div>
        </div>
      )}

      <Modal open={contribOpen} onClose={() => setContribOpen(false)} title="Add contribution" width={360}>
        <Field label={`Amount (${state.settings.currency})`}><Input type="number" value={amt} onChange={e => setAmt(e.target.value)} /></Field>
        <Button full onClick={contribute}>Add</Button>
      </Modal>

      <Modal open={targetOpen} onClose={() => setTargetOpen(false)} title="Monthly contribution target" width={360}>
        <Field label={`Amount (${state.settings.currency})`} hint="Tabbi uses this to estimate months remaining."><Input type="number" value={monthlyTarget} onChange={e => setMonthlyTarget(e.target.value)} /></Field>
        <Button full onClick={saveTarget}>Save target</Button>
      </Modal>
    </Card>
  );
}
