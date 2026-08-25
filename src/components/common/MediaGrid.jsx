import React from 'react';
import MediaCard from './MediaCard';

/**
 * Reusable responsive MediaGrid component with built-in loading skeletons.
 * 
 * Props:
 * - items: array of media objects
 * - loading: boolean
 * - skeletonCount: number (default: 10)
 * - mediaType: 'movie' | 'tv' (fallback type)
 * - onQuickView: optional callback for quick view
 * - emptyMessage: string (default: "No titles found.")
 */
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
            <div className="aspect-[2/3] rounded-2xl shimmer-skeleton-light" />
            <div className="h-3 w-3/4 bg-black/[0.06] rounded-md animate-pulse" />
            <div className="h-2.5 w-1/2 bg-black/[0.04] rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center text-xs font-mono text-[#52525B]">
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

