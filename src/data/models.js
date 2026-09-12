/* ===========================================================
   TABBI DATA MODELS
   Shapes and constants only. See data/store.js for state.
=========================================================== */

export const GROUPS = {
  INCOME: "INCOME",
  MUST_PAY: "MUST_PAY",
  MY_WANTS: "MY_WANTS",
  SAVINGS: "SAVINGS",
  INVESTMENTS: "INVESTMENTS",
};

export const GROUP_LABELS = {
  INCOME: "Income",
  MUST_PAY: "Must Pay",
  MY_WANTS: "My Wants",
  SAVINGS: "Savings",
  INVESTMENTS: "Investments",
};

export const TRANSACTION_TYPES = { INCOME: "income", EXPENSE: "expense" };

export const ACCOUNT_TYPES = ["M-Pesa", "Bank", "SACCO", "Cash", "Other"];

export const INCOME_SOURCE_TYPES = [
  "Salary", "Freelance", "Business", "Side Hustle",
  "Allowance", "Rental Income", "Commission", "Other",
];

export const INVESTMENT_TYPES = [
  "Money Market Fund", "Treasury Bills", "Treasury Bonds",
  "SACCO", "Shares", "Pension", "Other",
];

export const DEBT_TYPES = [
  "Bank Loan", "Mobile Loan", "Credit Card", "SACCO Loan",
  "HELB / Student Loan", "Personal Loan", "BNPL", "Other",
];

export const INSURANCE_TYPES = [
  "Life Insurance", "Medical / Health Insurance", "Motor Insurance — Private",
  "Motor Insurance — Commercial", "Personal Accident", "Travel Insurance",
  "Property / Home Insurance", "Fire Insurance", "Theft / Burglary Insurance",
  "Agriculture / Crop Insurance", "Livestock Insurance", "Other",
];

export const SINKING_FUND_TEMPLATES = [
  "Rent", "Insurance", "Christmas", "School Fees", "Travel",
  "Birthdays", "Car Maintenance", "Annual Subscriptions", "Medical Expenses",
];

export const NOTE_CATEGORIES = [
  "Money Thought", "Spending Reflection", "Goal Check-In",
  "Money Lesson", "Money Gratitude",
];

export const CURRENCIES = [
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
];

export const SAVE_1M_CHALLENGE_ID = "save-1m";

export const CHALLENGE_DEFS = [
  { id: SAVE_1M_CHALLENGE_ID, title: "Save Yourself First", icon: "💎", description: "The million milestone — one contribution at a time.", trackingType: "amount", targetAmount: 1000000, signature: true },
  { id: "no-spend-7", title: "7-Day No-Spend Challenge", days: 7, icon: "🚫", description: "Go seven days without a single non-essential purchase." },
  { id: "savings-30", title: "30-Day Savings Challenge", days: 30, icon: "💰", description: "Save something — anything — every day for a month." },
  { id: "track-7", title: "Track Every Expense — 7 Days", days: 7, icon: "🧾", description: "Log every shilling you spend for a week straight." },
  { id: "under-wants", title: "Stay Under Your My Wants Budget", days: 30, icon: "🛍️", description: "Finish the month at or under your My Wants planned amount." },
  { id: "no-impulse", title: "No Impulse Shopping Week", days: 7, icon: "🧘", description: "Sit on any non-essential purchase for 48 hours." },
  { id: "build-ef", title: "Build Your Emergency Fund", days: 30, icon: "🛟", description: "Make consistent contributions to your emergency fund." },
  { id: "debt-sprint", title: "Debt Payoff Sprint", days: 30, icon: "🪙", description: "Put extra toward your debt every week this month." },
  { id: "cook-home", title: "Cook At Home Challenge", days: 14, icon: "🍳", description: "Skip eating out for two weeks." },
  { id: "invest-monthly", title: "Invest Every Month Challenge", days: 30, icon: "📈", description: "Make at least one investment contribution this month." },
];

export const MONTH_STATUS = { ACTIVE: "ACTIVE", CLOSED: "CLOSED" };

export const DEFAULT_CATEGORIES = [
  { group: GROUPS.MUST_PAY, name: "Rent / Mortgage" },
  { group: GROUPS.MUST_PAY, name: "Electricity & Water" },
  { group: GROUPS.MUST_PAY, name: "Internet & Airtime" },
  { group: GROUPS.MUST_PAY, name: "Transport" },
  { group: GROUPS.MUST_PAY, name: "Groceries" },
  { group: GROUPS.MY_WANTS, name: "Eating Out" },
  { group: GROUPS.MY_WANTS, name: "Shopping" },
  { group: GROUPS.MY_WANTS, name: "Beauty" },
  { group: GROUPS.MY_WANTS, name: "Entertainment" },
  { group: GROUPS.SAVINGS, name: "Savings" },
  { group: GROUPS.INVESTMENTS, name: "Investments" },
];
