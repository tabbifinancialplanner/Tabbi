import { useState } from "react";
import { Card, Tabs, Select, EmptyState, ProgressBar, BarChart } from "../../components/ui/index.js";
import { fmtKES, budgetSummary, incomeTotal, expenseTotal, annualSummary, annualInsights, categoryBreakdownForYear } from "../../utils/calculations.js";
import { monthLabel } from "../Shell/Shell.jsx";

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MoneyHistory({ state }) {
  const [openId, setOpenId] = useState(null);
  const months = Object.values(state.months).sort((a, b) => (b.year - a.year) || (b.month - a.month));
  const byYear = {};
  months.forEach(m => { (byYear[m.year] = byYear[m.year] || []).push(m); });

  if (months.length === 0) return <Card><EmptyState icon="🗓️" title="No history yet" body="Once you close a month, it'll show up here." /></Card>;

  return (
    <div>
      {Object.keys(byYear).sort((a, b) => b - a).map(year => (
        <Card key={year} style={{ marginBottom: 16 }}>
          <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 19 }}>{year}</h3>
          <div className="tb-grid tb-grid-3">
            {byYear[year].map(m => {
              const b = budgetSummary(state, m.id);
              const open = openId === m.id;
              return (
                <div key={m.id}>
                  <button onClick={() => setOpenId(open ? null : m.id)} className="tb-chip" style={{ width: "100%", justifyContent: "space-between" }}>
                    <span>{monthLabel(m)}</span><span>{m.status === "CLOSED" ? "🔒" : "●"}</span>
                  </button>
                  {open && (
                    <div style={{ padding: 12, fontSize: 13.5, color: "var(--ink-soft)" }}>
                      <div>Income: {fmtKES(incomeTotal(state, m.id))}</div>
                      <div>Spent: {fmtKES(expenseTotal(state, m.id))}</div>
                      <div>Planned: {fmtKES(b.totalPlanned)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnnualView({ state }) {
  const years = [...new Set(Object.values(state.months).map(m => m.year))].sort((a, b) => b - a);
  const [year, setYear] = useState(years[0] || new Date().getFullYear());
  const [view, setView] = useState("year");
  const summary = annualSummary(state, year);
  const insights = annualInsights(state, year);
  const catBreakdown = categoryBreakdownForYear(state, year);
  const hasData = summary.totals.income > 0 || summary.totals.expense > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Select value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 140 }}>
          {years.length ? years.map(y => <option key={y} value={y}>{y}</option>) : <option value={year}>{year}</option>}
        </Select>
        <Tabs value={view} onChange={setView} items={[{ value: "year", label: "Year" }, { value: "category", label: "Category" }, { value: "month", label: "Month" }]} />
      </div>

      {!hasData ? (
        <Card><EmptyState icon="📊" title={`No data for ${year} yet`} body="Once you log income and expenses this year, your annual picture builds automatically." /></Card>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 className="font-display" style={{ margin: "0 0 12px", fontSize: 20 }}>{year} Money Year</h3>
            <div className="tb-grid tb-grid-4">
              <div><div className="tb-stat-label">Total income</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(summary.totals.income)}</div></div>
              <div><div className="tb-stat-label">Total spending</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(summary.totals.expense)}</div></div>
              <div><div className="tb-stat-label">Total saved</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(summary.totals.savings)}</div></div>
              <div><div className="tb-stat-label">Total invested</div><div className="tb-stat-value" style={{ fontSize: 20 }}>{fmtKES(summary.totals.invested)}</div></div>
            </div>
          </Card>

          {view === "year" && (
            <Card style={{ marginBottom: 16 }}>
              <h4 className="font-display" style={{ marginTop: 0 }}>Monthly trends</h4>
              <BarChart data={summary.perMonth.map(m => ({ label: MONTH_ABBR[m.month - 1], value: m.income }))} color="var(--sage)" />
              <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 8 }}>Income by month</p>
            </Card>
          )}

          {view === "category" && (
            <Card style={{ marginBottom: 16 }}>
              <h4 className="font-display" style={{ marginTop: 0 }}>Annual category breakdown</h4>
              {catBreakdown.map(c => (
                <div key={c.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}><span>{c.name}</span><span>{fmtKES(c.value)}</span></div>
                  <ProgressBar pct={catBreakdown[0].value > 0 ? (c.value / catBreakdown[0].value) * 100 : 0} />
                </div>
              ))}
            </Card>
          )}

          {view === "month" && (
            <Card style={{ marginBottom: 16 }}>
              <h4 className="font-display" style={{ marginTop: 0 }}>Month by month</h4>
              {summary.perMonth.map(m => (
                <div key={m.month} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{MONTH_ABBR[m.month - 1]}</span>
                  <span style={{ color: "var(--ink-soft)" }}>Income {fmtKES(m.income)} · Spent {fmtKES(m.expense)}</span>
                </div>
              ))}
            </Card>
          )}

          {insights.length > 0 && (
            <Card>
              <h4 className="font-display" style={{ marginTop: 0 }}>Annual insights</h4>
              {insights.map((t, i) => <p key={i} style={{ fontSize: 14 }}>{t}</p>)}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function History({ state, initialTab }) {
  const [tab, setTab] = useState(initialTab || "history");
  return (
    <div>
      <Tabs value={tab} onChange={setTab} items={[{ value: "history", label: "Money History" }, { value: "annual", label: "Annual View" }]} />
      <div style={{ height: 16 }} />
      {tab === "history" ? <MoneyHistory state={state} /> : <AnnualView state={state} />}
    </div>
  );
}
