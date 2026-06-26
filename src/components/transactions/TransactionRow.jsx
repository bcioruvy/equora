import * as Icons from 'lucide-react';
import { getCategoryById } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import './TransactionRow.css';

export function TransactionRow({ transaction, account, onClick, showCheckbox, checked, onCheck }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';
  const category = getCategoryById(transaction.category);
  const Icon = Icons[category.icon] || Icons.Circle;
  const isIncome = transaction.type === 'income';

  return (
    <div className="eq-tx-row" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {showCheckbox && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => { e.stopPropagation(); onCheck?.(transaction.id); }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select transaction ${category.label}`}
          className="eq-tx-row__checkbox"
        />
      )}
      <span className={`eq-tx-row__icon ${isIncome ? 'eq-tx-row__icon--income' : 'eq-tx-row__icon--expense'}`}>
        <Icon size={17} />
      </span>
      <div className="eq-tx-row__main">
        <span className="eq-tx-row__category">{category.label}</span>
        <span className="eq-tx-row__meta">
          {account?.name || 'Account'} · {formatDate(transaction.date)}
          {transaction.notes ? ` · ${transaction.notes}` : ''}
        </span>
      </div>
      <span className={`eq-tx-row__amount mono-num ${isIncome ? 'eq-tx-row__amount--income' : 'eq-tx-row__amount--expense'}`}>
        {formatMoney(transaction.amount, currency, { signed: true })}
        {!isIncome && transaction.amount > 0 ? '' : ''}
      </span>
    </div>
  );
}

function formatDate(date) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date?.toDate?.() || new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
