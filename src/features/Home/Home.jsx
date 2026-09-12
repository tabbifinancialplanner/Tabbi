import { Card, ProgressBar, Badge, EmptyState, Button } from "../../components/ui/index.js";
import { fmtKES, budgetSummary, netWorth, generateInsights, monthTxs } from "../../utils/calculations.js";
import { getMonth } from "../../data/store.js";
import { monthLabel } from "../Shell/Shell.jsx";
import SaveOneMillionCard from "../Challenges/SaveOneMillion.jsx";

export default function Home({ state, setRoute, toast, onAddMoney, onStartNewMonth }) {
  const month = getMonth(state.currentMonthId);
  const b = budgetSummary(state, month.id);
  const income = b.income, spent = b.totalSpent, remaining = income - spent;
  const nw = netWorth(state);
  const insights = generateInsights(state, month.id);
  const recentTxs = monthTxs(state, month.id).slice().sort((a, c) => c.date.localeCompare(a.date)).slice(0, 5);

  const today = new Date();
  const isLastDay = today.getDate() === new Date(month.year, month.month, 0).getDate();
  const hasAnyData = state.accounts.length || state.transactions.length;

  function greeting() {
    const h = today.getHours();
    const base = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const name = state.settings.displayName && state.settings.displayName.trim();
    return name ? `${base}, ${name}` : base;
  }

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>{greeting()} 👋🏾 Here's {monthLabel(month)} so far.</p>

      {!hasAnyData && (
        <Card style={{ marginBottom: 20 }}>
          <EmptyState icon="👀" title="No money moves yet" body="Add your first transaction and let's see where your money goes."
            action={<Button onClick={onAddMoney}>+ Add Money</Button>} />
        </Card>
      )}

      <div className="tb-grid tb-grid-3" style={{ marginBottom: 20 }}>
        <Card><div className="tb-stat-label">Income this month</div><div className="tb-stat-value">{fmtKES(income)}</div></Card>
        <Card><div className="tb-stat-label">Spent so far</div><div className="tb-stat-value">{fmtKES(spent)}</div></Card>
        <Card><div className="tb-stat-label">Money remaining</div><div className="tb-stat-value" style={{ color: remaining < 0 ? "var(--warn)" : "var(--ink)" }}>{fmtKES(remaining)}</div></Card>
      </div>

      <div className="tb-grid tb-grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: 19 }}>Budget progress</h3>
              <a onClick={() => setRoute("budget")} style={{ cursor: "pointer", color: "var(--plum)", fontSize: 13.5, fontWeight: 600 }}>View budget →</a>
            </div>
            {b.categories.filter(c => c.planned > 0).length === 0 ? (
              <EmptyState icon="🧾" title="No budget planned yet" body="Set planned amounts for your categories to track progress here." />
            ) : b.categories.filter(c => c.planned > 0).slice(0, 4).map(c => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}>
                  <span>{c.name}</span><span>{fmtKES(c.spent)} / {fmtKES(c.planned)}</span>
                </div>
                <ProgressBar pct={c.pct} color={c.pct >= 100 ? "var(--warn)" : "var(--sage)"} />
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: 19 }}>Recent transactions</h3>
              <a onClick={() => setRoute("money")} style={{ cursor: "pointer", color: "var(--plum)", fontSize: 13.5, fontWeight: 600 }}>See all →</a>
            </div>
            {recentTxs.length === 0 ? (
              <EmptyState icon="💸" title="Nothing logged yet" body="Your transactions will show up here." />
            ) : recentTxs.map(t => {
              const cat = month.categories.find(c => c.id === t.categoryId);
              return (
                <div className="tb-tx-row" key={t.id}>
                  <div className="tb-tx-icon">{t.type === "income" ? "💰" : "🧾"}</div>
                  <div className="tb-tx-main">
                    <div className="tb-tx-title">{cat ? cat.name : (t.type === "income" ? "Income" : "Expense")}</div>
                    <div className="tb-tx-sub">{t.note || t.date}</div>
                  </div>
                  <div className={"tb-tx-amount " + t.type}>{t.type === "income" ? "+" : "-"}{fmtKES(t.amount)}</div>
                </div>
              );
            })}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>Net worth</h3>
            <div className="tb-stat-value" style={{ marginBottom: 6 }}>{fmtKES(nw.netWorth)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Assets {fmtKES(nw.assets)} · Liabilities {fmtKES(nw.liabilities)}</div>
            <a onClick={() => setRoute("networth")} style={{ cursor: "pointer", color: "var(--plum)", fontSize: 13.5, fontWeight: 600, display: "inline-block", marginTop: 10 }}>See details →</a>
          </Card>

          <Card>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>Insights</h3>
            {insights.length === 0 ? (
              <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Nothing to flag right now — you're on track.</p>
            ) : insights.slice(0, 3).map((ins, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 14 }}>
                <Badge tone={ins.type === "warning" ? "warn" : ins.type === "celebration" ? "good" : "info"}>{ins.type}</Badge>
                <div style={{ marginTop: 6 }}>{ins.text}</div>
              </div>
            ))}
            <a onClick={() => setRoute("insights")} style={{ cursor: "pointer", color: "var(--plum)", fontSize: 13.5, fontWeight: 600 }}>All insights →</a>
          </Card>

          <Card>
            <SaveOneMillionCard state={state} toast={toast} compact />
            <a onClick={() => setRoute("goals")} style={{ cursor: "pointer", color: "var(--plum)", fontSize: 13.5, fontWeight: 600, display: "inline-block", marginTop: 10 }}>Manage goal →</a>
          </Card>

          {isLastDay && (
            <Card style={{ background: "var(--blush)" }}>
              <h3 className="font-display" style={{ margin: "0 0 8px", fontSize: 18 }}>{monthLabel(month)} is wrapping up</h3>
              <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Ready to close it out and start next month?</p>
              <Button onClick={onStartNewMonth}>Start New Month</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
