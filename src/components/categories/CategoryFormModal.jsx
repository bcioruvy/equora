import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { addCategory, updateCategory } from '../../firebase/firestore';
import './CategoriesPage.css';

const ICON_OPTIONS = [
  'Wallet', 'Gift', 'Clock', 'Laptop', 'TrendingUp', 'Home', 'RotateCcw', 'Plus',
  'UtensilsCrossed', 'ShoppingBasket', 'Bus', 'Fuel', 'Plug', 'Wifi', 'Smartphone',
  'Building2', 'Landmark', 'HeartPulse', 'ShieldCheck', 'GraduationCap', 'Shirt',
  'Clapperboard', 'RefreshCcw', 'Plane', 'Users', 'HandHeart', 'Sparkles',
  'ShoppingBag', 'Dumbbell', 'AlertTriangle', 'MoreHorizontal', 'Tag',
];

export function CategoryFormModal({ isOpen, onClose, editingCategory, parentCategory, categories = [] }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSubcategory = Boolean(parentCategory) || Boolean(editingCategory?.parentId);

  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('Tag');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setType(editingCategory.type || 'expense');
      setIcon(editingCategory.icon || 'Tag');
    } else {
      setName('');
      setType(parentCategory?.type || 'expense');
      setIcon('Tag');
    }
    setError('');
  }, [editingCategory, parentCategory, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give this category a name.');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(user.uid, editingCategory.id, { name: name.trim(), icon });
      } else {
        const finalType = isSubcategory ? parentCategory.type : type;
        const finalParentId = isSubcategory ? parentCategory.id : null;
        const siblingCount = categories.filter(
          (c) => (c.parentId || null) === finalParentId && c.type === finalType
        ).length;
        await addCategory(user.uid, {
          name: name.trim(),
          type: finalType,
          parentId: finalParentId,
          order: siblingCount,
          archived: false,
          icon,
        });
      }
      showToast(editingCategory ? 'Category updated' : 'Category added', { tone: 'success' });
      onClose();
    } catch {
      showToast('Could not save category. Try again.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const title = editingCategory
    ? 'Edit category'
    : isSubcategory
    ? `New subcategory of ${parentCategory?.name}`
    : 'New category';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Save</Button>
        </>
      }
    >
      <form className="eq-cat-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          placeholder="e.g. Groceries"
          required
        />

        {!isSubcategory && (
          <div className="eq-tx-form__type-toggle">
            <button type="button" className={type === 'income' ? 'active' : ''} onClick={() => setType('income')}>
              Income
            </button>
            <button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => setType('expense')}>
              Expense
            </button>
          </div>
        )}

        <Select
          label="Icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          options={ICON_OPTIONS.map((name) => ({ value: name, label: name }))}
        />
        <div className="eq-cat-form__icon-preview">
          {(() => {
            const PreviewIcon = Icons[icon] || Icons.Tag;
            return <PreviewIcon size={20} />;
          })()}
        </div>
      </form>
    </Modal>
  );
}
