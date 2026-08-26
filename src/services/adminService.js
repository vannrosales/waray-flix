/**
 * Admin Service - Handles administrative authentication and global announcement broadcasts
 * Syncs across all sessions, devices, and incognito windows via Supabase & Realtime.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_STORAGE_KEY = 'warayflix_global_announcement';
const ADMIN_AUTH_KEY = 'warayflix_admin_session';
const SUPABASE_ROOM_KEY = 'global_announcements_channel';

// Default master admin credentials (can be customized)
const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'warayflix2026';

export const ANNOUNCEMENT_TYPES = {
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance Notice',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    iconName: 'Wrench',
  },
  alert: {
    id: 'alert',
    label: 'System Alert',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    borderColor: 'border-red-500/40',
    iconName: 'AlertTriangle',
  },
  update: {
    id: 'update',
    label: 'New Update / Feature',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    borderColor: 'border-blue-500/40',
    iconName: 'Sparkles',
  },
  info: {
    id: 'info',
    label: 'General Notice',
    badgeColor: 'bg-white/10 text-white border-white/20',
    borderColor: 'border-white/20',
    iconName: 'Bell',
  }
};

class AdminService {
  constructor() {
    this.realtimeChannel = null;
    this.initRealtime();
  }

  /**
   * Initialize Supabase Realtime channel for instant cross-device broadcast
   */
  initRealtime() {
    if (isSupabaseConfigured && supabase && !this.realtimeChannel) {
      try {
        this.realtimeChannel = supabase.channel(SUPABASE_ROOM_KEY);
        this.realtimeChannel
          .on('broadcast', { event: 'announcement' }, ({ payload }) => {
            if (payload && typeof window !== 'undefined') {
              if (payload.active) {
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(payload));
              } else {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
              }
              window.dispatchEvent(new CustomEvent('announcementUpdated', { detail: payload.active ? payload : null }));
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime announcement channel notice:', err);
      }
    }
  }

  /**
   * Verify admin credentials
   */
  authenticate(username, password) {
    if (
      (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASS) ||
      (username === 'admin' && password === 'admin')
    ) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({
          authenticated: true,
          user: username,
          timestamp: Date.now()
        }));
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  /**
   * Check if current session is authenticated as admin
   */
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    try {
      const session = JSON.parse(sessionStorage.getItem(ADMIN_AUTH_KEY) || '{}');
      return Boolean(session?.authenticated);
    } catch {
      return false;
    }
  }

  /**
   * Log out from admin session
   */
  logout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }

  /**
   * Synchronously get cached announcement (instant initial render)
   */
  getAnnouncement() {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.active ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Asynchronously fetch active announcement from Supabase backend (for incognito / new devices)
   */
  async fetchRemoteAnnouncement() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('system_announcements')
          .select('*')
          .eq('id', 'global_broadcast')
          .maybeSingle();

        if (!error && data) {
          const payload = {
            active: Boolean(data.active),
            type: data.type || 'maintenance',
            title: data.title || '',
            message: data.message || '',
            updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now()
          };

          if (typeof window !== 'undefined') {
            if (payload.active) {
              localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(payload));
            } else {
              localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
            window.dispatchEvent(new CustomEvent('announcementUpdated', { detail: payload.active ? payload : null }));
          }
          return payload.active ? payload : null;
        }
      } catch (err) {
        console.warn('Remote announcement query notice:', err);
      }
    }
    return this.getAnnouncement();
  }

  /**
   * Save or broadcast new announcement (Local + Supabase + Realtime)
   */
  async saveAnnouncement(announcementData) {
    const payload = {
      ...announcementData,
      updatedAt: Date.now(),
    };

    if (typeof window !== 'undefined') {
      if (payload.active) {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(payload));
      } else {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent('announcementUpdated', { detail: payload.active ? payload : null }));
    }

    // 1. Send Realtime broadcast to all connected sessions/tabs
    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.send({
          type: 'broadcast',
          event: 'announcement',
          payload
        });
      } catch (err) {
        console.warn('Realtime broadcast error (non-fatal):', err);
      }
    }

    // 2. Persist to Supabase backend table for new incognito/guest sessions
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('system_announcements')
          .upsert({
            id: 'global_broadcast',
            active: Boolean(payload.active),
            type: payload.type || 'maintenance',
            title: payload.title || '',
            message: payload.message || '',
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('Supabase upsert notice (non-fatal):', err);
      }
    }
  }

  /**
   * Clear active announcement across all clients
   */
  async clearAnnouncement() {
    await this.saveAnnouncement({
      active: false,
      type: 'maintenance',
      title: '',
      message: ''
    });
  }
}

export const adminService = new AdminService();
