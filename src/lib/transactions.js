// ============================================================
// EQUORA — Shared transaction-level helpers
// Centralizes rules that need to stay identical everywhere they're
// used (Dashboard, Reports, Categories, etc.) so they can't drift
// out of sync if one call site gets updated and another doesn't.
// ============================================================

// A transaction is an internal transfer (money moved between the user's
// own accounts) if it carries the 'transfer' tag — this is how
// transferBetweenAccounts() tags both legs it writes. Transfers are real
// account movements (they must still affect account balances) but they
// are NOT real income or spending, so anything computing "cash flow"
// metrics (monthly income/expense, category totals, budgets, trends,
// insights) should exclude them using this same check.
export function isTransferTransaction(t) {
  return Array.isArray(t?.tags) && t.tags.includes('transfer');
}
