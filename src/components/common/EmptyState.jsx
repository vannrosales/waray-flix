import React from 'react';
import { Film } from 'lucide-react';

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
      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-400">
        <Icon className="w-7 h-7 stroke-[1.5] opacity-80" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400 font-normal leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
