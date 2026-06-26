import { Search } from 'lucide-react';
import { Select } from '../ui/FormControls';
import { ALL_CATEGORIES } from '../../lib/constants';
import './TransactionsToolbar.css';

export function TransactionsToolbar({ filters, setFilters, accounts }) {
  return (
    <div className="eq-tx-toolbar">
      <div className="eq-tx-toolbar__search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search transactions…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          aria-label="Search transactions"
        />
      </div>
      <Select
        className="eq-tx-toolbar__select"
        options={[{ value: 'all', label: 'All types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
        value={filters.type}
        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
      />
      <Select
        className="eq-tx-toolbar__select"
        options={[{ value: 'all', label: 'All categories' }, ...ALL_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      />
      <Select
        className="eq-tx-toolbar__select"
        options={[{ value: 'all', label: 'All accounts' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
        value={filters.accountId}
        onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
      />
      <Select
        className="eq-tx-toolbar__select"
        options={[
          { value: 'date_desc', label: 'Newest first' },
          { value: 'date_asc', label: 'Oldest first' },
          { value: 'amount_desc', label: 'Amount: high to low' },
          { value: 'amount_asc', label: 'Amount: low to high' },
        ]}
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      />
    </div>
  );
}
