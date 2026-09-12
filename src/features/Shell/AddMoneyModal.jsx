import { useState, useEffect } from "react";
import { Modal, Button, Field, Input, Select } from "../../components/ui/index.js";
import { parseQuickEntry } from "../../utils/quickEntry.js";
import { getCurrentMonth, addTransaction } from "../../data/store.js";

export default function AddMoneyModal({ open, onClose, state, toast }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [step, setStep] = useState("chat");

  useEffect(() => { if (open) { setText(""); setParsed(null); setStep("chat"); } }, [open]);

  const month = getCurrentMonth();

  function handleParse() {
    if (!text.trim()) return;
    setParsed(parseQuickEntry(text, state));
    setStep("review");
  }

  function handleSave() {
    if (!parsed || !parsed.amount) { toast("Add an amount before saving."); return; }
    addTransaction(parsed);
    toast(parsed.type === "income" ? "Income added 🎉" : "Got it — logged that expense.");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="What happened?" width={460}>
      {step === "chat" && (
        <div>
          <p style={{ color: "var(--ink-soft)", marginTop: 0, fontSize: 14.5 }}>Tell me what happened with your money, in your own words.</p>
          <Input autoFocus placeholder="e.g. I spent 850 on lunch" value={text}
            onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleParse(); }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
            {["I spent 500 on lunch", "Got paid 45000 salary", "Paid 1200 for uber"].map(ex => (
              <button key={ex} className="tb-chip" onClick={() => setText(ex)}>{ex}</button>
            ))}
          </div>
          <Button full onClick={handleParse} disabled={!text.trim()}>Continue</Button>
        </div>
      )}
      {step === "review" && parsed && (
        <div>
          <p style={{ color: "var(--ink-soft)", marginTop: 0, fontSize: 13.5 }}>Here's what I picked up — edit anything before saving.</p>
          <Field label="Type">
            <Select value={parsed.type} onChange={e => setParsed({ ...parsed, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </Field>
          <Field label="Amount (KSh)">
            <Input type="number" value={parsed.amount ?? ""} onChange={e => setParsed({ ...parsed, amount: Number(e.target.value) })} />
          </Field>
          {parsed.type === "expense" && (
            <Field label="Category">
              <Select value={parsed.categoryId || ""} onChange={e => setParsed({ ...parsed, categoryId: e.target.value })}>
                <option value="">Uncategorized</option>
                {month.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Account">
            <Select value={parsed.accountId || ""} onChange={e => setParsed({ ...parsed, accountId: e.target.value })}>
              <option value="">No account</option>
              {state.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={parsed.date} onChange={e => setParsed({ ...parsed, date: e.target.value })} />
          </Field>
          <Field label="Note">
            <Input value={parsed.note} onChange={e => setParsed({ ...parsed, note: e.target.value })} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep("chat")}>Back</Button>
            <Button full onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
