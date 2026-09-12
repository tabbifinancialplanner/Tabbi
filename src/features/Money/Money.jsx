import { useState } from "react";
import { Card, Button, Modal, Field, Input, Select, Tabs, EmptyState, IconButton, ConfirmDialog } from "../../components/ui/index.js";
import { fmtKES, fmtMoney, monthTxs } from "../../utils/calculations.js";
import { ACCOUNT_TYPES, CURRENCIES } from "../../data/models.js";
import { getMonth, addAccount, deleteAccount, deleteTransaction } from "../../data/store.js";

export default function Money({ state, toast }) {
  const [tab, setTab] = useState("transactions");
  const [accOpen, setAccOpen] = useState(false);
  const [acc, setAcc] = useState({ name: "", type: "M-Pesa", balance: "", institution: "", currency: state.settings.currency });
  const [delTx, setDelTx] = useState(null);
  const [delAcc, setDelAcc] = useState(null);

  const month = getMonth(state.currentMonthId);
  const txs = monthTxs(state, month.id).slice().sort((a, c) => c.date.localeCompare(a.date));

  function saveAccount() {
    if (!acc.name.trim()) return;
    addAccount(acc);
    setAccOpen(false);
    setAcc({ name: "", type: "M-Pesa", balance: "", institution: "", currency: state.settings.currency });
    toast("Account added.");
  }

  return (
    <div>
      <Tabs value={tab} onChange={setTab} items={[{ value: "transactions", label: "Transactions" }, { value: "accounts", label: "Accounts" }]} />
      <div style={{ height: 16 }} />

      {tab === "transactions" && (
        <Card>
          {txs.length === 0 ? (
            <EmptyState icon="💸" title="No money moves yet" body="Add your first transaction and let's see where your money goes." />
          ) : txs.map(t => {
            const cat = month.categories.find(c => c.id === t.categoryId);
            const account = state.accounts.find(a => a.id === t.accountId);
            return (
              <div className="tb-tx-row" key={t.id}>
                <div className="tb-tx-icon">{t.type === "income" ? "💰" : "🧾"}</div>
                <div className="tb-tx-main">
                  <div className="tb-tx-title">{cat ? cat.name : (t.type === "income" ? "Income" : "Uncategorized")}</div>
                  <div className="tb-tx-sub">{t.date} · {account ? account.name : "No account"}{t.note ? " · " + t.note : ""}</div>
                </div>
                <div className={"tb-tx-amount " + t.type}>{t.type === "income" ? "+" : "-"}{fmtKES(t.amount)}</div>
                <IconButton label="Delete transaction" onClick={() => setDelTx(t.id)}>🗑️</IconButton>
              </div>
            );
          })}
        </Card>
      )}

      {tab === "accounts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => setAccOpen(true)}>+ Add Account</Button>
          </div>
          {state.accounts.length === 0 ? (
            <Card><EmptyState icon="🏦" title="No accounts yet" body="Add M-Pesa, a bank account, SACCO, or cash to start tracking balances." action={<Button onClick={() => setAccOpen(true)}>+ Add Account</Button>} /></Card>
          ) : (
            <div className="tb-grid tb-grid-3">
              {state.accounts.map(a => (
                <Card key={a.id}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{a.type}{a.institution ? " · " + a.institution : ""}</div>
                    </div>
                    <IconButton label="Delete account" onClick={() => setDelAcc(a.id)}>🗑️</IconButton>
                  </div>
                  <div className="tb-stat-value" style={{ marginTop: 10 }}>{fmtMoney(a.balance, a.currency || state.settings.currency)}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={accOpen} onClose={() => setAccOpen(false)} title="Add account" width={380}>
        <Field label="Name"><Input value={acc.name} onChange={e => setAcc({ ...acc, name: e.target.value })} placeholder="e.g. My M-Pesa" /></Field>
        <Field label="Type">
          <Select value={acc.type} onChange={e => setAcc({ ...acc, type: e.target.value })}>
            {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Current balance"><Input type="number" value={acc.balance} onChange={e => setAcc({ ...acc, balance: e.target.value })} /></Field>
        <Field label="Currency">
          <Select value={acc.currency} onChange={e => setAcc({ ...acc, currency: e.target.value })}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </Select>
        </Field>
        <Field label="Institution (optional)"><Input value={acc.institution} onChange={e => setAcc({ ...acc, institution: e.target.value })} /></Field>
        <Button full onClick={saveAccount}>Save account</Button>
      </Modal>

      <ConfirmDialog open={!!delTx} onClose={() => setDelTx(null)} title="Delete transaction?" body="This will remove it from your budget and account balance." danger confirmLabel="Delete"
        onConfirm={() => { deleteTransaction(delTx); toast("Transaction deleted."); }} />
      <ConfirmDialog open={!!delAcc} onClose={() => setDelAcc(null)} title="Delete account?" body="Transactions linked to this account will remain, but it won't be listed anymore." danger confirmLabel="Delete"
        onConfirm={() => { deleteAccount(delAcc); toast("Account deleted."); }} />
    </div>
  );
}
