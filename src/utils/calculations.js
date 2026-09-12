/* ===========================================================
   TABBI CALCULATIONS
   Pure functions only — no side effects, no store access.
   Every number on screen should be traceable to one of these.
=========================================================== */
import { GROUPS, CURRENCIES } from "../data/models.js";
import { getState } from "../data/store.js";

const CURRENCY_SYMBOLS = CURRENCIES.reduce((acc, c) => { acc[c.code] = c.symbol; return acc; }, {});

// Pure formatter — pass an explicit currency code (used for per-account
// amounts, since accounts can each hold a different currency).
export function fmtMoney(n, currencyCode) {
  const v = Math.round(Number(n) || 0);
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode || "KSh";
  return symbol + " " + v.toLocaleString("en-KE");
}

// Formats using the app's primary currency (Settings > Currency). Kept as
// `fmtKES` so every existing call site across the app (Home, Budget, Goals,
// Insurance, Debt, etc.) automatically shows the right symbol with zero
// changes needed at each call site.
export function fmtKES(n) {
  const state = getState();
  return fmtMoney(n, (state && state.settings && state.settings.currency) || "KES");
}

export function monthTxs(state, monthId) {
  const m = state.months[monthId];
  if (!m) return [];
  const prefix = m.year + "-" + String(m.month).padStart(2, "0");
  return state.transactions.filter(t => t.date && t.date.slice(0, 7) === prefix);
}

