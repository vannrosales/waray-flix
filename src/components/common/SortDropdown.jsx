import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

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
      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
        <SlidersHorizontal className="w-3 h-3 stroke-[1.5]" />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#18181C] hover:bg-[#222228] text-white text-xs font-mono font-medium rounded-full px-3 py-1 border border-white/[0.08] outline-none cursor-pointer transition shadow-xs"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#18181C] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
