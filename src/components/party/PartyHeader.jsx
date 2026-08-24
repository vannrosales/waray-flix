import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, RotateCw, Server, Check, Copy, QrCode, MessageSquare } from 'lucide-react';
import { CONFIG } from '../../config/siteConfig';
import { formatTime } from '../../hooks/useWatchParty';

export default function PartyHeader({
  media,
  roomId,
  selectedPlayerId,
  onPlayerChange,
  hostTime,
  currentPlaybackSecs,
  onBroadcastSync,
  onSyncToHost,
  copied,
  onCopyLink,
  onOpenQR,
  chatOpen,
  onToggleChat
}) {
  const navigate = useNavigate();

  return (
    <header className="h-13 sm:h-14 bg-[#090A0F]/95 backdrop-blur-xl border-b border-white/[0.06] px-3 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
      
      {/* Left: Back & Room Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[11px] sm:text-xs font-mono text-zinc-400 hover:text-white border border-white/[0.08] transition cursor-pointer flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">BACK</span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-white font-['Outfit'] truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs">
            {media?.title || media?.name || "Watch Party"}
          </span>
          <span className="hidden xs:inline-block px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] text-[9px] sm:text-[10px] font-mono text-zinc-400 flex-shrink-0">
            #{roomId}
          </span>
        </div>
      </div>

      {/* Right Action Island */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        
        {/* Host Broadcast Sync Action */}
        <button
          onClick={onBroadcastSync}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white text-black text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition cursor-pointer hover:bg-zinc-200"
          title="Broadcast your exact playback timestamp to all viewers"
        >
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2] text-black" />
          <span className="hidden xs:inline">Sync</span>
        </button>

        {/* Guest Sync To Host Button */}
        {hostTime > 0 && Math.abs(hostTime - currentPlaybackSecs) > 3 && (
          <button
            onClick={onSyncToHost}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/20 text-white text-[10px] sm:text-xs font-mono transition cursor-pointer hover:bg-white/10"
            title="Jump to Host's playback position"
          >
            <RotateCw className="w-3 h-3 stroke-[1.5]" />
            <span className="hidden sm:inline">Catch Up ({formatTime(hostTime)})</span>
          </button>
        )}

        {/* Server Selector (Tablet / Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#11131A] p-1 rounded-full border border-white/[0.06] text-xs">
          <div className="flex items-center gap-1 px-2 text-zinc-500 font-mono text-[10px]">
            <Server className="w-3 h-3 stroke-[1.5] text-zinc-400" />
            <span>Server:</span>
          </div>
          {CONFIG.players.slice(0, 3).map((player) => (
            <button
              key={player.id}
              onClick={() => onPlayerChange(player.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                selectedPlayerId === player.id 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>

        {/* Copy Invite Link */}
        <button
          onClick={onCopyLink}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] sm:text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
          title="Copy Invite Link"
        >
          {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.5] text-white" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.5]" />}
          <span className="hidden md:inline">{copied ? 'Copied' : 'Invite'}</span>
        </button>

        {/* QR Code */}
        <button
          onClick={onOpenQR}
          className="p-1 sm:p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
          title="Scan Room QR Code"
        >
          <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        {/* Chat Panel Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono transition cursor-pointer ${
            chatOpen 
              ? 'bg-white text-black font-semibold border-white' 
              : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08]'
          }`}
          title="Toggle Room Chat & Info"
        >
          <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">Hub</span>
        </button>
      </div>

    </header>
  );
}
