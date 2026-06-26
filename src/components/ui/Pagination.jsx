import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="eq-pagination">
      <span className="eq-pagination__info">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="eq-pagination__controls">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        <span className="eq-pagination__page">
          Page {page} of {totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
