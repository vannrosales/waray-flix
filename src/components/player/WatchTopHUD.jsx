import React from 'react';
import {
  ArrowLeft,
  SkipForward,
  Layers,
  PictureInPicture2,
  Users2,
  QrCode,
  Tv,
  Bookmark,
  BookmarkCheck,
  LogIn
} from 'lucide-react';
import ServerSwitcher from './ServerSwitcher';

/**
 * Highly responsive Top HUD navigation, title badge, action buttons, server switcher, and Sign In for WatchPage.
 * Always visible at the top without requiring hover.
 */
export default function WatchTopHUD({
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
  onSignIn,
  onOpenParty,
  onOpenShare,
  onOpenCast,
  onEnterPiP,
  players,
  selectedPlayerId,
  onSelectPlayer,
  mobileMenuOpen,
  setMobileMenuOpen,
  menuRef,
}) {
  const pillBase = 'flex items-center justify-center gap-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-md transition cursor-pointer text-xs';
  const pillDark = `${pillBase} bg-[#121212]/90 hover:bg-[#252525] text-zinc-300 hover:text-white`;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-auto bg-gradient-to-b from-black/95 via-black/60 to-transparent pb-6 pt-2.5 sm:pt-3 px-2 sm:px-5">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 max-w-full">
        
        {/* LEFT: Back + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
          <button
            onClick={onBack}
            className={`${pillDark} p-2 sm:px-3 sm:py-1.5 flex-shrink-0 font-bold`}
            aria-label="Go back"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {mediaTitle && (
            <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 bg-[#121212]/90 px-2.5 py-1.5 sm:px-3 rounded-full border border-white/10 backdrop-blur-xl shadow-md">
              <span className="text-xs font-bold text-white truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-[320px]">
                {mediaTitle}
              </span>
              {type === 'tv' && (
                <span className="text-[9px] sm:text-[10px] text-zinc-300 font-bold flex-shrink-0 bg-white/10 px-1.5 py-0.5 rounded">
                  S{currentSeason}·E{currentEpisode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Actions + Server Switcher + Sign In */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Next Ep — TV only */}
          {type === 'tv' && nextEpisodeInfo && (
            <button
              onClick={onNextEpisode}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer shadow-md hover:scale-105 shrink-0"
              title={`Next Episode: S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode}`}
            >
              <SkipForward className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Next Ep</span>
            </button>
          )}

          {/* Episodes drawer — TV only */}
          {type === 'tv' && (
            <button
              onClick={() => setEpDrawerOpen(!epDrawerOpen)}
              className={`${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold shrink-0`}
              title="Browse Episodes"
            >
              <Layers className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden md:inline">Episodes</span>
            </button>
          )}

          {/* Quick Watchlist Toggle */}
          <button
            onClick={onToggleWatchlist}
            className={`${
              inWatchlist
                ? 'flex items-center justify-center gap-1.5 rounded-full backdrop-blur-xl shadow-md transition cursor-pointer text-xs p-2 sm:px-3 sm:py-1.5 bg-white text-black font-bold border border-white/20'
                : `${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold`
            } shrink-0`}
            title={user ? (inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist') : 'Sign in to save to Watchlist'}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 stroke-[2]" />
            )}
            <span className="hidden lg:inline">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
          </button>

          {/* Cast to TV Button */}
          {onOpenCast && (
            <button
              onClick={onOpenCast}
              className={`${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold shrink-0 hover:text-cyan-400`}
              title="Cast to Smart TV"
            >
              <Tv className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden xl:inline">Cast TV</span>
            </button>
          )}

          {/* PiP Mini Player — Hidden on small mobile */}
          <button
            onClick={onEnterPiP}
            className={`${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold hidden sm:flex shrink-0`}
            title="Mini Player"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden xl:inline">Mini Player</span>
          </button>

          {/* Watch Party — Hidden on small mobile */}
          <button
            onClick={onOpenParty}
            className={`${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold hidden sm:flex shrink-0`}
            title={user ? 'Watch Party' : 'Sign in to start a Watch Party'}
          >
            <Users2 className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden lg:inline">Party</span>
          </button>

          {/* QR Phone Sync — Large screens only */}
          <button
            onClick={onOpenShare}
            className={`${pillDark} p-2 sm:px-3 sm:py-1.5 font-bold hidden md:flex shrink-0`}
            title="Phone Sync (QR)"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden xl:inline">Sync</span>
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

          {/* Visible Sign In / Account Button in Top HUD */}
          {user ? (
            <div className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[#121212]/90 border border-white/10 shadow-md shrink-0">
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">
                {(user.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white hidden md:inline max-w-[80px] truncate">
                {user.email?.split('@')[0]}
              </span>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer shadow-md hover:scale-105 shrink-0"
              title="Sign In to Sync"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
