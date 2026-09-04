import { useRef, useState } from 'react';

// Reorders categories by dragging a grip handle, using the Pointer Events
// API (not native HTML5 drag-and-drop, which has unreliable touch support
// on iPad Safari). Dragging is always locked to the item's own sibling
// group — same parentId AND same type — so a subcategory can never be
// dropped among top-level categories (or vice versa), and an Income
// category can never end up mixed into an Expense group.
export function useCategoryDrag({ onReorder }) {
  const [dragState, setDragState] = useState(null);
  const rowRefs = useRef(new Map());

  function registerRow(id, node) {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  }

  function groupKeyFor(cat) {
    return `${cat.type}:${cat.parentId || 'root'}`;
  }

  function siblingsOf(cat, allCategories) {
    const key = groupKeyFor(cat);
    return allCategories
      .filter((c) => groupKeyFor(c) === key)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function handlePointerDown(cat, allCategories, e) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();

    const orderIds = siblingsOf(cat, allCategories).map((c) => c.id);
    const groupKey = groupKeyFor(cat);
    setDragState({ id: cat.id, groupKey, orderIds, overId: null, overPosition: null });

    function onMove(ev) {
      setDragState((prev) => {
        if (!prev) return prev;
        let overId = null;
        let overPosition = null;
        for (const id of prev.orderIds) {
          if (id === prev.id) continue;
          const node = rowRefs.current.get(id);
          if (!node) continue;
          const rect = node.getBoundingClientRect();
          if (ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
            overId = id;
            overPosition = ev.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
            break;
          }
        }
        return { ...prev, overId, overPosition };
      });
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setDragState((prev) => {
        if (prev && prev.overId) {
          const withoutDragged = prev.orderIds.filter((id) => id !== prev.id);
          const targetIdx = withoutDragged.indexOf(prev.overId);
          const insertAt = prev.overPosition === 'before' ? targetIdx : targetIdx + 1;
          withoutDragged.splice(insertAt, 0, prev.id);
          onReorder(withoutDragged);
        }
        return null;
      });
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  return { dragState, registerRow, handlePointerDown };
}
