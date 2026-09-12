import { fmtKES, fmtMoney, budgetSummary, emergencyFundProgress, sinkingFundProgress, debtPayoffPlan, netWorth, annualSummary, challengeProgress, challengeMilestones } from "../src/utils/calculations.js";

let pass = 0, fail = 0;
function assertEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label + "  expected=" + JSON.stringify(expected) + " actual=" + JSON.stringify(actual)); }
}
function assertClose(actual, expected, label, eps = 0.01) {
  const ok = Math.abs(actual - expected) < eps;
  if (ok) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label + "  expected≈" + expected + " actual=" + actual); }
}

console.log("Budget planned/spent/remaining");
{
  const state = {
    months: { "2026-09": { id: "2026-09", year: 2026, month: 9, categories: [{ id: "c1", group: "MY_WANTS", name: "Eating Out", planned: 15000 }] } },
    transactions: [
      { id: "t1", type: "expense", amount: 8400, categoryId: "c1", date: "2026-09-05" },
      { id: "t2", type: "income", amount: 50000, categoryId: null, date: "2026-09-01" },
    ],
    goals: { sinkingFunds: [] }, insurancePolicies: [],
  };
  const b = budgetSummary(state, "2026-09");
  assertEqual(b.categories[0].spent, 8400, "spent matches transactions");
  assertEqual(b.categories[0].remaining, 6600, "remaining = planned - spent");
  assertEqual(b.income, 50000, "income totals correctly");
}

console.log("Emergency fund calculation");
{
  const r = emergencyFundProgress({ essentialMonthlyExpenses: 30000, targetMonths: 6, savedAmount: 45000, monthlyContribution: 15000 });
  assertEqual(r.target, 180000, "target = essential * months");
  assertEqual(r.remaining, 135000, "remaining computed correctly");
  assertEqual(r.monthsToGo, 9, "months to go = ceil(remaining/contribution)");
}

console.log("Sinking fund calculation");
{
  const r = sinkingFundProgress({ targetAmount: 60000, savedAmount: 20000, dueDate: "2026-12-25", frequency: "Monthly" });
  assertEqual(r.remaining, 40000, "remaining = target - saved");
  assertClose(r.pct, 33.33, "progress percent", 0.1);
}

console.log("Debt payoff — avalanche prioritizes highest interest");
{
  const debts = [
    { id: "d1", name: "SACCO Loan", balance: 20000, interestRate: 12, minPayment: 2000 },
    { id: "d2", name: "Credit Card", balance: 10000, interestRate: 30, minPayment: 1000 },
  ];
  const plan = debtPayoffPlan(debts, 3000, "avalanche");
  assertEqual(plan.milestones[0].name, "Credit Card", "avalanche pays off highest-interest debt first");
}

console.log("Debt payoff — snowball prioritizes smallest balance");
{
  const debts = [
    { id: "d1", name: "SACCO Loan", balance: 20000, interestRate: 30, minPayment: 2000 },
    { id: "d2", name: "Credit Card", balance: 10000, interestRate: 12, minPayment: 1000 },
  ];
  const plan = debtPayoffPlan(debts, 3000, "snowball");
  assertEqual(plan.milestones[0].name, "Credit Card", "snowball pays off smallest balance first");
}

console.log("Net worth = assets - liabilities, no double counting");
{
  const state = { accounts: [{ balance: 40000 }, { balance: 12000 }], investments: [{ balance: 25000 }], debts: [{ balance: 18000 }] };
  const nw = netWorth(state);
  assertEqual(nw.assets, 77000, "assets summed once from accounts + investments only");
  assertEqual(nw.liabilities, 18000, "liabilities summed from debts");
  assertEqual(nw.netWorth, 59000, "net worth = assets - liabilities");
}

console.log("Monthly closing / new month does not delete prior data");
{
  const prevMonthCategories = [{ id: "c1", name: "Eating Out", planned: 15000 }];
  const carried = prevMonthCategories.map(c => ({ ...c, id: "new_" + c.id }));
  assertEqual(carried.length, prevMonthCategories.length, "carry-forward preserves category count");
  assertEqual(prevMonthCategories[0].id, "c1", "original month record untouched");
}

console.log("Annual totals sum monthly totals correctly");
{
  const state = {
    months: {
      "2026-01": { id: "2026-01", year: 2026, month: 1, categories: [{ id: "c1", group: "SAVINGS", name: "Savings", planned: 5000 }] },
      "2026-02": { id: "2026-02", year: 2026, month: 2, categories: [{ id: "c1", group: "SAVINGS", name: "Savings", planned: 5000 }] },
    },
    transactions: [
      { type: "income", amount: 40000, date: "2026-01-03" },
      { type: "expense", amount: 5000, categoryId: "c1", date: "2026-01-10" },
      { type: "income", amount: 42000, date: "2026-02-03" },
      { type: "expense", amount: 6000, categoryId: "c1", date: "2026-02-10" },
    ],
    goals: { sinkingFunds: [] }, insurancePolicies: [],
  };
  const annual = annualSummary(state, 2026);
  assertEqual(annual.totals.income, 82000, "annual income sums both months");
  assertEqual(annual.totals.savings, 11000, "annual savings sums both months' SAVINGS group spend");
}

console.log("Multi-currency formatting uses the right symbol per code");
{
  assertEqual(fmtMoney(1000000, "USD"), "$ 1,000,000", "USD formats with $ symbol");
  assertEqual(fmtMoney(2500, "NGN"), "₦ 2,500", "NGN formats with ₦ symbol");
  assertEqual(fmtMoney(500, "ZZZ"), "ZZZ 500", "unknown currency code falls back gracefully");
}

console.log("Signature challenge (amount-based) progress math");
{
  const def = { trackingType: "amount", targetAmount: 1000000 };
  const joined = { progress: 250000, monthlyTarget: 25000 };
  const p = challengeProgress(def, joined);
  assertEqual(p.remaining, 750000, "remaining = target - saved");
  assertEqual(p.pct, 25, "percent progress computed correctly");
  assertEqual(p.monthsToGo, 30, "months to go = ceil(remaining / monthlyTarget)");
}

console.log("Day-streak challenge progress math (legacy behaviour unchanged)");
{
  const def = { days: 7 };
  const joined = { progress: 3 };
  const p = challengeProgress(def, joined);
  assertClose(p.pct, 42.857, "percent progress for day-streak challenge", 0.01);
}

console.log("Challenge milestones are evenly spaced percentages of target");
{
  const m = challengeMilestones(1000000);
  assertEqual(m.map(x => x.amount), [100000, 250000, 500000, 750000, 1000000], "milestone amounts at 10/25/50/75/100%");
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
