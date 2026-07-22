import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { addQuickAdd } from '../../firebase/firestore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { getCurrencySymbol } from '../../lib/format';

const emptyPreset = () => ({
  label: '',
  type: 'expense',
  amount: '',
  category: '',
  accountId: '',
  paymentMethod: 'cash',
});

export function QuickAddPresetModal({ isOpen, onClose }) {
  const { user, profile } = useAuth();
  const { accounts } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyPreset());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  function handleClose() {
    setForm(emptyPreset());
    setErrors({});
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.label.trim()) newErrors.label = 'Give this preset a short name.';
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter an amount greater than 0.';
    if (!form.category) newErrors.category = 'Choose a category.';
    if (!form.accountId) newErrors.accountId = 'Choose an account.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      await addQuickAdd(user.uid, {
        label: form.label.trim(),
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        accountId: form.accountId,
        paymentMethod: form.paymentMethod,
      });
      showToast('Quick Add saved', { tone: 'success' });
      handleClose();
    } catch {
      showToast('Could not save Quick Add. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Quick Add"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Save Quick Add</Button>
        </>
      }
    >
      <form className="eq-tx-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Preset name"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          error={errors.label}
          placeholder="e.g. Uber to office"
          required
        />

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
          <Select
            label="Account"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Choose an account"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            error={errors.accountId}
            required
          />
        </div>

        <Select
          label="Payment method"
          options={PAYMENT_METHODS.map((p) => ({ value: p.id, label: p.label }))}
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
        />
      </form>
    </Modal>
  );
}
