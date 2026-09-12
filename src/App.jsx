import { useState, useEffect } from "react";
import { useTabbiState } from "./hooks/useStore.js";
import { updateSettings, setCurrentMonth } from "./data/store.js";
import { useToasts } from "./components/ui/index.js";
import { Sidebar, MobileDrawer, MobileNav, TopBar, NAV } from "./features/Shell/Shell.jsx";
import AddMoneyModal from "./features/Shell/AddMoneyModal.jsx";
import StartNewMonthModal from "./features/Shell/StartNewMonthModal.jsx";
import Onboarding from "./features/Shell/Onboarding.jsx";
import More from "./features/Shell/More.jsx";
import Help from "./features/Shell/Help.jsx";
import Home from "./features/Home/Home.jsx";
import Budget from "./features/Budget/Budget.jsx";
import Money from "./features/Money/Money.jsx";
import Goals from "./features/Goals/Goals.jsx";
import Insurance from "./features/Insurance/Insurance.jsx";
import Investments from "./features/Investments/Investments.jsx";
import Debt from "./features/Debt/Debt.jsx";
import NetWorth from "./features/NetWorth/NetWorth.jsx";
import Insights from "./features/Insights/Insights.jsx";
import Challenges from "./features/Challenges/Challenges.jsx";
import RoastMe from "./features/RoastMe/RoastMe.jsx";
import MoneyNotes from "./features/MoneyNotes/MoneyNotes.jsx";
import Settings from "./features/Settings/Settings.jsx";
import History from "./features/History/History.jsx";

const TITLES = {
  home: "Home", budget: "Budget", goals: "Goals", money: "Money", investments: "Investments",
  debt: "Debt", insurance: "Insurance", networth: "Net Worth", insights: "Insights",
  challenges: "Challenges", roastme: "Roast Me", notes: "Money Notes", more: "More",
  settings: "Settings", history: "Money History", annual: "Annual View", help: "How Tabbi Works",
};

export default function App() {
  const state = useTabbiState();
  const [route, setRoute] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [startMonthOpen, setStartMonthOpen] = useState(false);
  const [toast, toastNode] = useToasts();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.settings.theme);
  }, [state.settings.theme]);

  function toggleTheme() {
    updateSettings({ theme: state.settings.theme === "dark" ? "light" : "dark" });
  }

  if (!state.onboarded) {
    return <Onboarding onDone={() => {}} />;
  }

  const commonProps = { state, toast, setRoute };

  let screen;
  switch (route) {
    case "home": screen = <Home {...commonProps} onAddMoney={() => setAddMoneyOpen(true)} onStartNewMonth={() => setStartMonthOpen(true)} />; break;
    case "budget": screen = <Budget {...commonProps} />; break;
    case "money": screen = <Money {...commonProps} />; break;
    case "goals": screen = <Goals {...commonProps} />; break;
    case "insurance": screen = <Insurance {...commonProps} />; break;
    case "investments": screen = <Investments {...commonProps} />; break;
    case "debt": screen = <Debt {...commonProps} />; break;
    case "networth": screen = <NetWorth {...commonProps} />; break;
    case "insights": screen = <Insights {...commonProps} />; break;
    case "challenges": screen = <Challenges {...commonProps} />; break;
    case "roastme": screen = <RoastMe {...commonProps} />; break;
    case "notes": screen = <MoneyNotes {...commonProps} />; break;
    case "more": screen = <More setRoute={setRoute} />; break;
    case "settings": screen = <Settings {...commonProps} onToggleTheme={toggleTheme} />; break;
    case "history": screen = <History state={state} initialTab="history" />; break;
    case "annual": screen = <History state={state} initialTab="annual" />; break;
    case "help": screen = <Help />; break;
    default: screen = <Home {...commonProps} onAddMoney={() => setAddMoneyOpen(true)} onStartNewMonth={() => setStartMonthOpen(true)} />;
  }

  return (
    <div className="tb-app">
      <Sidebar route={route} setRoute={setRoute} state={state} setCurrentMonthId={setCurrentMonth} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} route={route} setRoute={setRoute} />
      <main className="tb-main">
        <TopBar title={TITLES[route] || "Tabbi"} onMenu={() => setDrawerOpen(true)}
          onAddMoney={() => setAddMoneyOpen(true)} onToggleTheme={toggleTheme} theme={state.settings.theme} />
        <div className="tb-page">{screen}</div>
      </main>
      <MobileNav route={route} setRoute={setRoute} />

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} state={state} toast={toast} />
      <StartNewMonthModal open={startMonthOpen} onClose={() => setStartMonthOpen(false)} state={state} toast={toast} onDone={() => setRoute("home")} />
      {toastNode}
    </div>
  );
}
