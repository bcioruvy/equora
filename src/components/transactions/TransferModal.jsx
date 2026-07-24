import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { transferBetweenAccounts } from '../../firebase/firestore';
import { isValidAmount } from '../../lib/validation';
import { getCurrencySymbol } from '../../lib/format';
import { format } from 'date-fns';

export function TransferModal({ isOpen, onClose }) {
  const { user, profile } = useAuth();
  const { accounts } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.fromAccountId) newErrors.fromAccountId = 'Choose a source account';
    if (!form.toAccountId) newErrors.toAccountId = 'Choose a destination account';
    if (form.fromAccountId === form.toAccountId && form.fromAccountId) newErrors.toAccountId = 'Choose a different account';
    if (!isValidAmount(form.amount)) newErrors.amount = 'Enter an amount greater than 0';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const fromAccount = accounts.find((a) => a.id === form.fromAccountId);
      const toAccount = accounts.find((a) => a.id === form.toAccountId);
      await transferBetweenAccounts(user.uid, {
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
        amount: Number(form.amount),
        date: form.date,
        fromNote: `Transfer to ${toAccount?.name || 'account'}${form.notes ? ` — ${form.notes}` : ''}`,
        toNote: `Transfer from ${fromAccount?.name || 'account'}${form.notes ? ` — ${form.notes}` : ''}`,
      });
      showToast('Transfer recorded', { tone: 'success' });
      onClose();
      setForm({ fromAccountId: '', toAccountId: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    } catch {
      showToast('Could not complete transfer. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer between accounts"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Transfer</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Select
          label="From account"
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          placeholder="Choose source account"
          value={form.fromAccountId}
          onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
          error={errors.fromAccountId}
          required
        />
        <Select
          label="To account"
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          placeholder="Choose destination account"
          value={form.toAccountId}
          onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
          error={errors.toAccountId}
          required
        />
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
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Add a note (optional)"
        />
      </form>
    </Modal>
  );
}
