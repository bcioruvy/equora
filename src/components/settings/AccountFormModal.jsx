import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { addAccount, updateAccount } from '../../firebase/firestore';
import { ACCOUNT_TYPES } from '../../lib/constants';
import { getCurrencySymbol } from '../../lib/format';

const emptyForm = { name: '', type: 'bank', openingBalance: '0' };

export function AccountFormModal({ isOpen, onClose, editingAccount = null }) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  useEffect(() => {
    if (editingAccount) setForm({ ...emptyForm, ...editingAccount });
    else if (isOpen) { setForm(emptyForm); setErrors({}); }
  }, [editingAccount, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Give this account a name';
    if (form.openingBalance === '' || Number.isNaN(Number(form.openingBalance))) newErrors.openingBalance = 'Enter a valid amount';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), type: form.type, openingBalance: Number(form.openingBalance) };
      if (editingAccount) {
        await updateAccount(user.uid, editingAccount.id, payload);
        showToast('Account updated', { tone: 'success' });
      } else {
        await addAccount(user.uid, payload);
        showToast('Account added', { tone: 'success' });
      }
      onClose();
    } catch {
      showToast('Could not save account. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAccount ? 'Edit account' : 'Add an account'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editingAccount ? 'Save changes' : 'Add account'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Account name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Main Checking"
          required
        />
        <Select
          label="Account type"
          options={ACCOUNT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <Input
          label="Opening balance"
          type="number"
          step="0.01"
          icon={<span style={{ fontWeight: 600 }}>{symbol}</span>}
          value={form.openingBalance}
          onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
          error={errors.openingBalance}
          hint="The balance this account had before you started tracking it in Equora."
          required
        />
      </form>
    </Modal>
  );
}
