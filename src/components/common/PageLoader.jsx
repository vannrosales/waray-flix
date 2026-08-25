import React from 'react';

export default function PageLoader({
  text = 'LOADING_STREAM_DETAILS...',
  fullScreen = true,
}) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'py-24'} bg-[#000000] flex flex-col items-center justify-center gap-3 text-zinc-400 font-mono text-xs select-none`}>
      <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      <span className="tracking-widest font-semibold text-[11px] text-zinc-400">{text}</span>
    </div>
  );
}
