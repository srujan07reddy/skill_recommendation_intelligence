import { Search, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: FilterOption[];
  severityFilter?: string;
  onSeverityChange?: (value: string) => void;
  severityOptions?: FilterOption[];
  onResetFilters?: () => void;
}

export function DataTableToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search skills or competencies...',
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  severityFilter,
  onSeverityChange,
  severityOptions,
  onResetFilters,
}: DataTableToolbarProps) {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    (categoryFilter && categoryFilter !== 'ALL') ||
    (severityFilter && severityFilter !== 'ALL');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Dropdown */}
        {categoryOptions && onCategoryChange && (
          <select
            value={categoryFilter || 'ALL'}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Severity / Priority Dropdown */}
        {severityOptions && onSeverityChange && (
          <select
            value={severityFilter || 'ALL'}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
