import { useState } from "react";
import { Card, Button, Modal, Field, Input, Select, EmptyState, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES } from "../../utils/calculations.js";
import { INVESTMENT_TYPES } from "../../data/models.js";
import { addInvestment, deleteInvestment } from "../../data/store.js";

export default function Investments({ state, toast }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: INVESTMENT_TYPES[0], balance: "", institution: "", notes: "" });
  const [delId, setDelId] = useState(null);

  const total = state.investments.reduce((s, i) => s + i.balance, 0);

  function save() {
    if (!form.name.trim()) return;
    addInvestment(form);
    setAddOpen(false);
    setForm({ name: "", type: INVESTMENT_TYPES[0], balance: "", institution: "", notes: "" });
    toast("Investment added.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "var(--ink-soft)", margin: 0 }}>What am I growing?</p>
        <Button onClick={() => setAddOpen(true)}>+ Add Investment</Button>
      </div>

      {state.investments.length === 0 ? (
        <Card><EmptyState icon="📈" title="No investments tracked yet" body="Add your Money Market Fund, T-Bills, SACCO shares, pension, or any other holding to track balances here." action={<Button onClick={() => setAddOpen(true)}>+ Add Investment</Button>} /></Card>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="tb-stat-label">Total invested</div>
            <div className="tb-stat-value">{fmtKES(total)}</div>
          </Card>
          <div className="tb-grid tb-grid-3">
            {state.investments.map(i => (
              <Card key={i.id}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{i.type}{i.institution ? " · " + i.institution : ""}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setDelId(i.id)}>Delete</Button>
                </div>
                <div className="tb-stat-value" style={{ marginTop: 10 }}>{fmtKES(i.balance)}</div>
                {i.notes && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 6 }}>{i.notes}</div>}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add investment" width={400}>
        <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CIC Money Market Fund" /></Field>
        <Field label="Type">
          <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Current balance (KSh)"><Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} /></Field>
        <Field label="Institution / provider (optional)"><Input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} /></Field>
        <Field label="Notes (optional)"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        <Button full onClick={save}>Save investment</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete investment?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteInvestment(delId); toast("Investment deleted."); }} />
    </div>
  );
}
