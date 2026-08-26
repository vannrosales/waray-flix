import { describe, it, expect, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';

describe('Admin Service & Announcements', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('authenticates valid admin credentials', () => {
    const res = adminService.authenticate('admin', 'warayflix2026');
    expect(res.success).toBe(true);
    expect(adminService.isAuthenticated()).toBe(true);
  });

  it('rejects invalid credentials', () => {
    const res = adminService.authenticate('admin', 'wrongpassword');
    expect(res.success).toBe(false);
    expect(adminService.isAuthenticated()).toBe(false);
  });

  it('saves and retrieves global announcements', () => {
    const payload = {
      active: true,
      type: 'maintenance',
      title: 'Server Upgrades',
      message: 'Maintenance in progress.'
    };
    adminService.saveAnnouncement(payload);
    const active = adminService.getAnnouncement();
    expect(active).not.toBeNull();
    expect(active.title).toBe('Server Upgrades');
    expect(active.type).toBe('maintenance');
  });

  it('clears active announcement', () => {
    adminService.saveAnnouncement({
      active: true,
      type: 'maintenance',
      title: 'Server Upgrades',
      message: 'Maintenance in progress.'
    });
    adminService.clearAnnouncement();
    expect(adminService.getAnnouncement()).toBeNull();
  });

  it('handles admin logout', () => {
    adminService.authenticate('admin', 'warayflix2026');
    expect(adminService.isAuthenticated()).toBe(true);
    adminService.logout();
    expect(adminService.isAuthenticated()).toBe(false);
  });
});

