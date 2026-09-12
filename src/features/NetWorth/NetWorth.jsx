import { useState } from "react";
import { Card, Button, EmptyState, LineSpark } from "../../components/ui/index.js";
import { fmtKES, fmtMoney, netWorth } from "../../utils/calculations.js";
import { snapshotNetWorth } from "../../data/store.js";

export default function NetWorth({ state, toast }) {
  const nw = netWorth(state);
  const history = state.netWorthSnapshots;

  function takeSnapshot() {
    snapshotNetWorth(nw);
    toast("Net worth snapshot saved.");
  }

  const hasAssetsOrDebts = state.accounts.length || state.investments.length || state.debts.length;

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>Your assets minus what you owe.</p>

      {!hasAssetsOrDebts ? (
        <Card><EmptyState icon="🧮" title="No net worth data yet" body="Add accounts, investments, or debts and Tabbi will calculate your net worth automatically." /></Card>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="tb-stat-label">Net worth</div>
            <div className="tb-stat-value" style={{ fontSize: 34 }}>{fmtKES(nw.netWorth)}</div>
            <div className="tb-grid tb-grid-2" style={{ marginTop: 16 }}>
              <div><div className="tb-stat-label">Total assets</div><div className="tb-stat-value" style={{ fontSize: 20, color: "var(--sage)" }}>{fmtKES(nw.assets)}</div></div>
              <div><div className="tb-stat-label">Total liabilities</div><div className="tb-stat-value" style={{ fontSize: 20, color: "var(--warn)" }}>{fmtKES(nw.liabilities)}</div></div>
            </div>
            <Button size="sm" variant="ghost" onClick={takeSnapshot} style={{ marginTop: 16 }}>Save today's snapshot</Button>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>Assets</h3>
            {state.accounts.map(a => (
              <Row key={a.id} label={a.name} sub={a.type} value={fmtMoney(a.balance, a.currency || state.settings.currency)} />
            ))}
            {state.investments.map(i => (
              <Row key={i.id} label={i.name} sub={i.type} value={fmtKES(i.balance)} />
            ))}
            {state.accounts.length === 0 && state.investments.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>No assets added yet.</p>}
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>Liabilities</h3>
            {state.debts.map(d => <Row key={d.id} label={d.name} sub={d.type} value={fmtKES(d.balance)} negative />)}
            {state.debts.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>No liabilities added yet.</p>}
          </Card>

          <Card>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>Net worth over time</h3>
            {history.length < 2 ? (
              <EmptyState icon="📈" title="Not enough history yet" body="Save a few snapshots over time and Tabbi will chart your progress here." />
            ) : (
              <LineSpark points={history.map(h => h.netWorth)} width={520} height={100} color="var(--plum)" />
            )}
          </Card>
        </div>
      )}
    </div>
  );

  function Row({ label, sub, value, negative }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
        <div><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div><div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{sub}</div></div>
        <div style={{ fontWeight: 700, color: negative ? "var(--warn)" : "var(--ink)" }}>{value}</div>
      </div>
    );
  }
}
