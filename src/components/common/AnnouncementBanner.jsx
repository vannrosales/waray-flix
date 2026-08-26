import React, { useState, useEffect } from 'react';
import { adminService, ANNOUNCEMENT_TYPES } from '../../services/adminService';
import { Wrench, AlertTriangle, Sparkles, Bell, X } from 'lucide-react';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(() => adminService.getAnnouncement());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Initial remote fetch for incognito / new sessions
    adminService.fetchRemoteAnnouncement().then((remote) => {
      if (remote) {
        setAnnouncement(remote);
      }
    });

    // 2. Realtime listener
    const handleUpdate = (e) => {
      const current = e?.detail !== undefined ? (e.detail?.active ? e.detail : null) : adminService.getAnnouncement();
      setAnnouncement(current);
      setDismissed(false);
    };

    window.addEventListener('announcementUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('announcementUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!announcement || !announcement.active || dismissed) return null;

  const typeConfig = ANNOUNCEMENT_TYPES[announcement.type] || ANNOUNCEMENT_TYPES.info;

  const getIcon = () => {
    switch (announcement.type) {
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5 stroke-[2] shrink-0 text-amber-400" />;
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 stroke-[2] shrink-0 text-red-400" />;
      case 'update':
        return <Sparkles className="w-3.5 h-3.5 stroke-[2] shrink-0 text-blue-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 stroke-[2] shrink-0 text-white" />;
    }
  };

  return (
    <aside
      aria-label="System Announcement"
      className="w-full bg-[#121212] border-b border-white/15 px-4 py-2.5 sm:px-6 relative z-30 transition-all select-none shadow-md mt-16 md:mt-0 animate-fade-in"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {getIcon()}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeConfig.badgeColor}`}>
              {typeConfig.label}
            </span>
          </div>

          <div className="min-w-0 flex items-center gap-2 text-xs truncate">
            {announcement.title && (
              <span className="font-bold text-white truncate shrink-0">
                {announcement.title}
              </span>
            )}
            {announcement.title && <span className="text-zinc-500 hidden sm:inline">·</span>}
            <span className="text-zinc-300 font-normal truncate">
              {announcement.message}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
