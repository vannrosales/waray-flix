import { useState, useCallback } from 'react';

export function useWatchPartyChat(roomId, username) {
  const [messages, setMessages] = useState([
    { id: 'sys-1', sender: 'System', text: `Room #${roomId} active. Share invite link to sync playback.`, time: 'Just now', isSystem: true }
  ]);
  const [floatingReactions, setFloatingReactions] = useState([]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const triggerReaction = useCallback((emoji, onBroadcast) => {
    const reactionId = Date.now() + Math.random();
    const newReaction = {
      id: reactionId,
      emoji,
      left: Math.floor(20 + Math.random() * 60),
    };

    setFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2000);

    if (onBroadcast) {
      onBroadcast({ type: 'REACTION', emoji });
    }
  }, []);

  const sendMessage = useCallback((text, onBroadcast) => {
    if (!text || !text.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: username,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (onBroadcast) {
      onBroadcast({ type: 'CHAT_MESSAGE', message: newMsg });
    }
  }, [username]);

  return {
    messages,
    addMessage,
    floatingReactions,
    triggerReaction,
    sendMessage
  };
}

