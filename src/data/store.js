/* ===========================================================
   TABBI STORE
   A small, dependency-free data layer. localStorage today,
   swappable for a backend later without touching UI code —
   every screen talks to this module, never to localStorage.
=========================================================== */
import { GROUPS, MONTH_STATUS, DEFAULT_CATEGORIES } from "./models.js";

const KEY = "tabbi:v1";

export function uid(prefix) {
  return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function monthId(year, month) { return year + "-" + String(month).padStart(2, "0"); }

function defaultCategoriesForMonth() {
  return DEFAULT_CATEGORIES.map(c => ({
    id: uid("cat"), group: c.group, name: c.name, planned: 0, custom: false,
  }));
}

function emptyState() {
  const now = new Date();
  const y = now.getFullYear(), mo = now.getMonth() + 1;
  const id = monthId(y, mo);
  return {
    version: 1,
    onboarded: false,
    settings: {
      currency: "KES",
      displayName: "",
      theme: "light",
      personality: "Supportive",
      roastLevel: "Playful",
      pinEnabled: false,
      pin: null,
      notifications: {
        upcomingBill: true, goalMilestone: true, challengeProgress: true,
        budgetWarning: true, newMonth: true, recurringPayment: true, sinkingFundDeadline: true,
      },
    },
    accounts: [],
    incomeSources: [],
    transactions: [],
    months: {
      [id]: {
        id, year: y, month: mo, status: MONTH_STATUS.ACTIVE,
        categories: defaultCategoriesForMonth(),
        recurring: [],
        createdDate: now.toISOString(), closedDate: null,
        leftoverDecisions: {},
      },
    },
    currentMonthId: id,
    goals: { emergencyFund: null, sinkingFunds: [] },
    insurancePolicies: [],
    investments: [],
    debts: [],
    moneyNotes: [],
    challenges: { joined: [], custom: [] },
    netWorthSnapshots: [],
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const base = emptyState();
    const merged = Object.assign(base, parsed);
    merged.settings = Object.assign({}, base.settings, parsed.settings || {});
    merged.settings.notifications = Object.assign({}, base.settings.notifications, (parsed.settings && parsed.settings.notifications) || {});
    merged.goals = Object.assign({}, base.goals, parsed.goals || {});
    merged.challenges = Object.assign({}, base.challenges, parsed.challenges || {});
    merged.challenges.joined = (parsed.challenges && parsed.challenges.joined) || [];
    merged.challenges.custom = (parsed.challenges && parsed.challenges.custom) || [];
    return merged;
  } catch (e) {
    console.error("Tabbi store load error", e);
    return emptyState();
  }
}

function persist() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.error("Tabbi persist error", e); }
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getState() { return state; }

function set(mutator) {
  const draft = JSON.parse(JSON.stringify(state));
  mutator(draft);
  state = draft;
  persist();
}

// ---------- months ----------
export function ensureMonth(year, month) {
  const id = monthId(year, month);
  if (state.months[id]) return id;
  set(d => {
    const prev = d.months[d.currentMonthId];
    d.months[id] = {
      id, year, month, status: MONTH_STATUS.ACTIVE,
      categories: prev ? prev.categories.map(c => ({ ...c, id: uid("cat") })) : defaultCategoriesForMonth(),
      recurring: prev ? prev.recurring.slice() : [],
      createdDate: new Date().toISOString(), closedDate: null,
      leftoverDecisions: {},
    };
  });
  return id;
}

export function getMonth(id) { return state.months[id || state.currentMonthId]; }
export function getCurrentMonth() { return getMonth(state.currentMonthId); }
export function setCurrentMonth(id) { if (state.months[id]) set(d => { d.currentMonthId = id; }); }

// ---------- accounts ----------
export function addAccount(acc) {
  set(d => d.accounts.push({ id: uid("acc"), name: acc.name, type: acc.type, balance: Number(acc.balance) || 0, currency: acc.currency || d.settings.currency, institution: acc.institution || "", notes: acc.notes || "" }));
}
export function updateAccount(id, patch) { set(d => { const a = d.accounts.find(x => x.id === id); if (a) Object.assign(a, patch); }); }
export function deleteAccount(id) { set(d => { d.accounts = d.accounts.filter(x => x.id !== id); }); }

// ---------- income sources ----------
export function addIncomeSource(src) { set(d => d.incomeSources.push({ id: uid("inc"), name: src.name, type: src.type })); }
export function deleteIncomeSource(id) { set(d => { d.incomeSources = d.incomeSources.filter(x => x.id !== id); }); }

