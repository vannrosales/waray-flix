import React from 'react';
import MediaCard from './MediaCard';

export default function MediaGrid({
  items = [],
  loading = false,
  skeletonCount = 10,
  mediaType = 'movie',
  onQuickView = null,
  emptyMessage = 'No titles found.',
  className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4',
}) {
  if (loading) {
    return (
      <div className={className}>
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[2/3] rounded-none shimmer-skeleton" />
            <div className="h-3 w-3/4 bg-white/[0.08] rounded-none animate-pulse" />
            <div className="h-2.5 w-1/2 bg-white/[0.04] rounded-none animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          mediaType={mediaType}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}
