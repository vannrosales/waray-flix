import React from 'react';

/**
 * Reusable full-screen and section page loader.
 * 
 * Props:
 * - text: string (default: "LOADING_CONTENT...")
 * - fullScreen: boolean (default: true)
 */
export default function PageLoader({
  text = 'LOADING_STREAM_DETAILS...',
  fullScreen = true,
}) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'py-24'} bg-[#FAFAFA] flex flex-col items-center justify-center gap-3 text-[#52525B] font-mono text-xs select-none`}>
      <div className="w-6 h-6 rounded-full border-2 border-black/10 border-t-[#09090B] animate-spin" />
      <span className="tracking-widest font-semibold text-[11px]">{text}</span>
    </div>
  );
}

