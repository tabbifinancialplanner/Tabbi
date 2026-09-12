import { useState } from "react";
import { Card, Button, Modal, Field, Input, Select, Tabs, EmptyState, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES, debtPayoffPlan } from "../../utils/calculations.js";
import { DEBT_TYPES } from "../../data/models.js";
import { addDebt, deleteDebt, recordDebtPayment } from "../../data/store.js";

export default function Debt({ state, toast }) {
  const [tab, setTab] = useState("debts");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: DEBT_TYPES[0], balance: "", interestRate: "", minPayment: "", dueDate: "" });
  const [payFor, setPayFor] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [delId, setDelId] = useState(null);
  const [method, setMethod] = useState("avalanche");
  const [extra, setExtra] = useState("");

  const totalDebt = state.debts.reduce((s, d) => s + d.balance, 0);
  const plan = debtPayoffPlan(state.debts, Number(extra) || 0, method);

  function save() {
    if (!form.name.trim()) return;
    addDebt(form);
    setAddOpen(false);
    setForm({ name: "", type: DEBT_TYPES[0], balance: "", interestRate: "", minPayment: "", dueDate: "" });
    toast("Debt added.");
  }

  function pay() {
    recordDebtPayment(payFor, Number(payAmt) || 0);
    setPayFor(null);
    setPayAmt("");
    toast("Payment recorded 💪");
  }

  return (
    <div>
      <Tabs value={tab} onChange={setTab} items={[{ value: "debts", label: "Your debts" }, { value: "planner", label: "Payoff planner" }]} />
      <div style={{ height: 16 }} />

      {tab === "debts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: "var(--ink-soft)", margin: 0 }}>What am I paying off?</p>
            <Button onClick={() => setAddOpen(true)}>+ Add Debt</Button>
          </div>
          {state.debts.length === 0 ? (
            <Card><EmptyState icon="🪙" title="No debts tracked yet" body="Add loans, credit cards, or BNPL balances to plan your payoff." action={<Button onClick={() => setAddOpen(true)}>+ Add Debt</Button>} /></Card>
          ) : (
            <div>
              <Card style={{ marginBottom: 16 }}><div className="tb-stat-label">Total owed</div><div className="tb-stat-value">{fmtKES(totalDebt)}</div></Card>
              <div className="tb-grid tb-grid-2">
                {state.debts.map(d => (
                  <Card key={d.id}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{d.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{d.type} · {d.interestRate}% APR</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setDelId(d.id)}>Delete</Button>
                    </div>
                    <div className="tb-stat-value" style={{ marginTop: 10 }}>{fmtKES(d.balance)}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>Min payment {fmtKES(d.minPayment)}{d.dueDate ? ` · Due ${d.dueDate}` : ""}</div>
                    <Button size="sm" onClick={() => setPayFor(d.id)} style={{ marginTop: 10 }}>+ Record payment</Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "planner" && (
        <div>
          {state.debts.length === 0 ? (
            <Card><EmptyState icon="🧮" title="Add a debt first" body="Once you've added at least one debt, Tabbi can build a payoff plan." /></Card>
          ) : (
            <Card>
              <div className="tb-grid tb-grid-2" style={{ marginBottom: 16 }}>
                <Field label="Method">
                  <Select value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="avalanche">Avalanche — highest interest first</option>
                    <option value="snowball">Snowball — smallest balance first</option>
                  </Select>
                </Field>
                <Field label="Extra monthly payment (KSh)"><Input type="number" value={extra} onChange={e => setExtra(e.target.value)} /></Field>
              </div>
              <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
                At this pace, you'll be debt-free in about <strong>{plan.months} month{plan.months === 1 ? "" : "s"}</strong>,
                paying roughly <strong>{fmtKES(plan.totalInterest)}</strong> in interest along the way.
              </p>
              <h4 className="font-display" style={{ marginBottom: 10 }}>Payoff order</h4>
              {plan.milestones.map((m, i) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < plan.milestones.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span>{i + 1}. {m.name}</span>
                  <span style={{ color: "var(--ink-soft)" }}>Paid off around month {m.month}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add debt" width={400}>
        <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. KCB Personal Loan" /></Field>
        <Field label="Type">
          <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Current balance (KSh)"><Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} /></Field>
        <Field label="Interest rate (% APR)"><Input type="number" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} /></Field>
        <Field label="Minimum payment (KSh)"><Input type="number" value={form.minPayment} onChange={e => setForm({ ...form, minPayment: e.target.value })} /></Field>
        <Field label="Due date (optional)"><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Field>
        <Button full onClick={save}>Save debt</Button>
      </Modal>

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title="Record payment" width={360}>
        <Field label="Amount (KSh)"><Input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} /></Field>
        <Button full onClick={pay}>Record payment</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete debt?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteDebt(delId); toast("Debt deleted."); }} />
    </div>
  );
}
