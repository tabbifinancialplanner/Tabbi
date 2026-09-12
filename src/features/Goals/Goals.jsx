import { useState } from "react";
import { Card, ProgressBar, Badge, Button, Modal, Field, Input, Select, Tabs, EmptyState, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES, emergencyFundProgress, sinkingFundProgress } from "../../utils/calculations.js";
import { SINKING_FUND_TEMPLATES } from "../../data/models.js";
import { setEmergencyFund, contributeEmergencyFund, addSinkingFund, contributeSinkingFund, deleteSinkingFund } from "../../data/store.js";
import SaveOneMillionCard from "../Challenges/SaveOneMillion.jsx";

function statusBadge(status) {
  if (status === "complete") return <Badge tone="good">Complete</Badge>;
  if (status === "behind") return <Badge tone="warn">Behind</Badge>;
  if (status === "no-plan") return <Badge tone="neutral">No plan yet</Badge>;
  return <Badge tone="info">On track</Badge>;
}

function EmergencyFundCard({ state, toast }) {
  const ef = state.goals.emergencyFund;
  const [setupOpen, setSetupOpen] = useState(false);
  const [form, setForm] = useState(ef || { targetMonths: 6, essentialMonthlyExpenses: "", savedAmount: "", monthlyContribution: "" });
  const [contribOpen, setContribOpen] = useState(false);
  const [contribAmt, setContribAmt] = useState("");

  const progress = ef ? emergencyFundProgress(ef) : null;

  function save() {
    setEmergencyFund({
      targetMonths: Number(form.targetMonths) || 6,
      essentialMonthlyExpenses: Number(form.essentialMonthlyExpenses) || 0,
      savedAmount: Number(form.savedAmount) || 0,
      monthlyContribution: Number(form.monthlyContribution) || 0,
    });
    setSetupOpen(false);
    toast("Emergency fund plan saved.");
  }

  function contribute() {
    contributeEmergencyFund(Number(contribAmt) || 0);
    setContribOpen(false);
    setContribAmt("");
    toast("Nice — added to your emergency fund 🎉");
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Emergency Fund</h3>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>Your safety net for the unexpected.</p>
        </div>
        {progress && statusBadge(progress.status)}
      </div>

      {!ef ? (
        <EmptyState icon="🛟" title="Set up your emergency fund" body="Tell Tabbi your essential monthly expenses and how many months you want covered."
          action={<Button onClick={() => setSetupOpen(true)}>Set up emergency fund</Button>} />
      ) : (
        <div>
          <div className="tb-grid tb-grid-3" style={{ marginBottom: 14 }}>
            <div><div className="tb-stat-label">Target</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(progress.target)}</div></div>
            <div><div className="tb-stat-label">Saved</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(progress.saved)}</div></div>
            <div><div className="tb-stat-label">Remaining</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(progress.remaining)}</div></div>
          </div>
          <ProgressBar pct={progress.pct} color={progress.status === "complete" ? "var(--sage)" : "var(--plum)"} height={10} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", marginTop: 8 }}>
            <span>{Math.round(progress.pct)}% funded</span>
            <span>{progress.monthsToGo != null ? `${progress.monthsToGo} months to go` : "No monthly contribution set"}</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Button variant="ghost" onClick={() => { setForm(ef); setSetupOpen(true); }}>Edit plan</Button>
            <Button onClick={() => setContribOpen(true)}>+ Add contribution</Button>
          </div>
        </div>
      )}

      <Modal open={setupOpen} onClose={() => setSetupOpen(false)} title="Emergency fund plan" width={400}>
        <Field label="Target months of cover">
          <Select value={form.targetMonths} onChange={e => setForm({ ...form, targetMonths: e.target.value })}>
            {[3, 6, 9, 12].map(m => <option key={m} value={m}>{m} months</option>)}
          </Select>
        </Field>
        <Field label="Essential monthly expenses (KSh)"><Input type="number" value={form.essentialMonthlyExpenses} onChange={e => setForm({ ...form, essentialMonthlyExpenses: e.target.value })} /></Field>
        <Field label="Current emergency savings (KSh)"><Input type="number" value={form.savedAmount} onChange={e => setForm({ ...form, savedAmount: e.target.value })} /></Field>
        <Field label="Monthly contribution (KSh)"><Input type="number" value={form.monthlyContribution} onChange={e => setForm({ ...form, monthlyContribution: e.target.value })} /></Field>
        <Button full onClick={save}>Save plan</Button>
      </Modal>

      <Modal open={contribOpen} onClose={() => setContribOpen(false)} title="Add contribution" width={360}>
        <Field label="Amount (KSh)"><Input type="number" value={contribAmt} onChange={e => setContribAmt(e.target.value)} /></Field>
        <Button full onClick={contribute}>Add</Button>
      </Modal>
    </Card>
  );
}