// ---------- transactions (SOURCE OF TRUTH) ----------
export function addTransaction(tx) {
  const id = uid("tx");
  set(d => {
    d.transactions.push({
      id, type: tx.type, amount: Number(tx.amount) || 0, categoryId: tx.categoryId || null,
      accountId: tx.accountId || null, date: tx.date || new Date().toISOString().slice(0, 10),
      note: tx.note || "", recurring: tx.recurring || null,
    });
    if (tx.accountId) {
      const acc = d.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance += (tx.type === "income" ? 1 : -1) * (Number(tx.amount) || 0);
    }
  });
  return id;
}
export function updateTransaction(id, patch) {
  set(d => {
    const tx = d.transactions.find(t => t.id === id);
    if (!tx) return;
    if (tx.accountId) {
      const acc = d.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance -= (tx.type === "income" ? 1 : -1) * tx.amount;
    }
    Object.assign(tx, patch, { amount: Number(patch.amount != null ? patch.amount : tx.amount) });
    if (tx.accountId) {
      const acc = d.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance += (tx.type === "income" ? 1 : -1) * tx.amount;
    }
  });
}
export function deleteTransaction(id) {
  set(d => {
    const tx = d.transactions.find(t => t.id === id);
    if (!tx) return;
    if (tx.accountId) {
      const acc = d.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance -= (tx.type === "income" ? 1 : -1) * tx.amount;
    }
    d.transactions = d.transactions.filter(t => t.id !== id);
  });
}

// ---------- budget categories ----------
export function addCategory(monthIdArg, group, name, planned) {
  set(d => { d.months[monthIdArg].categories.push({ id: uid("cat"), group, name, planned: Number(planned) || 0, custom: true }); });
}
export function updateCategory(monthIdArg, catId, patch) {
  set(d => { const c = d.months[monthIdArg].categories.find(x => x.id === catId); if (c) Object.assign(c, patch); });
}
export function deleteCategory(monthIdArg, catId) {
  set(d => { d.months[monthIdArg].categories = d.months[monthIdArg].categories.filter(c => c.id !== catId); });
}

// ---------- months lifecycle ----------
export function closeMonth(id, options) {
  set(d => {
    const m = d.months[id];
    m.status = MONTH_STATUS.CLOSED;
    m.closedDate = new Date().toISOString();
    if (options && options.leftoverDecisions) m.leftoverDecisions = options.leftoverDecisions;
  });
}

export function startNewMonth(year, month, carryOptions) {
  const prevId = state.currentMonthId;
  const newId = monthId(year, month);
  set(d => {
    const prev = d.months[prevId];
    const carried = (!carryOptions || carryOptions.categories !== false)
      ? prev.categories.map(c => ({ ...c, id: uid("cat") }))
      : defaultCategoriesForMonth();
    d.months[newId] = {
      id: newId, year, month, status: MONTH_STATUS.ACTIVE,
      categories: carried,
      recurring: (carryOptions && carryOptions.recurringBills === false) ? [] : (prev.recurring || []).slice(),
      createdDate: new Date().toISOString(), closedDate: null,
      leftoverDecisions: {},
    };
    d.currentMonthId = newId;
  });
  return newId;
}

// ---------- goals ----------
export function setEmergencyFund(cfg) { set(d => { d.goals.emergencyFund = Object.assign({}, d.goals.emergencyFund, cfg); }); }
export function addSinkingFund(fund) {
  set(d => d.goals.sinkingFunds.push({
    id: uid("sink"), name: fund.name, targetAmount: Number(fund.targetAmount) || 0,
    dueDate: fund.dueDate || null, savedAmount: Number(fund.savedAmount) || 0,
    frequency: fund.frequency || "Monthly",
  }));
}
export function updateSinkingFund(id, patch) { set(d => { const f = d.goals.sinkingFunds.find(x => x.id === id); if (f) Object.assign(f, patch); }); }
export function deleteSinkingFund(id) { set(d => { d.goals.sinkingFunds = d.goals.sinkingFunds.filter(x => x.id !== id); }); }
export function contributeSinkingFund(id, amount) { set(d => { const f = d.goals.sinkingFunds.find(x => x.id === id); if (f) f.savedAmount += Number(amount) || 0; }); }
export function contributeEmergencyFund(amount) { set(d => { if (d.goals.emergencyFund) d.goals.emergencyFund.savedAmount = (d.goals.emergencyFund.savedAmount || 0) + (Number(amount) || 0); }); }

// ---------- insurance ----------
export function addInsurancePolicy(p) {
  set(d => d.insurancePolicies.push({
    id: uid("ins"), type: p.type, provider: p.provider || "", premiumAmount: Number(p.premiumAmount) || 0,
    frequency: p.frequency || "Monthly", nextDueDate: p.nextDueDate || null, savedAmount: Number(p.savedAmount) || 0,
  }));
}
export function updateInsurancePolicy(id, patch) { set(d => { const p = d.insurancePolicies.find(x => x.id === id); if (p) Object.assign(p, patch); }); }
export function deleteInsurancePolicy(id) { set(d => { d.insurancePolicies = d.insurancePolicies.filter(x => x.id !== id); }); }

