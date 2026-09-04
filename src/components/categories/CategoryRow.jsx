import * as Icons from 'lucide-react';
import { GripVertical, Pencil, Archive, ArchiveRestore, FolderPlus } from 'lucide-react';
import { IconButton, Badge } from '../ui/Misc';
import { formatMoney } from '../../lib/format';

export function CategoryRow({
  category,
  total,
  currency,
  isSubcategory,
  onOpenDetail,
  onEdit,
  onToggleArchive,
  onAddSubcategory,
  dragProps,
  isDropTarget,
  dropPosition,
}) {
  const Icon = Icons[category.icon] || Icons.Tag;
  const isIncome = category.type === 'income';

  return (
    <div
      ref={dragProps.registerRow}
      className={[
        'eq-cat-row',
        isSubcategory && 'eq-cat-row--sub',
        category.archived && 'eq-cat-row--archived',
        isDropTarget && `eq-cat-row--drop-${dropPosition}`,
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="eq-cat-row__main"
        onClick={() => onOpenDetail(category)}
      >
        <span className={`eq-cat-row__icon ${isIncome ? 'eq-cat-row__icon--income' : 'eq-cat-row__icon--expense'}`}>
          <Icon size={16} />
        </span>
        <span className="eq-cat-row__name">
          {category.name}
          {category.archived && <Badge tone="neutral">Archived</Badge>}
        </span>
      </button>

      <div className="eq-cat-row__bottom">
        <span className={`eq-cat-row__total mono-num ${isIncome ? 'eq-cat-row__total--income' : 'eq-cat-row__total--expense'}`}>
          {formatMoney(total, currency)}
        </span>

        <div className="eq-cat-row__actions">
          {!isSubcategory && onAddSubcategory && (
            <IconButton icon={<FolderPlus size={14} />} label="Add subcategory" onClick={() => onAddSubcategory(category)} />
          )}
          <IconButton icon={<Pencil size={14} />} label="Edit category" onClick={() => onEdit(category)} />
          <IconButton
            icon={category.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            label={category.archived ? 'Unarchive category' : 'Archive category'}
            onClick={() => onToggleArchive(category)}
          />
          <span
            className="eq-cat-row__grip"
            role="button"
            aria-label="Drag to reorder"
            onPointerDown={dragProps.onPointerDown}
          >
            <GripVertical size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