function SinkingFundsSection({ state, toast }) {
  const funds = state.goals.sinkingFunds;
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", targetAmount: "", dueDate: "", savedAmount: "", frequency: "Monthly" });
  const [contribFor, setContribFor] = useState(null);
  const [contribAmt, setContribAmt] = useState("");
  const [delId, setDelId] = useState(null);

  function save() {
    if (!form.name.trim()) return;
    addSinkingFund(form);
    setAddOpen(false);
    setForm({ name: "", targetAmount: "", dueDate: "", savedAmount: "", frequency: "Monthly" });
    toast("Sinking fund created.");
  }

  function contribute() {
    contributeSinkingFund(contribFor, Number(contribAmt) || 0);
    setContribFor(null);
    setContribAmt("");
    toast("Contribution added 🎉");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Sinking Funds</h3>
        <Button onClick={() => setAddOpen(true)}>+ Add Goal</Button>
      </div>

      {funds.length === 0 ? (
        <Card><EmptyState icon="🎯" title="No sinking funds yet" body="Tell Tabbi what you're saving for and we'll calculate what you need." action={<Button onClick={() => setAddOpen(true)}>+ Add Goal</Button>} /></Card>
      ) : (
        <div className="tb-grid tb-grid-2">
          {funds.map(f => {
            const p = sinkingFundProgress(f);
            return (
              <Card key={f.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{f.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{f.dueDate ? `Due ${f.dueDate}` : "No due date"} · {f.frequency}</div>
                  </div>
                  {statusBadge(p.status)}
                </div>
                <div style={{ margin: "12px 0 6px", fontSize: 13.5 }}>{fmtKES(f.savedAmount)} of {fmtKES(f.targetAmount)}</div>
                <ProgressBar pct={p.pct} color={p.status === "complete" ? "var(--sage)" : "var(--plum)"} />
                {p.requiredContribution != null && p.status !== "complete" && (
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>
                    Need {fmtKES(p.requiredContribution)} per {f.frequency === "Weekly" ? "week" : "month"} to stay on track.
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button size="sm" onClick={() => setContribFor(f.id)}>+ Contribute</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDelId(f.id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New sinking fund" width={400}>
        <Field label="Goal name" hint="Pick a template or type your own">
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} list="sinking-templates" placeholder="e.g. Christmas" />
          <datalist id="sinking-templates">{SINKING_FUND_TEMPLATES.map(t => <option key={t} value={t} />)}</datalist>
        </Field>
        <Field label="Target amount (KSh)"><Input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} /></Field>
        <Field label="Due date"><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Field>
        <Field label="Amount already saved (KSh)"><Input type="number" value={form.savedAmount} onChange={e => setForm({ ...form, savedAmount: e.target.value })} /></Field>
        <Field label="Contribution frequency">
          <Select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
            <option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>
          </Select>
        </Field>
        <Button full onClick={save}>Create sinking fund</Button>
      </Modal>

      <Modal open={!!contribFor} onClose={() => setContribFor(null)} title="Add contribution" width={360}>
        <Field label="Amount (KSh)"><Input type="number" value={contribAmt} onChange={e => setContribAmt(e.target.value)} /></Field>
        <Button full onClick={contribute}>Add</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete sinking fund?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteSinkingFund(delId); toast("Sinking fund deleted."); }} />
    </div>
  );
}

export default function Goals({ state, toast }) {
  return (
    <div>
      <SaveOneMillionCard state={state} toast={toast} />
      <EmergencyFundCard state={state} toast={toast} />
      <SinkingFundsSection state={state} toast={toast} />
    </div>
  );
}
