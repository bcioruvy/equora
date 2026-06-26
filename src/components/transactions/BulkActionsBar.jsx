import { Trash2, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import './BulkActionsBar.css';

export function BulkActionsBar({ count, onClear, onDelete, onExport }) {
  if (count === 0) return null;
  return (
    <div className="eq-bulk-bar">
      <span className="eq-bulk-bar__count">{count} selected</span>
      <div className="eq-bulk-bar__actions">
        <Button variant="ghost" size="sm" icon={<Download size={15} />} onClick={onExport}>Export</Button>
        <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={onDelete}>Delete</Button>
        <button className="eq-bulk-bar__clear" onClick={onClear} aria-label="Clear selection">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
