import React, { useState } from 'react';
import { X, HardDrive, ShieldCheck, Copy, Check, Film, Info, ArrowUpRight } from 'lucide-react';
import { DOWNLOAD_PROVIDERS } from '../config/siteConfig';
import { getImageUrl } from '../services/tmdb';

export default function DownloadModal({
  isOpen,
  onClose,
  media,
  type = 'movie',
  season = 1,
  episode = 1
}) {
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen || !media) return null;

  const poster = getImageUrl(media.poster_path, 'posterSmall');
  const releaseYear = media.release_date?.substring(0, 4) || media.first_air_date?.substring(0, 4) || '2026';

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0E1017] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Media Preview Header */}
        <div className="flex gap-4 items-start">
          <div className="w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
            {poster ? (
              <img src={poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Film className="w-5 h-5 stroke-[1.5]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
              OFFLINE DOWNLOAD
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">
              {media.title || media.name}
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span>{releaseYear}</span>
              {type === 'tv' && (
                <>
                  <span>·</span>
                  <span className="text-zinc-300 font-semibold">Season {season} · Episode {episode}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Download Mirrors List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              VERIFIED STREAM DOWNLOAD RESOLVERS
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {DOWNLOAD_PROVIDERS.length} Active Mirrors
            </span>
          </div>

          <div className="space-y-2">
            {DOWNLOAD_PROVIDERS.map((provider) => {
              const downloadUrl = type === 'movie'
                ? provider.getMovieUrl(media.id)
                : provider.getTvUrl(media.id, season, episode);
              const isCopied = copiedId === provider.id;

              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <HardDrive className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5] group-hover:text-white transition" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white block truncate">
                        {provider.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                        <span className="text-zinc-300 font-semibold">{provider.quality}</span>
                        <span>·</span>
                        <span>{provider.speed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleCopy(downloadUrl, provider.id)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.08] transition cursor-pointer"
                      title="Copy Stream Link"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[2] text-white" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5]" />}
                    </button>

                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <span>Open Mirror</span>
                      <ArrowUpRight className="w-3 h-3 stroke-[2]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip on How to Save */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 font-medium">
            <Info className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
            <span>How to save video to your device:</span>
          </div>
          <ol className="text-[10px] font-sans text-zinc-400 space-y-0.5 list-decimal list-inside leading-relaxed">
            <li>Click <strong>"Open Mirror"</strong> on any verified provider above.</li>
            <li>In the opened video player, click the native <strong>Download Icon</strong> or right-click the video and choose <strong>"Save Video As..."</strong>.</li>
            <li>On mobile, long-press the playing video to save directly to your photos/files.</li>
          </ol>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] text-[10px] font-mono text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400 flex-shrink-0" />
          <span>Verified active stream resolvers for personal offline viewing.</span>
        </div>

      </div>
    </div>
  );
}

