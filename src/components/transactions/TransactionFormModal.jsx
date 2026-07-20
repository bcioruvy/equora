import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { addTransaction, updateTransaction } from '../../firebase/firestore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, RECURRENCE_OPTIONS } from '../../lib/constants';
import { getCurrencySymbol } from '../../lib/format';
import { validateTransactionForm } from '../../lib/validation';
import { format } from 'date-fns';
import './TransactionFormModal.css';

const emptyForm = (type) => ({
  type,
  amount: '',
  category: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  tags: '',
  paymentMethod: 'cash',
  accountId: '',
  recurrence: 'none',
});

export function TransactionFormModal({ isOpen, onClose, type = 'expense', editingTransaction = null }) {
  const { user, profile } = useAuth();
  const { accounts } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm(type));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

useEffect(() => {
    if (editingTransaction) {
      setForm({
        ...emptyForm(editingTransaction.type),
        ...editingTransaction,
        date: editingTransaction.date?.slice?.(0, 10) || format(new Date(), 'yyyy-MM-dd'),
        // tags are stored in Firestore as an array, but the Tags field is a
        // plain text input — it needs a comma-separated string, not an array.
        tags: Array.isArray(editingTransaction.tags)
          ? editingTransaction.tags.join(', ')
          : editingTransaction.tags || '',
      });
    } else if (isOpen) {
      setForm({ ...emptyForm(type), accountId: accounts[0]?.id || '' });
      setErrors({});
    }
  }, [editingTransaction, isOpen, type, accounts]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validateTransactionForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes?.trim() || '',
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        paymentMethod: form.paymentMethod,
        accountId: form.accountId,
        recurrence: form.recurrence,
      };
      if (editingTransaction) {
        await updateTransaction(user.uid, editingTransaction.id, payload);
        showToast('Transaction updated', { tone: 'success' });
      } else {
        await addTransaction(user.uid, payload);
        showToast(`${form.type === 'income' ? 'Income' : 'Expense'} added`, { tone: 'success' });
      }
      onClose();
    } catch {
      showToast('Could not save transaction. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit transaction' : form.type === 'income' ? 'Add income' : 'Add expense'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editingTransaction ? 'Save changes' : 'Add transaction'}</Button>
        </>
      }
    >
      <form className="eq-tx-form" onSubmit={handleSubmit} noValidate>
        <div className="eq-tx-form__type-toggle">
          <button
            type="button"
            className={form.type === 'income' ? 'active' : ''}
            onClick={() => setForm({ ...form, type: 'income', category: '' })}
          >
            Income
          </button>
          <button
            type="button"
            className={form.type === 'expense' ? 'active' : ''}
            onClick={() => setForm({ ...form, type: 'expense', category: '' })}
          >
            Expense
          </button>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          icon={<span style={{ fontWeight: 600 }}>{symbol}</span>}
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          error={errors.amount}
          placeholder="0.00"
          required
        />

        <div className="eq-tx-form__row">
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c.id, label: c.label }))}
            placeholder="Choose a category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={errors.category}
            required
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            error={errors.date}
            required
          />
        </div>

        <div className="eq-tx-form__row">
          <Select
            label="Account"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Choose an account"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            error={errors.accountId}
            required
          />
          <Select
            label="Payment method"
            options={PAYMENT_METHODS.map((p) => ({ value: p.id, label: p.label }))}
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          />
        </div>

        <Select
          label="Recurrence"
          options={RECURRENCE_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
          value={form.recurrence}
          onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
          hint="Set this to automatically remind you of repeating bills."
        />

        <Input
          label="Tags"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="e.g. work, family (comma separated)"
        />

        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          error={errors.notes}
          placeholder="Add a note (optional)"
          maxLength={500}
        />
      </form>
    </Modal>
  );
}
