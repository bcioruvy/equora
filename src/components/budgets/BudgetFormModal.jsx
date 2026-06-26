import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { addBudget, updateBudget } from '../../firebase/firestore';
import { BUDGET_TYPES, EXPENSE_CATEGORIES } from '../../lib/constants';
import { getCurrencySymbol } from '../../lib/format';
import { validateBudgetForm } from '../../lib/validation';

const emptyForm = { name: '', type: 'monthly', category: '', limit: '', period: 'monthly' };

export function BudgetFormModal({ isOpen, onClose, editingBudget = null }) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  useEffect(() => {
    if (editingBudget) setForm({ ...emptyForm, ...editingBudget });
    else if (isOpen) { setForm(emptyForm); setErrors({}); }
  }, [editingBudget, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validateBudgetForm(form);
    if (form.type === 'category' && !form.category) newErrors.category = 'Choose a category';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        category: form.type === 'category' ? form.category : null,
        limit: Number(form.limit),
        period: form.period,
        startDate: new Date().toISOString(),
      };
      if (editingBudget) {
        await updateBudget(user.uid, editingBudget.id, payload);
        showToast('Budget updated', { tone: 'success' });
      } else {
        await addBudget(user.uid, payload);
        showToast('Budget created', { tone: 'success' });
      }
      onClose();
    } catch {
      showToast('Could not save budget. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit budget' : 'Create a budget'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editingBudget ? 'Save changes' : 'Create budget'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Budget name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Monthly groceries"
          required
        />
        <Select
          label="Budget type"
          options={BUDGET_TYPES.map((t) => ({ value: t.id, label: t.label }))}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        {form.type === 'category' && (
          <Select
            label="Category"
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            placeholder="Choose a category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={errors.category}
            required
          />
        )}
        <Input
          label="Limit"
          type="number"
          step="0.01"
          min="0"
          icon={<span style={{ fontWeight: 600 }}>{symbol}</span>}
          value={form.limit}
          onChange={(e) => setForm({ ...form, limit: e.target.value })}
          error={errors.limit}
          placeholder="0.00"
          required
        />
        <Select
          label="Period"
          options={[{ value: 'monthly', label: 'Monthly' }, { value: 'weekly', label: 'Weekly' }, { value: 'yearly', label: 'Yearly' }]}
          value={form.period}
          onChange={(e) => setForm({ ...form, period: e.target.value })}
        />
      </form>
    </Modal>
  );
}
