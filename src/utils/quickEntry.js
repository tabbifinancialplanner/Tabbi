import { getCurrentMonth } from "../data/store.js";

const INCOME_WORDS = ["got paid", "salary", "earned", "received", "income", "paid me", "freelance payment", "commission", "sold", "got a refund", "refund"];

const CATEGORY_KEYWORDS = {
  "Eating Out": ["lunch", "dinner", "breakfast", "restaurant", "food delivery", "takeaway", "kfc", "java", "eating out", "ate out", "chips", "nyama"],
  "Groceries": ["groceries", "supermarket", "naivas", "carrefour", "market"],
  "Transport": ["uber", "bolt", "matatu", "fuel", "petrol", "fare", "transport", "taxi"],
  "Shopping": ["shopping", "clothes", "shoes", "bought", "mall"],
  "Beauty": ["salon", "barber", "nails", "makeup", "beauty", "haircut"],
  "Entertainment": ["movie", "netflix", "cinema", "concert", "entertainment", "spotify"],
  "Electricity & Water": ["kplc", "electricity", "water bill", "token"],
  "Internet & Airtime": ["airtime", "data bundle", "wifi", "internet"],
  "Rent / Mortgage": ["rent", "mortgage"],
};

const ACCOUNT_KEYWORDS = {
  "M-Pesa": ["mpesa", "m-pesa"],
  "Bank": ["bank", "card"],
  "Cash": ["cash"],
  "SACCO": ["sacco"],
};

export function parseQuickEntry(text, state) {
  const lower = text.toLowerCase();
  const amountMatch = lower.match(/(?:ksh|kes|sh)?\s?(\d[\d,]*(?:\.\d+)?)\s?(?:ksh|kes|\/-|bob)?/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;

  const isIncome = INCOME_WORDS.some(w => lower.includes(w));
  const type = isIncome ? "income" : "expense";

  let categoryName = null;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(w => lower.includes(w))) { categoryName = cat; break; }
  }
  const month = getCurrentMonth();
  let category = categoryName ? month.categories.find(c => c.name === categoryName) : null;
  if (!category && !isIncome) category = month.categories.find(c => c.name === "Shopping") || month.categories[0];

  let accountName = null;
  for (const [acc, words] of Object.entries(ACCOUNT_KEYWORDS)) {
    if (words.some(w => lower.includes(w))) { accountName = acc; break; }
  }
  let account = accountName ? state.accounts.find(a => a.type === accountName || a.name.toLowerCase().includes(accountName.toLowerCase())) : null;
  if (!account && state.accounts.length) account = state.accounts[0];

  return {
    amount, type,
    categoryId: category ? category.id : null,
    accountId: account ? account.id : null,
    date: new Date().toISOString().slice(0, 10),
    note: text.trim(),
    confidence: amount != null ? "ok" : "needs-amount",
  };
}