// ---------- investments ----------
export function addInvestment(inv) {
  set(d => d.investments.push({ id: uid("iv"), name: inv.name, type: inv.type, balance: Number(inv.balance) || 0, institution: inv.institution || "", notes: inv.notes || "" }));
}
export function updateInvestment(id, patch) { set(d => { const i = d.investments.find(x => x.id === id); if (i) Object.assign(i, patch); }); }
export function deleteInvestment(id) { set(d => { d.investments = d.investments.filter(x => x.id !== id); }); }

// ---------- debts ----------
export function addDebt(debt) {
  set(d => d.debts.push({
    id: uid("debt"), name: debt.name, type: debt.type, balance: Number(debt.balance) || 0,
    interestRate: Number(debt.interestRate) || 0, minPayment: Number(debt.minPayment) || 0,
    dueDate: debt.dueDate || null, payments: [],
  }));
}
export function updateDebt(id, patch) { set(d => { const x = d.debts.find(v => v.id === id); if (x) Object.assign(x, patch); }); }
export function deleteDebt(id) { set(d => { d.debts = d.debts.filter(x => x.id !== id); }); }
export function recordDebtPayment(id, amount, date) {
  set(d => {
    const debt = d.debts.find(x => x.id === id);
    if (!debt) return;
    debt.payments.push({ id: uid("pay"), amount: Number(amount) || 0, date: date || new Date().toISOString().slice(0, 10) });
    debt.balance = Math.max(0, debt.balance - (Number(amount) || 0));
  });
}

// ---------- money notes ----------
export function addNote(note) {
  set(d => d.moneyNotes.push({
    id: uid("note"), category: note.category, text: note.text, date: new Date().toISOString(),
    linkedType: note.linkedType || null, linkedId: note.linkedId || null,
  }));
}
export function deleteNote(id) { set(d => { d.moneyNotes = d.moneyNotes.filter(n => n.id !== id); }); }

// ---------- challenges ----------
export function joinChallenge(challengeId) {
  set(d => { if (!d.challenges.joined.find(c => c.challengeId === challengeId)) d.challenges.joined.push({ challengeId, startedAt: new Date().toISOString(), progress: 0, completedAt: null, monthlyTarget: 0 }); });
}
export function updateChallengeProgress(challengeId, progress, target) {
  set(d => {
    const c = d.challenges.joined.find(x => x.challengeId === challengeId);
    if (!c) return;
    c.progress = progress;
    if (target && progress >= target && !c.completedAt) c.completedAt = new Date().toISOString();
  });
}
export function contributeChallengeProgress(challengeId, amount, target) {
  set(d => {
    const c = d.challenges.joined.find(x => x.challengeId === challengeId);
    if (!c) return;
    c.progress = (c.progress || 0) + (Number(amount) || 0);
    if (target && c.progress >= target && !c.completedAt) c.completedAt = new Date().toISOString();
  });
}
export function setChallengeMonthlyTarget(challengeId, amount) {
  set(d => { const c = d.challenges.joined.find(x => x.challengeId === challengeId); if (c) c.monthlyTarget = Number(amount) || 0; });
}
export function leaveChallenge(challengeId) { set(d => { d.challenges.joined = d.challenges.joined.filter(c => c.challengeId !== challengeId); }); }
export function addCustomChallenge(def) {
  set(d => d.challenges.custom.push({
    id: uid("chal"), custom: true, title: def.title, icon: def.icon || "🎯",
    description: def.description || "Custom challenge", trackingType: def.trackingType || "days",
    days: def.days || null, targetAmount: def.targetAmount || null, deadline: def.deadline || null,
  }));
}
export function deleteCustomChallenge(id) {
  set(d => {
    d.challenges.custom = d.challenges.custom.filter(c => c.id !== id);
    d.challenges.joined = d.challenges.joined.filter(c => c.challengeId !== id);
  });
}

// ---------- settings ----------
export function updateSettings(patch) { set(d => { Object.assign(d.settings, patch); }); }
export function updateNotificationSettings(patch) { set(d => { Object.assign(d.settings.notifications, patch); }); }
export function setOnboarded(v) { set(d => { d.onboarded = v; }); }

// ---------- net worth ----------
export function snapshotNetWorth(nw) {
  set(d => { d.netWorthSnapshots.push({ date: new Date().toISOString().slice(0, 10), ...nw }); });
}

// ---------- danger zone ----------
export function resetAllData() {
  state = emptyState();
  persist();
}
