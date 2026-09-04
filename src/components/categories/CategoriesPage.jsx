import { useEffect, useMemo, useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/Misc';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';
import { useCategoryDrag } from '../../hooks/useCategoryDrag';
import { computeCategoryTotals } from '../../lib/categoryTotals';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/constants';
import {
  seedDefaultCategories,
  updateCategory,
  reorderCategories,
} from '../../firebase/firestore';
import { CategoryRow } from './CategoryRow';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryDetailView } from './CategoryDetailView';
import './CategoriesPage.css';

export function CategoriesPage() {
  const { user, profile } = useAuth();
  const { categories, transactions, accounts, loading } = useData();
  const { showToast } = useToast();
  const currency = profile?.currency || 'USD';

  const [seeding, setSeeding] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, editing: null, parent: null });

  useEffect(() => {
    if (loading || seeding || categories.length > 0) return;
    setSeeding(true);
    const defaults = [
      ...INCOME_CATEGORIES.map((c) => ({ ...c, type: 'income' })),
      ...EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'expense' })),
    ];
    seedDefaultCategories(user.uid, defaults).catch(() => {
      showToast('Could not set up your categories. Try reloading.', { tone: 'error' });
    });
  }, [loading, seeding, categories.length, user, showToast]);

  const totalsMap = useMemo(() => computeCategoryTotals(categories, transactions), [categories, transactions]);

  const { dragState, registerRow, handlePointerDown } = useCategoryDrag({
    onReorder: (newOrderIds) => {
      reorderCategories(user.uid, newOrderIds.map((id, idx) => ({ id, order: idx }))).catch(() => {
        showToast('Could not save the new order. Try again.', { tone: 'error' });
      });
    },
  });

  async function handleToggleArchive(category) {
    try {
      await updateCategory(user.uid, category.id, { archived: !category.archived });
    } catch {
      showToast('Could not update category. Try again.', { tone: 'error' });
    }
  }

  if (detailCategory) {
    return (
      <PageShell title="Categories" subtitle="Every transaction filed under this category.">
        <CategoryDetailView
          category={detailCategory}
          categories={categories}
          transactions={transactions}
          accounts={accounts}
          currency={currency}
          total={totalsMap.get(detailCategory.id)?.total ?? 0}
          onBack={() => setDetailCategory(null)}
        />
      </PageShell>
    );
  }

  const topLevel = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const incomeCats = topLevel.filter((c) => c.type === 'income');
  const expenseCats = topLevel.filter((c) => c.type === 'expense');
  const subsOf = (parentId) =>
    categories.filter((c) => c.parentId === parentId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function renderSection(title, icon, list) {
    if (list.length === 0) return null;
    return (
      <Card>
        <CardHeader title={title} icon={icon} />
        <div className="eq-cat-list">
          {list.map((cat) => (
            <div key={cat.id}>
              <CategoryRow
                category={cat}
                total={totalsMap.get(cat.id)?.total ?? 0}
                currency={currency}
                onOpenDetail={setDetailCategory}
                onEdit={(c) => setFormModal({ open: true, editing: c, parent: null })}
                onToggleArchive={handleToggleArchive}
                onAddSubcategory={(parent) => setFormModal({ open: true, editing: null, parent })}
                dragProps={{
                  registerRow: (node) => registerRow(cat.id, node),
                  onPointerDown: (e) => handlePointerDown(cat, categories, e),
                }}
                isDropTarget={dragState?.overId === cat.id}
                dropPosition={dragState?.overPosition}
              />
              {subsOf(cat.id).map((sub) => (
                <CategoryRow
                  key={sub.id}
                  category={sub}
                  total={totalsMap.get(sub.id)?.total ?? 0}
                  currency={currency}
                  isSubcategory
                  onOpenDetail={setDetailCategory}
                  onEdit={(c) => setFormModal({ open: true, editing: c, parent: null })}
                  onToggleArchive={handleToggleArchive}
                  dragProps={{
                    registerRow: (node) => registerRow(sub.id, node),
                    onPointerDown: (e) => handlePointerDown(sub, categories, e),
                  }}
                  isDropTarget={dragState?.overId === sub.id}
                  dropPosition={dragState?.overPosition}
                />
              ))}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <PageShell
      title="Categories"
      subtitle="Organize income and expense categories, and see totals for each — drag the grip handle to reorder."
      actions={
        <Button icon={<Plus size={16} />} onClick={() => setFormModal({ open: true, editing: null, parent: null })}>
          Add Category
        </Button>
      }
    >
      {topLevel.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Plus size={28} />}
            title={seeding ? 'Setting up your categories…' : 'No categories yet'}
            description={seeding ? 'This only takes a moment.' : 'Add your first category to start organizing transactions.'}
          />
        </Card>
      ) : (
        <div className="eq-cat-sections">
          {renderSection('Income', <TrendingUp size={16} />, incomeCats)}
          {renderSection('Expenses', <TrendingDown size={16} />, expenseCats)}
        </div>
      )}

      <CategoryFormModal
        isOpen={formModal.open}
        editingCategory={formModal.editing}
        parentCategory={formModal.parent}
        categories={categories}
        onClose={() => setFormModal({ open: false, editing: null, parent: null })}
      />
    </PageShell>
  );
}
