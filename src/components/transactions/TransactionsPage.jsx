import { useMemo, useState } from 'react';
import { Plus, Download, Inbox } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/Misc';
import { Pagination } from '../ui/Pagination';
import { TransactionRow } from './TransactionRow';
import { TransactionsToolbar } from './TransactionsToolbar';
import { BulkActionsBar } from './BulkActionsBar';
import { TransactionFormModal } from './TransactionFormModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { deleteTransaction } from '../../firebase/firestore';
import { exportTransactionsToCSV, exportTransactionsToExcel, exportTransactionsToPDF } from '../../lib/exporters';
import { getCategoryById } from '../../lib/constants';
import './TransactionsPage.css';

const PAGE_SIZE = 12;

export function TransactionsPage() {
  const { transactions, accounts } = useData();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({ search: '', type: 'all', category: 'all', accountId: 'all', sort: 'date_desc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [formModal, setFormModal] = useState({ open: false, type: 'expense', transaction: null });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter((t) => {
        const cat = getCategoryById(t.category).label.toLowerCase();
        return cat.includes(q) || (t.notes || '').toLowerCase().includes(q) || (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      });
    }
    if (filters.type !== 'all') list = list.filter((t) => t.type === filters.type);
    if (filters.category !== 'all') list = list.filter((t) => t.category === filters.category);
    if (filters.accountId !== 'all') list = list.filter((t) => t.accountId === filters.accountId);

    list.sort((a, b) => {
      if (filters.sort === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (filters.sort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (filters.sort === 'amount_desc') return b.amount - a.amount;
      if (filters.sort === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.size} transaction(s)? This cannot be undone.`)) return;
    try {
      await Promise.all([...selected].map((id) => deleteTransaction(user.uid, id)));
      showToast(`${selected.size} transaction(s) deleted`, { tone: 'success' });
      setSelected(new Set());
    } catch {
      showToast('Could not delete some transactions.', { tone: 'error' });
    }
  }

  async function handleSingleDelete(id) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await deleteTransaction(user.uid, id);
      showToast('Transaction deleted', { tone: 'success' });
    } catch {
      showToast('Could not delete transaction.', { tone: 'error' });
    }
  }

  function handleExport(format) {
    const selectedItems = selected.size > 0 ? filtered.filter((t) => selected.has(t.id)) : filtered;
    if (format === 'csv') exportTransactionsToCSV(selectedItems, accounts);
    if (format === 'excel') exportTransactionsToExcel(selectedItems, accounts);
    if (format === 'pdf') exportTransactionsToPDF(selectedItems, accounts, profile?.currency || 'USD');
    setExportMenuOpen(false);
    showToast('Export ready — check your downloads.', { tone: 'success' });
  }

  return (
    <PageShell
      title="Transactions"
      subtitle="Search, filter, and manage every income and expense."
      actions={
        <>
          <div className="eq-export-menu">
            <Button variant="secondary" icon={<Download size={15} />} onClick={() => setExportMenuOpen((o) => !o)}>
              Export
            </Button>
            {exportMenuOpen && (
              <div className="eq-export-menu__dropdown">
                <button onClick={() => handleExport('csv')}>Export as CSV</button>
                <button onClick={() => handleExport('excel')}>Export as Excel</button>
                <button onClick={() => handleExport('pdf')}>Export as PDF</button>
              </div>
            )}
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setFormModal({ open: true, type: 'expense', transaction: null })}>
            Add Transaction
          </Button>
        </>
      }
    >
      <Card>
        <TransactionsToolbar filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} accounts={accounts} />
        <BulkActionsBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onDelete={handleBulkDelete}
          onExport={() => handleExport('csv')}
        />

        {pageItems.length === 0 ? (
          <EmptyState
            icon={<Inbox size={32} />}
            title="No transactions found"
            description="Try adjusting your filters, or add your first transaction."
            action={
              <Button icon={<Plus size={16} />} onClick={() => setFormModal({ open: true, type: 'expense', transaction: null })}>
                Add Transaction
              </Button>
            }
          />
        ) : (
          <div>
            {pageItems.map((t) => (
              <div key={t.id} className="eq-tx-list-item">
                <TransactionRow
                  transaction={t}
                  account={accounts.find((a) => a.id === t.accountId)}
                  showCheckbox
                  checked={selected.has(t.id)}
                  onCheck={toggleSelect}
                  onClick={() => setFormModal({ open: true, type: t.type, transaction: t })}
                />
                <button
                  className="eq-tx-list-item__delete"
                  onClick={(e) => { e.stopPropagation(); handleSingleDelete(t.id); }}
                  aria-label="Delete transaction"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </Card>

      <TransactionFormModal
        isOpen={formModal.open}
        type={formModal.type}
        editingTransaction={formModal.transaction}
        onClose={() => setFormModal({ open: false, type: 'expense', transaction: null })}
      />
    </PageShell>
  );
}
