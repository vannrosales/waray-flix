import React, { useState, useRef, useEffect } from 'react';
import { Users2, Send, Zap, RotateCw, Wifi, WifiOff } from 'lucide-react';
import { formatTime } from '../../hooks/useWatchParty';

const QUICK_REACTIONS = [
  { emoji: '🍿', label: 'Popcorn' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😱', label: 'Shock' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👏', label: 'Clap' },
];

export default function PartyChatDrawer({
  username,
  peersList,
  connectionStatus,
  hostTime,
  currentPlaybackSecs,
  onBroadcastSync,
  onSyncToHost,
  onTriggerReaction,
  messages,
  onSendMessage
}) {
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
  };

  return (
    <aside className="w-full md:w-80 lg:w-88 h-full bg-[#0E1017] border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col justify-between flex-shrink-0 z-30 animate-fade-in overflow-hidden">
      
      {/* Sidebar Top: Viewers Status & Quick Reactions */}
      <div className="p-2.5 sm:p-3.5 border-b border-white/[0.06] bg-[#11131A] space-y-2.5 flex-shrink-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Users2 className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
            <span className="text-[11px] sm:text-xs">Party Room ({peersList.size} Connected)</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-zinc-400">
                <Wifi className="w-2.5 h-2.5 stroke-[1.5]" /> P2P Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-600">
                <WifiOff className="w-2.5 h-2.5 stroke-[1.5]" /> Connecting
              </span>
            )}
          </div>
        </div>

        {/* Sync Controls Card */}
        <div className="p-2 rounded-xl bg-[#0E1017] border border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
            <span className="text-zinc-500">Sync:</span>
            <span className="text-zinc-200 font-medium">{formatTime(hostTime || currentPlaybackSecs)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={onBroadcastSync}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-[10px] sm:text-xs font-mono transition cursor-pointer flex items-center justify-center gap-1 border border-white/[0.08]"
            >
              <Zap className="w-3 h-3 stroke-[1.5]" />
              <span>Sync All</span>
            </button>

            <button
              onClick={onSyncToHost}
              className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-zinc-200 text-[10px] sm:text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCw className="w-3 h-3 stroke-[1.5]" />
              <span>Catch Up</span>
            </button>
          </div>
        </div>

        {/* Quick Reactions Bar */}
        <div className="flex items-center justify-between bg-[#0E1017] p-1 rounded-xl border border-white/[0.06]">
          {QUICK_REACTIONS.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onTriggerReaction(r.emoji)}
              className="p-1 sm:p-1.5 hover:scale-125 rounded-lg hover:bg-white/[0.06] transition text-sm sm:text-base cursor-pointer"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream Messages List */}
      <div className="flex-1 p-2.5 sm:p-3.5 overflow-y-auto space-y-1.5 sm:space-y-2 font-sans min-h-0">
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`space-y-0.5 ${m.isSystem ? 'text-center py-0.5' : ''}`}
          >
            {m.isSystem ? (
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 bg-white/[0.02] px-2 py-0.5 rounded-full border border-white/[0.04] inline-block">
                {m.text}
              </span>
            ) : (
              <div className={`p-2 sm:p-2.5 rounded-xl text-xs space-y-0.5 ${
                m.sender === username 
                  ? 'bg-white/[0.04] border border-white/10 ml-3 sm:ml-4' 
                  : 'bg-[#11131A] border border-white/[0.04] mr-3 sm:mr-4'
              }`}>
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-zinc-500">
                  <span className="font-medium text-zinc-300">{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed font-light break-words text-[11px] sm:text-xs">
                  {m.text}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-white/[0.06] bg-[#11131A] flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Message room..."
          className="w-full bg-[#0E1017] border border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!messageInput.trim()}
          className="p-1.5 sm:p-2 rounded-xl bg-white text-black disabled:opacity-30 transition cursor-pointer flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </form>

    </aside>
  );
}
