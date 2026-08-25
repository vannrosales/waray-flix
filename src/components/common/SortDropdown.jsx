import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

/**
 * Reusable sort dropdown selector component.
 * 
 * Props:
 * - options: Array<{ id: string, label: string }>
 * - value: string
 * - onChange: (newSortId: string) => void
 * - label: string (optional, default "SORT:")
 */
export default function SortDropdown({
  options = [],
  value,
  onChange,
  label = 'SORT:',
  className = '',
}) {
  if (!options || options.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <span className="text-[11px] font-mono text-[#52525B] flex items-center gap-1 font-semibold">
        <SlidersHorizontal className="w-3 h-3 stroke-[1.5]" />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/[0.04] hover:bg-black/[0.08] text-[#09090B] text-xs font-mono font-medium rounded-full px-3 py-1 border border-black/[0.08] outline-none cursor-pointer transition"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-white text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

