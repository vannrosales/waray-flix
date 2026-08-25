import React from 'react';
import {
  ArrowLeft,
  SkipForward,
  Layers,
  PictureInPicture2,
  Users2,
  QrCode,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import ServerSwitcher from './ServerSwitcher';

/**
 * Top HUD navigation, title badge, action buttons, and server switcher for WatchPage.
 */
export default function WatchTopHUD({
  hudVisible,
  mediaTitle,
  type,
  currentSeason,
  currentEpisode,
  onBack,
  nextEpisodeInfo,
  onNextEpisode,
  epDrawerOpen,
  setEpDrawerOpen,
  inWatchlist,
  onToggleWatchlist,
  user,
  onOpenParty,
  onOpenShare,
  onEnterPiP,
  players,
  selectedPlayerId,
  onSelectPlayer,
  mobileMenuOpen,
  setMobileMenuOpen,
  menuRef,
}) {
  const pillBase = 'flex items-center gap-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg transition cursor-pointer text-xs';
  const pillDark = `${pillBase} bg-[#0E1017]/90 hover:bg-[#161922] text-zinc-300 hover:text-white`;

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
        hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      {/* Gradient fade for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none"
        style={{ height: '80px' }}
      />

      <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4 pointer-events-auto">
        {/* LEFT: Back + Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBack}
            className={`${pillDark} px-2.5 py-1.5 flex-shrink-0`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {mediaTitle && (
            <div className="min-w-0 flex items-center gap-1.5 bg-[#0E1017]/80 px-2.5 py-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
              <span className="text-[11px] font-medium text-zinc-200 truncate max-w-[120px] sm:max-w-[220px] md:max-w-none">
                {mediaTitle}
              </span>
              {type === 'tv' && (
                <span className="text-[10px] text-zinc-400 flex-shrink-0">
                  S{currentSeason}·E{currentEpisode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Next Ep — TV only */}
          {type === 'tv' && nextEpisodeInfo && (
            <button
              onClick={onNextEpisode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-black text-xs font-semibold transition cursor-pointer shadow-lg hover:scale-105"
              title={`S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode}`}
            >
              <SkipForward className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">Next</span>
            </button>
          )}

          {/* Episodes drawer — TV only */}
          {type === 'tv' && (
            <button
              onClick={() => setEpDrawerOpen(!epDrawerOpen)}
              className={`${pillDark} px-2.5 py-1.5`}
              title="Browse Episodes"
            >
              <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Quick Watchlist Toggle */}
          <button
            onClick={onToggleWatchlist}
            className={`${
              inWatchlist
                ? 'flex items-center gap-1.5 rounded-full backdrop-blur-xl shadow-lg transition cursor-pointer text-xs px-2.5 py-1.5 bg-white text-black border border-white/20'
                : `${pillDark} px-2.5 py-1.5`
            }`}
            title={user ? (inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist') : 'Sign in to save to Watchlist'}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
            <span className="hidden lg:inline">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
          </button>

          {/* PiP Mini Player */}
          <button
            onClick={onEnterPiP}
            className={`${pillDark} px-2.5 py-1.5`}
            title="Mini Player"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Mini Player</span>
          </button>

          {/* Watch Party */}
          <button
            onClick={onOpenParty}
            className={`${pillDark} px-2.5 py-1.5`}
            title={user ? 'Watch Party' : 'Sign in to start a Watch Party'}
          >
            <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Party</span>
          </button>

          {/* QR Phone Sync */}
          <button
            onClick={onOpenShare}
            className={`${pillDark} px-2.5 py-1.5`}
            title="Phone Sync (QR)"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Phone Sync</span>
          </button>

          {/* Server Switcher */}
          <ServerSwitcher
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onSelectPlayer}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            menuRef={menuRef}
            pillDark={pillDark}
          />
        </div>
      </div>
    </div>
  );
}

