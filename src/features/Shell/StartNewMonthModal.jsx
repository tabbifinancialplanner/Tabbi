import { useState } from "react";
import { Modal, Button, ProgressBar } from "../../components/ui/index.js";
import { fmtKES, budgetSummary, incomeTotal, expenseTotal } from "../../utils/calculations.js";
import { GROUPS } from "../../data/models.js";
import { getMonth, closeMonth, startNewMonth } from "../../data/store.js";
import { monthLabel } from "./Shell.jsx";

const CARRY_ITEMS = [
  ["recurringIncome", "Recurring income"],
  ["recurringBills", "Recurring bills"],
  ["savingsGoals", "Savings goals"],
  ["sinkingFunds", "Sinking funds"],
  ["debtPayments", "Debt payments"],
  ["insurancePremiums", "Insurance premiums"],
  ["investmentPlans", "Investment plans"],
  ["categories", "Budget categories"],
];

function Stat({ label, value }) {
  return <div><div className="tb-stat-label">{label}</div><div className="tb-stat-value">{value}</div></div>;
}

export default function StartNewMonthModal({ open, onClose, state, toast, onDone }) {
  const [step, setStep] = useState(1);
  const [carry, setCarry] = useState({
    recurringIncome: true, recurringBills: true, savingsGoals: true, sinkingFunds: true,
    debtPayments: true, insurancePremiums: true, investmentPlans: true, categories: true,
    carryUnspent: false, carryLeftover: false,
  });

  if (!open) return null;
  const month = getMonth(state.currentMonthId);
  const b = budgetSummary(state, month.id);
  const income = incomeTotal(state, month.id);
  const expense = expenseTotal(state, month.id);
  const savings = b.byGroup[GROUPS.SAVINGS].spent;
  const invested = b.byGroup[GROUPS.INVESTMENTS].spent;

  function next() { setStep(s => Math.min(6, s + 1)); }
  function back() { setStep(s => Math.max(1, s - 1)); }
  function toggle(key) { setCarry(c => ({ ...c, [key]: !c[key] })); }

  function confirm() {
    let ny = month.year, nm = month.month + 1;
    if (nm > 12) { nm = 1; ny += 1; }
    closeMonth(month.id, {});
    const newId = startNewMonth(ny, nm, carry);
    toast(monthLabel(getMonth(newId)) + " is ready. Let's get your money together. 👏🏾");
    onClose();
    if (onDone) onDone();
  }

  return (
    <Modal open={open} onClose={onClose} title={`${monthLabel(month)} is wrapped 🎉`} width={520}>
      <ProgressBar pct={(step / 6) * 100} height={5} />
      <div style={{ height: 16 }} />

      {step === 1 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>Review {monthLabel(month)}</h4>
          <div className="tb-grid tb-grid-2">
            <Stat label="Income" value={fmtKES(income)} />
            <Stat label="Spent" value={fmtKES(expense)} />
            <Stat label="Saved" value={fmtKES(savings)} />
            <Stat label="Invested" value={fmtKES(invested)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>Budget performance</h4>
          {b.categories.filter(c => c.planned > 0).map(c => (
            <div key={c.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}>
                <span>{c.name}</span><span>{fmtKES(c.spent)} / {fmtKES(c.planned)}</span>
              </div>
              <ProgressBar pct={c.pct} color={c.pct > 100 ? "var(--warn)" : "var(--sage)"} />
            </div>
          ))}
          {b.categories.filter(c => c.planned > 0).length === 0 && <p style={{ color: "var(--ink-soft)" }}>No budget was planned this month.</p>}
        </div>
      )}

      {step === 3 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>What should carry into next month?</h4>
          {CARRY_ITEMS.map(([key, label]) => (
            <label key={key} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
              <input type="checkbox" checked={carry[key]} onChange={() => toggle(key)} />{label}
            </label>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 10 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
              <input type="checkbox" checked={carry.carryUnspent} onChange={() => toggle("carryUnspent")} />Carry forward unspent budget
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
              <input type="checkbox" checked={carry.carryLeftover} onChange={() => toggle("carryLeftover")} />Carry forward leftover money
            </label>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>New month's budget</h4>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Your budget categories will carry forward with the same planned amounts. You can adjust every category from the Budget screen once the new month opens.</p>
        </div>
      )}

      {step === 5 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>Recurring payments</h4>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            {carry.recurringBills ? "Recurring bills will carry forward automatically." : "Recurring bills will not carry forward — you'll add them fresh next month."}
          </p>
        </div>
      )}

      {step === 6 && (
        <div>
          <h4 className="font-display" style={{ marginTop: 0 }}>Ready for next month?</h4>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>{monthLabel(month)}'s data stays exactly as it is — nothing gets erased. Confirm to open the new month.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {step > 1 && <Button variant="ghost" onClick={back}>Back</Button>}
        {step < 6 && <Button full onClick={next}>Continue</Button>}
        {step === 6 && <Button full onClick={confirm}>Confirm & start new month</Button>}
      </div>
    </Modal>
  );
}
