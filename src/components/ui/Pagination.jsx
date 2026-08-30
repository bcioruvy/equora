import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select } from './FormControls';
import './Pagination.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}) {
  // Keeps the "go to page" text box in sync whenever the page changes some
  // other way (arrows, first/last, filters, page size) — without this the
  // box could keep showing a stale page number after e.g. a filter change
  // clamps the real page elsewhere.
  const [pageInput, setPageInput] = useState(String(page));
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  function commitPageInput() {
    const parsed = parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(totalPages, Math.max(1, parsed));
    setPageInput(String(clamped));
    if (clamped !== page) onPageChange(clamped);
  }

  return (
    <div className="eq-pagination">
      <div className="eq-pagination__left">
        <span className="eq-pagination__info">
          Showing {start}–{end} of {totalItems}
        </span>
        {onPageSizeChange && (
          <div className="eq-pagination__page-size">
            <span className="eq-pagination__page-size-label">Rows per page</span>
            <Select
              className="eq-pagination__page-size-select"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            />
          </div>
        )}
      </div>

      <div className="eq-pagination__controls">
        <button onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
          <ChevronsLeft size={16} />
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>

        <span className="eq-pagination__page">
          Page{' '}
          <input
            type="text"
            inputMode="numeric"
            className="eq-pagination__page-input"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={commitPageInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            aria-label="Go to page"
          />{' '}
          of {totalPages}
        </span>

        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
