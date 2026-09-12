import { getMonth, monthId } from "../../data/store.js";
import { IconButton, Button } from "../../components/ui/index.js";

export const NAV = [
  { key: "home", label: "Home", em: "🏠" },
  { key: "budget", label: "Budget", em: "🧾" },
  { key: "goals", label: "Goals", em: "🎯" },
  { key: "money", label: "Money", em: "💸" },
  { key: "investments", label: "Investments", em: "📈" },
  { key: "debt", label: "Debt", em: "🪙" },
  { key: "insurance", label: "Insurance", em: "🛡️" },
  { key: "networth", label: "Net Worth", em: "🧮" },
  { key: "insights", label: "Insights", em: "💡" },
  { key: "challenges", label: "Challenges", em: "🏆" },
  { key: "roastme", label: "Roast Me", em: "🔥" },
  { key: "notes", label: "Money Notes", em: "📝" },
  { key: "more", label: "More", em: "⋯" },
];
const MOBILE_PRIMARY = ["home", "budget", "money", "goals", "more"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function monthLabel(m) { return MONTH_NAMES[m.month - 1] + " " + m.year; }

export function MonthSwitcher({ state, onChange }) {
  const m = getMonth(state.currentMonthId);
  function shift(delta) {
    let year = m.year, month = m.month + delta;
    if (month < 1) { month = 12; year -= 1; }
    if (month > 12) { month = 1; year += 1; }
    const id = monthId(year, month);
    if (state.months[id]) onChange(id);
  }
  const nextId = monthId(m.month === 12 ? m.year + 1 : m.year, m.month === 12 ? 1 : m.month + 1);
  return (
    <div className="tb-month-switch">
      <button aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
      <strong style={{ fontSize: 14.5 }}>{monthLabel(m)}</strong>
      <button aria-label="Next month" onClick={() => shift(1)} disabled={!state.months[nextId]}>›</button>
    </div>
  );
}

export function Sidebar({ route, setRoute, state, setCurrentMonthId }) {
  return (
    <aside className="tb-sidebar" aria-label="Primary navigation">
      <div className="tb-brand">Tabbi</div>
      {NAV.map(n => (
        <button key={n.key} className={"tb-navitem" + (route === n.key ? " active" : "")}
          aria-current={route === n.key ? "page" : undefined} onClick={() => setRoute(n.key)}>
          <span className="em" aria-hidden="true">{n.em}</span>{n.label}
        </button>
      ))}
      <div className="tb-sidebar-foot">
        <MonthSwitcher state={state} onChange={setCurrentMonthId} />
      </div>
    </aside>
  );
}

export function MobileDrawer({ open, onClose, route, setRoute }) {
  if (!open) return null;
  return (
    <div className="tb-mobile-drawer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tb-mobile-drawer-panel">
        <div className="tb-brand">Tabbi</div>
        {NAV.map(n => (
          <button key={n.key} className={"tb-navitem" + (route === n.key ? " active" : "")} onClick={() => { setRoute(n.key); onClose(); }}>
            <span className="em" aria-hidden="true">{n.em}</span>{n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileNav({ route, setRoute }) {
  return (
    <nav className="tb-mobile-nav" aria-label="Primary navigation">
      {NAV.filter(n => MOBILE_PRIMARY.includes(n.key)).map(n => (
        <button key={n.key} className={"tb-navitem" + (route === n.key ? " active" : "")} onClick={() => setRoute(n.key)}>
          <span className="em" aria-hidden="true">{n.em}</span>{n.label}
        </button>
      ))}
    </nav>
  );
}

export function TopBar({ title, onMenu, onAddMoney, onToggleTheme, theme }) {
  return (
    <div className="tb-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="tb-iconbtn tb-menu-btn" aria-label="Open menu" onClick={onMenu}>☰</button>
        <h1 className="font-display" style={{ fontSize: 24, margin: 0 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </IconButton>
        <Button onClick={onAddMoney}>+ Add Money</Button>
      </div>
    </div>
  );
}
