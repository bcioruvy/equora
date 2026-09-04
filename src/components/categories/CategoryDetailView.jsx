import * as Icons from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/Misc';
import { transactionsForCategory } from '../../lib/categoryTotals';
import { formatMoney } from '../../lib/format';
import { format, parseISO } from 'date-fns';

export function CategoryDetailView({ category, categories, transactions, accounts, currency, total, onBack }) {
  const Icon = Icons[category.icon] || Icons.Tag;
  const isIncome = category.type === 'income';
  const subcategories = categories.filter((c) => c.parentId === category.id);
  const subcategoryById = new Map(subcategories.map((c) => [c.id, c]));

  const rows = transactionsForCategory(category, categories, transactions);
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="eq-cat-detail">
      <button type="button" className="eq-cat-detail__back" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to categories
      </button>

      <Card>
        <div className="eq-cat-detail__header">
          <span className={`eq-cat-row__icon eq-cat-detail__icon ${isIncome ? 'eq-cat-row__icon--income' : 'eq-cat-row__icon--expense'}`}>
            <Icon size={20} />
          </span>
          <div>
            <div className="eq-cat-detail__title">{category.name}</div>
            <div className="eq-cat-detail__subtitle">
              {rows.length} transaction{rows.length === 1 ? '' : 's'}
              {subcategories.length > 0 ? ` across ${subcategories.length + 1} categories` : ''}
            </div>
          </div>
          <div className={`eq-cat-detail__total mono-num ${isIncome ? 'eq-cat-row__total--income' : 'eq-cat-row__total--expense'}`}>
            {formatMoney(total, currency)}
          </div>
        </div>
      </Card>

      {rows.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <Card>
            <EmptyState
              icon={<Icon size={28} />}
              title="No transactions yet"
              description="Transactions filed under this category will show up here."
            />
          </Card>
        </div>
      ) : (
        <Card className="eq-cat-detail__list">
          {rows.map((t) => {
            const account = accountById.get(t.accountId);
            const sourceCategory = subcategoryById.get(t.category);
            const signedAmount = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
            return (
              <div key={t.id} className="eq-cat-detail__row">
                <div className="eq-cat-detail__row-main">
                  <div className="eq-cat-detail__row-note">{t.notes || category.name}</div>
                  <div className="eq-cat-detail__row-meta">
                    {account?.name || 'No account'} · {t.date ? format(parseISO(t.date), 'MMM d, yyyy') : ''}
                    {sourceCategory ? ` · ${sourceCategory.name}` : ''}
                  </div>
                </div>
                <div className={`eq-cat-detail__row-amount mono-num ${t.type === 'income' ? 'eq-cat-row__total--income' : 'eq-cat-row__total--expense'}`}>
                  {formatMoney(signedAmount, currency, { signed: true })}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
