import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Server, 
  Bookmark, 
  Users2, 
  Clock, 
  Keyboard, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Search,
  CheckCircle2,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function HowItWorksPage() {
  useDocumentTitle('How It Works & User Guide — WarayFlix');
  const [openFaq, setOpenFaq] = useState(null);

  const guideCards = [
    {
      icon: Play,
      badge: 'STREAMING',
      title: 'Streaming & Multi-Server Switching',
      desc: 'Instant cinema playback with built-in backup servers.',
      steps: [
        'Click on any movie or series to open the detail view.',
        'Click "Watch Now" or "Start Watching" to load the fullscreen video player.',
        'If a server is buffering or slow, use the Server Switcher in the top header to instantly switch to Backup Server 2, 3, or 4.',
        'For TV Shows, click "Episodes" in the top bar to open the binge drawer and jump between episodes without reloading.'
      ]
    },
    {
      icon: Bookmark,
      badge: 'WATCHLIST',
      title: 'Frictionless 1-Click Watchlist',
      desc: 'Save your favorites locally or sync across devices.',
      steps: [
        'Click the Bookmark icon on any card or detail page to instantly save.',
        'No sign-in required: Guest saves are kept securely in your local browser.',
        'Create a free account to enable automatic cloud sync across your phone, tablet, and PC.',
        'Access your saved library anytime from the Watchlist tab in the sidebar.'
      ]
    },
    {
      icon: Users2,
      badge: 'WATCH PARTY',
      title: 'P2P Synchronized Watch Parties',
      desc: 'Watch movies and shows with friends in real-time.',
      steps: [
        'Sign in and navigate to any movie or show detail page.',
        'Click the "Watch Party" button to automatically generate a unique room.',
        'Share the room link or 6-character room code with your friends.',
        'Play, pause, and seek actions synchronize automatically with live group chat.'
      ]
    },
    {
      icon: Clock,
      badge: 'MCU TIMELINE',
      title: 'MCU & Saga Chronological Timelines',
      desc: 'Track Marvel and franchise storylines in perfect order.',
      steps: [
        'Open the Timeline page from the sidebar menu.',
        'Explore films and series arranged chronologically by story events.',
        'Filter by Phase 1 through Phase 6 or the Multiverse Saga.',
        'Check off titles as you watch them to track your complete franchise progress.'
      ]
    },
    {
      icon: Keyboard,
      badge: 'SHORTCUTS',
      title: 'Power User Keyboard Shortcuts',
      desc: 'Navigate the entire app hands-free using quick keys.',
      steps: [
        'Press "/" or "Ctrl+K / ⌘K" anywhere to open instant search.',
        'Press "D" on your keyboard for a random surprise movie pick.',
        'Press "?" anytime to view the complete keyboard shortcuts modal.',
        'While in video playback, press "S" to switch servers or "N" for the next episode.'
      ]
    },
    {
      icon: ShieldCheck,
      badge: 'BEST EXPERIENCE',
      title: 'Ad-Free Playback Recommendations',
      desc: 'How to get a smooth, pop-up free streaming experience.',
      steps: [
        'We recommend using Brave Browser or Chrome with uBlock Origin installed.',
        'This blocks external pop-ups from third-party decentralized video embed providers.',
        'Use "Phone Sync" (QR Code) on the detail page to quickly cast or open links on mobile.'
      ]
    }
  ];

  const quickFaqs = [
    {
      q: 'Do I need to pay or create an account to stream?',
      a: 'No. WarayFlix is completely free to use. You can search, browse, watch, and bookmark titles without signing in. Creating a free account is optional for cloud sync and Watch Parties.'
    },
    {
      q: 'What should I do if a video fails to load or shows an error?',
      a: 'Use the Server Switcher located in the top control bar while watching. We provide multiple fallback servers (Server 1, Server 2, Server 3, Server 4) so you can switch immediately.'
    },
    {
      q: 'Where does WarayFlix get movie and TV show data?',
      a: 'All posters, cast lists, release dates, ratings, and synopses are indexed dynamically via TMDb (The Movie Database) open API.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      
      {/* ─── Hero Header ─── */}
      <div className="space-y-4 border-b border-white/[0.08] pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-white/[0.08] text-xs font-bold text-zinc-300">
          <HelpCircle className="w-3.5 h-3.5 text-white" />
          <span>USER GUIDE & FEATURE WALKTHROUGH</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05]">
              How WarayFlix Works
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              Discover how to get the most out of WarayFlix — from seamless server switching and synchronized watch parties to chronological MCU tracking.
            </p>
          </div>

          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md shrink-0 active:scale-95"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>
      </div>

      {/* ─── 6-Card Feature Walkthrough Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {guideCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#121212] border border-white/[0.08] hover:border-white/30 rounded-2xl p-6 sm:p-7 space-y-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#18181C] border border-white/[0.06]">
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {card.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs text-zinc-300 font-normal leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── FAQ Accordion ─── */}
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <Sparkles className="w-4 h-4 text-white stroke-[2]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {quickFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="border border-white/[0.06] rounded-xl bg-[#18181C] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-white hover:text-zinc-200 transition cursor-pointer gap-3"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

