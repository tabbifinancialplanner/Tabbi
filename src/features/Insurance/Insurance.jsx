import { useState } from "react";
import { Card, ProgressBar, Badge, Button, Modal, Field, Input, Select, EmptyState, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES, insuranceProgress } from "../../utils/calculations.js";
import { INSURANCE_TYPES } from "../../data/models.js";
import { addInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy } from "../../data/store.js";

function insuranceStatusBadge(status) {
  if (status === "complete") return <Badge tone="good">Fully saved</Badge>;
  if (status === "behind") return <Badge tone="warn">Behind</Badge>;
  return <Badge tone="info">On track</Badge>;
}

export default function Insurance({ state, toast }) {
  const policies = state.insurancePolicies;
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ type: INSURANCE_TYPES[0], provider: "", premiumAmount: "", frequency: "Monthly", nextDueDate: "", savedAmount: "" });
  const [contribFor, setContribFor] = useState(null);
  const [contribAmt, setContribAmt] = useState("");
  const [delId, setDelId] = useState(null);

  function save() {
    addInsurancePolicy(form);
    setAddOpen(false);
    setForm({ type: INSURANCE_TYPES[0], provider: "", premiumAmount: "", frequency: "Monthly", nextDueDate: "", savedAmount: "" });
    toast("Policy added.");
  }

  function contribute() {
    const p = policies.find(x => x.id === contribFor);
    updateInsurancePolicy(contribFor, { savedAmount: (p.savedAmount || 0) + (Number(contribAmt) || 0) });
    setContribFor(null);
    setContribAmt("");
    toast("Added toward your premium.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "var(--ink-soft)", margin: 0 }}>What am I protecting?</p>
        <Button onClick={() => setAddOpen(true)}>+ Add Policy</Button>
      </div>

      {policies.length === 0 ? (
        <Card><EmptyState icon="🛡️" title="No insurance policies yet" body="Track premiums for life, medical, motor, or any policy — and plan the savings to cover them." action={<Button onClick={() => setAddOpen(true)}>+ Add Policy</Button>} /></Card>
      ) : (
        <div className="tb-grid tb-grid-2">
          {policies.map(p => {
            const prog = insuranceProgress(p);
            return (
              <Card key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.type}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{p.provider || "No provider set"} · {p.frequency}</div>
                  </div>
                  {insuranceStatusBadge(prog.status)}
                </div>
                <div style={{ margin: "12px 0 6px", fontSize: 13.5 }}>{fmtKES(p.savedAmount)} of {fmtKES(p.premiumAmount)}</div>
                <ProgressBar pct={prog.pct} color={prog.status === "complete" ? "var(--sage)" : "var(--plum)"} />
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>
                  {p.nextDueDate ? `Due ${p.nextDueDate}` : "No due date set"}
                  {prog.requiredMonthly != null && prog.status !== "complete" ? ` · Need ${fmtKES(prog.requiredMonthly)}/mo` : ""}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button size="sm" onClick={() => setContribFor(p.id)}>+ Contribute</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDelId(p.id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add insurance policy" width={400}>
        <Field label="Insurance type">
          <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {INSURANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Provider (optional)"><Input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} /></Field>
        <Field label="Premium amount (KSh)"><Input type="number" value={form.premiumAmount} onChange={e => setForm({ ...form, premiumAmount: e.target.value })} /></Field>
        <Field label="Payment frequency">
          <Select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
            <option>Monthly</option><option>Quarterly</option><option>Annually</option>
          </Select>
        </Field>
        <Field label="Next due date"><Input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} /></Field>
        <Field label="Amount already saved (KSh)"><Input type="number" value={form.savedAmount} onChange={e => setForm({ ...form, savedAmount: e.target.value })} /></Field>
        <Button full onClick={save}>Save policy</Button>
      </Modal>

      <Modal open={!!contribFor} onClose={() => setContribFor(null)} title="Add contribution" width={360}>
        <Field label="Amount (KSh)"><Input type="number" value={contribAmt} onChange={e => setContribAmt(e.target.value)} /></Field>
        <Button full onClick={contribute}>Add</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete policy?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteInsurancePolicy(delId); toast("Policy deleted."); }} />
    </div>
  );
}
