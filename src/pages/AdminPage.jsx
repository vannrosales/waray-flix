import React, { useState, useEffect } from 'react';
import { adminService, ANNOUNCEMENT_TYPES } from '../services/adminService';
import { ShieldCheck, Megaphone, Trash2, Check, Eye, LogOut } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import AdminLoginForm from '../components/admin/AdminLoginForm';

export default function AdminPage() {
  useDocumentTitle('Administrator Console — WarayFlix');

  const [isAuthenticated, setIsAuthenticated] = useState(() => adminService.isAuthenticated());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Announcement Form State
  const [active, setActive] = useState(true);
  const [type, setType] = useState('maintenance');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const existing = adminService.getAnnouncement();
    if (existing) {
      setActive(Boolean(existing.active));
      setType(existing.type || 'maintenance');
      setTitle(existing.title || '');
      setMessage(existing.message || '');
    } else {
      setTitle('Scheduled Server Maintenance');
      setMessage('We are performing routine server upgrades. Streaming will remain fully operational.');
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const result = adminService.authenticate(username, password);
    if (result.success) {
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
    } else {
      setLoginError(result.error);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    adminService.saveAnnouncement({ active, type, title, message });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleClear = () => {
    adminService.clearAnnouncement();
    setActive(false);
    setTitle('');
    setMessage('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const selectedTypeConfig = ANNOUNCEMENT_TYPES[type] || ANNOUNCEMENT_TYPES.info;

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto space-y-10 select-none">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4 text-white stroke-[2]" />
            <span>WARAYFLIX CONTROL PANEL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Admin Broadcast Center
          </h1>
        </div>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#18181C] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        )}
      </div>

      {/* ─── Login Screen (If Not Authenticated) ─── */}
      {!isAuthenticated ? (
        <AdminLoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          loginError={loginError}
          onLogin={handleLogin}
        />
      ) : (
        /* ─── Admin Management Console ─── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Broadcast Editor */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-[#121212] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-5 h-5 text-white stroke-[2]" />
                  <h2 className="text-lg font-bold text-white">Broadcast Announcement</h2>
                </div>

                {/* Active Switch */}
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <span>Broadcast Status:</span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-white cursor-pointer"
                  />
                  <span className={active ? 'text-white font-bold' : 'text-zinc-500'}>
                    {active ? 'LIVE' : 'DISABLED'}
                  </span>
                </label>
              </div>

              {/* Announcement Type Selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  Announcement Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(ANNOUNCEMENT_TYPES).map(([key, cfg]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setType(key)}
                      className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left flex flex-col justify-between gap-1.5 ${
                        type === key
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#18181C] text-zinc-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-70">Category</span>
                      <span>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Headline / Banner Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled Maintenance Notice"
                    className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Broadcast Message Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the maintenance or feature update..."
                    className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-normal leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Publish Broadcast</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl bg-[#18181C] hover:bg-[#222228] text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Clear & Disable</span>
                </button>

                {saveSuccess && (
                  <span className="text-xs text-white font-bold animate-fade-in">
                    Broadcast published live!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Live Banner Preview & Quick Status */}
          <div className="space-y-6">
            <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <Eye className="w-4 h-4 text-white stroke-[2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Banner Preview</h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18181C] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${selectedTypeConfig.badgeColor}`}>
                    {selectedTypeConfig.label}
                  </span>
                  {active ? (
                    <span className="text-[10px] text-zinc-400 font-bold">● Active on App</span>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-bold">○ Inactive</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white truncate">{title || 'Headline'}</h4>
                <p className="text-[11px] text-zinc-400 font-normal leading-relaxed line-clamp-2">
                  {message || 'Details will appear here.'}
                </p>
              </div>
            </div>

            {/* Quick Status Deck */}
            <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-6 space-y-3 shadow-sm text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">SYSTEM METRICS</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Broadcast System</span>
                  <span className="text-white font-bold">Online</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Session Security</span>
                  <span className="text-white font-bold">Master Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

