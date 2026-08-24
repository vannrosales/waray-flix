import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { fetchMediaDetails } from '../services/tmdb';
import { useWatchParty } from '../hooks/useWatchParty';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PartyHeader from '../components/party/PartyHeader';
import PartyChatDrawer from '../components/party/PartyChatDrawer';
import PartyReactionsOverlay from '../components/party/PartyReactionsOverlay';
import ShareModal from '../components/ShareModal';

export default function WatchPartyPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentSeason = season ? parseInt(season) : 1;
  const currentEpisode = episode ? parseInt(episode) : 1;
  
  const [roomId] = useState(() => searchParams.get('room') || `PARTY-${id}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [username] = useState(() => `Viewer-${Math.floor(100 + Math.random() * 900)}`);

  // Ensure address bar always has ?room= parameter for 1-click sharing
  useEffect(() => {
    if (!searchParams.get('room')) {
      navigate(`/party/${type}/${id}?room=${roomId}`, { replace: true });
    }
  }, [searchParams, type, id, roomId, navigate]);

  const [media, setMedia] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // WebRTC Watch Party Engine Hook
  const {
    selectedPlayerId,
    appliedTime,
    currentPlaybackSecs,
    hostTime,
    syncKey,
    connectionStatus,
    messages,
    floatingReactions,
    peersList,
    sendMessage,
    triggerReaction,
    syncToHost,
    broadcastSync,
    adjustPlaybackTime,
    setManualPlaybackTime,
    changePlayer
  } = useWatchParty(roomId, username);

  const activePlayer = CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, appliedTime)
    : activePlayer.getTvUrl(id, currentSeason, currentEpisode, appliedTime);

  useDocumentTitle(media ? `Watch Party: ${media.title || media.name} — WarayFlix` : 'Watch Party');

  // Load Media Details
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMediaDetails(id, type || 'movie');
        setMedia(data);
      } catch (err) {
        console.error("WatchParty load error:", err);
      }
    }
    loadData();
  }, [id, type]);

  const shareUrl = `${window.location.origin}/party/${type}/${id}?room=${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy link failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090A0F] text-[#EDEDED] flex flex-col font-sans overflow-hidden select-none selection:bg-white selection:text-black">
      
      {/* Floating Reactions Overlay */}
      <PartyReactionsOverlay reactions={floatingReactions} />

      {/* Top Header Bar */}
      <PartyHeader
        media={media}
        roomId={roomId}
        selectedPlayerId={selectedPlayerId}
        onPlayerChange={changePlayer}
        hostTime={hostTime}
        currentPlaybackSecs={currentPlaybackSecs}
        onBroadcastSync={broadcastSync}
        onSyncToHost={syncToHost}
        copied={copied}
        onCopyLink={handleCopyLink}
        onOpenQR={() => setShareOpen(true)}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen(!chatOpen)}
      />

      {/* Main Body: Responsive Video Player + Chat Drawer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        
        {/* Synchronized Video Embed Frame */}
        <div className={`bg-black relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
          chatOpen 
            ? 'h-[32vh] xs:h-[36vh] sm:h-[40vh] md:h-full md:flex-1 flex-shrink-0' 
            : 'h-full flex-1'
        }`}>
          <iframe 
            src={embedUrl}
            key={`${selectedPlayerId}-${appliedTime}-${syncKey}`}
            title="Watch Party Player"
            className="w-full h-full border-0 pointer-events-auto"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </div>

        {/* Minimalist Monochrome Live Room Chat Drawer */}
        {chatOpen && (
          <div className="flex-1 md:flex-none md:h-full min-h-0 overflow-hidden flex flex-col">
            <PartyChatDrawer
              username={username}
              peersList={peersList}
              connectionStatus={connectionStatus}
              hostTime={hostTime}
              currentPlaybackSecs={currentPlaybackSecs}
              onBroadcastSync={broadcastSync}
              onSyncToHost={syncToHost}
              onAdjustTime={adjustPlaybackTime}
              onManualTime={setManualPlaybackTime}
              onTriggerReaction={triggerReaction}
              messages={messages}
              onSendMessage={sendMessage}
            />
          </div>
        )}

      </div>

      {/* Share QR Modal */}
      <ShareModal 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        title={`Watch Party: ${media?.title || media?.name || 'Room'}`} 
        url={shareUrl}
      />

    </div>
  );
}
