import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { addGoal, updateGoal } from '../../firebase/firestore';
import { GOAL_TEMPLATES } from '../../lib/constants';
import { getCurrencySymbol } from '../../lib/format';
import { validateGoalForm } from '../../lib/validation';
import { format } from 'date-fns';

const emptyForm = { name: '', template: 'custom', targetAmount: '', currentAmount: '0', deadline: '' };

export function GoalFormModal({ isOpen, onClose, editingGoal = null }) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const symbol = getCurrencySymbol(profile?.currency || 'USD');

  useEffect(() => {
    if (editingGoal) {
      setForm({
        ...emptyForm,
        ...editingGoal,
        deadline: editingGoal.deadline?.slice?.(0, 10) || '',
      });
    } else if (isOpen) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [editingGoal, isOpen]);

  function handleTemplateChange(templateId) {
    const template = GOAL_TEMPLATES.find((t) => t.id === templateId);
    setForm({ ...form, template: templateId, name: templateId === 'custom' ? form.name : template?.label || form.name });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validateGoalForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        template: form.template,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount) || 0,
        deadline: form.deadline,
        status: 'active',
      };
      if (editingGoal) {
        await updateGoal(user.uid, editingGoal.id, payload);
        showToast('Goal updated', { tone: 'success' });
      } else {
        await addGoal(user.uid, payload);
        showToast('Savings goal created', { tone: 'success' });
      }
      onClose();
    } catch {
      showToast('Could not save goal. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit savings goal' : 'Create a savings goal'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editingGoal ? 'Save changes' : 'Create goal'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Select
          label="Goal template"
          options={GOAL_TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
          value={form.template}
          onChange={(e) => handleTemplateChange(e.target.value)}
        />
        <Input
          label="Goal name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Emergency Fund"
          required
        />
        <Input
          label="Target amount"
          type="number"
          step="0.01"
          min="0"
          icon={<span style={{ fontWeight: 600 }}>{symbol}</span>}
          value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          error={errors.targetAmount}
          placeholder="0.00"
          required
        />
        <Input
          label="Current progress"
          type="number"
          step="0.01"
          min="0"
          icon={<span style={{ fontWeight: 600 }}>{symbol}</span>}
          value={form.currentAmount}
          onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
          placeholder="0.00"
        />
        <Input
          label="Target date"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          error={errors.deadline}
          min={format(new Date(), 'yyyy-MM-dd')}
          required
        />
      </form>
    </Modal>
  );
}