// ---------- Budget ----------
export function budgetSummary(state, monthId) {
  const m = state.months[monthId];
  if (!m) return null;
  const txs = monthTxs(state, monthId);
  const cats = m.categories.map(c => {
    const spent = txs.filter(t => t.categoryId === c.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { ...c, spent, remaining: c.planned - spent, pct: c.planned > 0 ? Math.min(999, (spent / c.planned) * 100) : (spent > 0 ? 100 : 0) };
  });
  const income = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalPlanned = cats.reduce((s, c) => s + c.planned, 0);
  const totalSpent = cats.reduce((s, c) => s + c.spent, 0);
  const byGroup = {};
  Object.values(GROUPS).forEach(g => {
    const gc = cats.filter(c => c.group === g);
    byGroup[g] = { planned: gc.reduce((s, c) => s + c.planned, 0), spent: gc.reduce((s, c) => s + c.spent, 0), categories: gc };
  });
  return { categories: cats, byGroup, income, totalPlanned, totalSpent, remaining: income - totalSpent };
}

export function incomeTotal(state, monthId) {
  return monthTxs(state, monthId).filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
}
export function expenseTotal(state, monthId) {
  return monthTxs(state, monthId).filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
}

// ---------- Emergency Fund ----------
export function emergencyFundProgress(ef) {
  if (!ef) return null;
  const target = (ef.essentialMonthlyExpenses || 0) * (ef.targetMonths || 6);
  const saved = ef.savedAmount || 0;
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const monthlyContribution = ef.monthlyContribution || 0;
  const monthsToGo = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;
  let etaDate = null;
  if (monthsToGo != null) { const d = new Date(); d.setMonth(d.getMonth() + monthsToGo); etaDate = d; }
  return { target, saved, remaining, pct, monthlyContribution, monthsToGo, etaDate,
    status: pct >= 100 ? "complete" : (monthlyContribution <= 0 ? "no-plan" : "on-track") };
}

// ---------- Sinking Funds ----------
export function sinkingFundProgress(fund) {
  const remaining = Math.max(0, fund.targetAmount - fund.savedAmount);
  const pct = fund.targetAmount > 0 ? Math.min(100, (fund.savedAmount / fund.targetAmount) * 100) : 0;
  let periodsLeft = null, requiredContribution = null;
  if (fund.dueDate) {
    const daysLeft = Math.max(0, Math.ceil((new Date(fund.dueDate) - new Date()) / 86400000));
    periodsLeft = fund.frequency === "Weekly" ? Math.max(1, Math.ceil(daysLeft / 7)) : Math.max(1, Math.ceil(daysLeft / 30.44));
    requiredContribution = remaining / periodsLeft;
  }
  let status = "on-track";
  if (pct >= 100) status = "complete";
  else if (fund.dueDate && new Date(fund.dueDate) < new Date()) status = "behind";
  return { remaining, pct, periodsLeft, requiredContribution, status };
}

// ---------- Insurance ----------
export function insuranceProgress(policy) {
  const remaining = Math.max(0, policy.premiumAmount - policy.savedAmount);
  const pct = policy.premiumAmount > 0 ? Math.min(100, (policy.savedAmount / policy.premiumAmount) * 100) : 0;
  let daysUntilDue = null, requiredMonthly = null, status = "on-track";
  if (policy.nextDueDate) {
    daysUntilDue = Math.ceil((new Date(policy.nextDueDate) - new Date()) / 86400000);
    const monthsLeft = Math.max(1 / 30, daysUntilDue / 30.44);
    requiredMonthly = remaining / Math.max(1, Math.ceil(monthsLeft));
    if (daysUntilDue < 0 && pct < 100) status = "behind";
  }
  if (pct >= 100) status = "complete";
  return { remaining, pct, daysUntilDue, requiredMonthly, status };
}

// ---------- Debt Payoff Planner ----------
export function debtPayoffPlan(debts, extraMonthly, method) {
  if (!debts || debts.length === 0) return { months: 0, milestones: [], totalInterest: 0 };
  let working = debts.map(d => ({ id: d.id, name: d.name, balance: d.balance, rate: d.interestRate || 0, minPayment: d.minPayment || 0 })).filter(d => d.balance > 0);
  const order = (method === "avalanche") ? working.slice().sort((a, b) => b.rate - a.rate) : working.slice().sort((a, b) => a.balance - b.balance);

  let month = 0, totalInterest = 0;
  const milestones = [];
  const maxMonths = 600;
  let extra = extraMonthly || 0;

  while (order.some(d => d.balance > 0.5) && month < maxMonths) {
    month++;
    let freed = extra;
    for (const d of order) {
      if (d.balance <= 0) continue;
      const interest = d.balance * (d.rate / 100 / 12);
      totalInterest += interest;
      d.balance += interest;
      let pay = d.minPayment;
      if (freed > 0) { pay += freed; freed = 0; }
      pay = Math.min(pay, d.balance);
      d.balance -= pay;
      if (d.balance <= 0.5 && !d.paidOffMonth) { d.balance = 0; d.paidOffMonth = month; milestones.push({ id: d.id, name: d.name, month }); }
    }
    extra = extra + order.filter(d => d.balance <= 0 && d.paidOffMonth === month).reduce((s, d) => s + d.minPayment, 0);
  }
  return { months: month, milestones, totalInterest: Math.round(totalInterest) };
}

// ---------- Net Worth ----------
export function netWorth(state) {
  const assets = state.accounts.reduce((s, a) => s + (a.balance || 0), 0) + state.investments.reduce((s, i) => s + (i.balance || 0), 0);
  const liabilities = state.debts.reduce((s, d) => s + (d.balance || 0), 0);
  return { assets, liabilities, netWorth: assets - liabilities };
}

// ---------- Annual ----------
export function annualSummary(state, year) {
  const months = Object.values(state.months).filter(m => m.year === year).sort((a, b) => a.month - b.month);
  const perMonth = months.map(m => {
    const income = incomeTotal(state, m.id);
    const expense = expenseTotal(state, m.id);
    const b = budgetSummary(state, m.id);
    const savings = b ? b.byGroup[GROUPS.SAVINGS].spent : 0;
    const invested = b ? b.byGroup[GROUPS.INVESTMENTS].spent : 0;
    return { month: m.month, income, expense, savings, invested };
  });
  const totals = perMonth.reduce((acc, m) => ({
    income: acc.income + m.income, expense: acc.expense + m.expense,
    savings: acc.savings + m.savings, invested: acc.invested + m.invested,
  }), { income: 0, expense: 0, savings: 0, invested: 0 });
  return { perMonth, totals };
}

export function categoryBreakdownForYear(state, year) {
  const months = Object.values(state.months).filter(m => m.year === year);
  const totals = {};
  months.forEach(m => {
    const b = budgetSummary(state, m.id);
    b.categories.forEach(c => { totals[c.name] = (totals[c.name] || 0) + c.spent; });
  });
  return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

// ---------- Insights ----------
export function generateInsights(state, monthId) {
  const insights = [];
  const b = budgetSummary(state, monthId);
  if (!b) return insights;
  const m = state.months[monthId];
  const now = new Date();
  const daysInMonth = new Date(m.year, m.month, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - now.getDate());

  b.categories.forEach(c => {
    if (c.planned > 0 && c.pct >= 90 && c.pct < 100 && daysLeft > 3) {
      insights.push({ type: "warning", text: `Your ${c.name} budget is ${Math.round(c.pct)}% used and there are still ${daysLeft} days left.` });
    }
    if (c.pct >= 100) {
      insights.push({ type: "warning", text: `You've gone over budget on ${c.name} by ${fmtKES(c.spent - c.planned)}.` });
    }
  });

  if (b.remaining > 0 && b.income > 0) {
    insights.push({ type: "celebration", text: `You've got ${fmtKES(b.remaining)} left to plan for this month. Nice cushion.` });
  }
  if (b.totalSpent > 0 && b.totalPlanned > 0 && b.totalSpent < b.totalPlanned * 0.7 && daysLeft < 5) {
    insights.push({ type: "celebration", text: `You stayed well under budget this month. We love to see it.` });
  }

  (state.goals.sinkingFunds || []).forEach(f => {
    if (f.dueDate) {
      const days = Math.ceil((new Date(f.dueDate) - now) / 86400000);
      if (days >= 0 && days <= 14) insights.push({ type: "reminder", text: `${f.name} is due in ${days} day${days === 1 ? "" : "s"}.` });
    }
  });
  (state.insurancePolicies || []).forEach(p => {
    if (p.nextDueDate) {
      const days = Math.ceil((new Date(p.nextDueDate) - now) / 86400000);
      if (days >= 0 && days <= 14) insights.push({ type: "reminder", text: `${p.type} premium is due in ${days} day${days === 1 ? "" : "s"}.` });
    }
  });

  return insights;
}

// ---------- Annual insights (only from real data) ----------
export function annualInsights(state, year) {
  const { perMonth } = annualSummary(state, year);
  const withData = perMonth.filter(m => m.income > 0 || m.expense > 0);
  const insights = [];
  if (withData.length >= 2) {
    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const bestSavings = withData.slice().sort((a, b) => b.savings - a.savings)[0];
    if (bestSavings.savings > 0) insights.push(`You saved more in ${names[bestSavings.month - 1]} than any other month.`);
    const last = withData[withData.length - 1], prev = withData[withData.length - 2];
    if (last.expense > prev.expense * 1.15) insights.push(`Your spending increased in ${names[last.month - 1]}.`);
    const firstRate = prev.income > 0 ? prev.savings / prev.income : 0;
    const lastRate = last.income > 0 ? last.savings / last.income : 0;
    if (lastRate > firstRate && firstRate > 0) insights.push(`Your savings rate improved by ${Math.round((lastRate - firstRate) * 100)}%.`);
  }
  return insights;
}

// ---------- Challenges (generic: day-streak or amount-based) ----------
export function challengeProgress(def, joinedRecord) {
  const progress = joinedRecord ? (joinedRecord.progress || 0) : 0;
  const completed = !!(joinedRecord && joinedRecord.completedAt);
  if (def.trackingType === "amount") {
    const target = def.targetAmount || 0;
    const remaining = Math.max(0, target - progress);
    const pct = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
    const monthlyTarget = (joinedRecord && joinedRecord.monthlyTarget) || 0;
    const monthsToGo = monthlyTarget > 0 ? Math.ceil(remaining / monthlyTarget) : null;
    return { type: "amount", target, saved: progress, remaining, pct, monthlyTarget, monthsToGo, completed };
  }
  const target = def.days || 0;
  const pct = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  return { type: "days", target, progress, pct, completed };
}

export function challengeMilestones(target) {
  return [0.1, 0.25, 0.5, 0.75, 1].map(f => ({ amount: Math.round((target || 0) * f), pct: Math.round(f * 100) }));
}

// ---------- Roast Me ----------
export function generateRoasts(state, monthId, level) {
  const b = budgetSummary(state, monthId);
  if (!b) return [];
  const wants = b.byGroup[GROUPS.MY_WANTS];
  const lines = { GENTLE: [], PLAYFUL: [], BRUTAL: [] };

  if (wants && wants.planned > 0 && wants.spent > wants.planned) {
    const over = wants.spent - wants.planned;
    lines.GENTLE.push(`Okay bestie, My Wants went ${fmtKES(over)} over. We see you 😂`);
    lines.PLAYFUL.push(`Your My Wants budget saw ${fmtKES(over)} in overspending and immediately resigned.`);
    lines.BRUTAL.push(`At this point you're not budgeting. You're documenting the downfall of My Wants. 😭`);
  }
  const topCat = b.categories.slice().sort((a, c) => c.spent - a.spent)[0];
  if (topCat && topCat.spent > 0) {
    lines.GENTLE.push(`${topCat.name} was really out here taking most of your money this month.`);
    lines.PLAYFUL.push(`${topCat.name}: ${fmtKES(topCat.spent)} spent. Bold choice, no notes.`);
    lines.BRUTAL.push(`${fmtKES(topCat.spent)} on ${topCat.name}. Your future self would like a word.`);
  }
  if (b.income > 0 && b.totalSpent === 0) {
    lines.GENTLE.push("No transactions logged yet — Tabbi has nothing to roast (yet).");
    lines.PLAYFUL.push("You've added zero transactions. Even I need something to work with.");
    lines.BRUTAL.push("Ghosting your own budget isn't a strategy.");
  }
  const key = (level || "PLAYFUL").toUpperCase();
  return lines[key] && lines[key].length ? lines[key] : ["Add a few transactions and Tabbi will have plenty to say 👀"];
}
