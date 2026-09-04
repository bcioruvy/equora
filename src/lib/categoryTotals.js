import { isTransferTransaction } from './transactions';

// ============================================================
// EQUORA — Category totals
// Centralizes how a category's "total" is computed so the
// Categories page (and anywhere else that needs this later) can't
// drift out of sync on the rules below:
//
//  1. A parent category's total = its own direct total + the sum
//     of all its subcategories' totals.
//  2. Totals are keyed by category id (not name) — every category
//     document already has its own unique id, and a transaction's
//     `category` field stores that id, so an Income "Ali" and an
//     Expense "Ali" (two different docs, two different ids) can
//     never collide. Matching also cross-checks transaction.type
//     against the category's own type as a defensive safety net.
//  3. Internal transfers are excluded, using the same
//     isTransferTransaction() rule used for Dashboard/Reports.
// ============================================================

export function computeCategoryTotals(categories, transactions) {
  const cashFlowTx = transactions.filter((t) => !isTransferTransaction(t));

  const ownTotals = new Map();
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  cashFlowTx.forEach((t) => {
    const cat = categoryById.get(t.category);
    if (!cat) return;
    if (cat.type !== t.type) return; // defensive: ignore a type mismatch rather than mis-count it
    ownTotals.set(cat.id, (ownTotals.get(cat.id) || 0) + (Number(t.amount) || 0));
  });

  const childrenByParent = new Map();
  categories.forEach((c) => {
    if (!c.parentId) return;
    if (!childrenByParent.has(c.parentId)) childrenByParent.set(c.parentId, []);
    childrenByParent.get(c.parentId).push(c);
  });

  const result = new Map();
  categories.forEach((c) => {
    const ownTotal = ownTotals.get(c.id) || 0;
    const children = childrenByParent.get(c.id) || [];
    const childrenTotal = children.reduce((sum, child) => sum + (ownTotals.get(child.id) || 0), 0);
    result.set(c.id, {
      category: c,
      ownTotal,
      total: ownTotal + childrenTotal,
    });
  });

  return result;
}

/** Every transaction filed under a category (and, if it's a parent, under its subcategories too). */
export function transactionsForCategory(category, categories, transactions) {
  const cashFlowTx = transactions.filter((t) => !isTransferTransaction(t));
  const childIds = categories.filter((c) => c.parentId === category.id).map((c) => c.id);
  const relevantIds = new Set([category.id, ...childIds]);
  return cashFlowTx
    .filter((t) => relevantIds.has(t.category) && t.type === category.type)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
