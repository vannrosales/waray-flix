import React from 'react';
import { Film } from 'lucide-react';

/**
 * Reusable EmptyState component for catalogs, search, watchlist, and history.
 * 
 * Props:
 * - icon: LucideIcon (default: Film)
 * - title: string
 * - description: string
 * - actionText: string (optional)
 * - onAction: () => void (optional)
 */
export default function EmptyState({
  icon: Icon = Film,
  title = 'No Titles Found',
  description = 'Try exploring other categories or adjusting your filters.',
  actionText = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`py-20 px-6 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#52525B]">
        <Icon className="w-7 h-7 stroke-[1.5] opacity-60" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#09090B] font-['Outfit']">{title}</h3>
        <p className="text-xs text-[#52525B] font-normal leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

