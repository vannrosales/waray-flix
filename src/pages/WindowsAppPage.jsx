import React from 'react';
import { 
  Monitor, 
  Download, 
  ShieldCheck, 
  Zap, 
  Play, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  HardDrive,
  Cpu,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { CONFIG } from '../config/siteConfig';

export default function WindowsAppPage() {
  useDocumentTitle('WarayFlix for Windows — Download & Setup Guide');

  const downloadUrl = CONFIG.desktopAppUrl || "https://www.mediafire.com/file/p7razjd5dvs2jlx/WarayFlix_1.0.0_x64-setup.exe/file";

  const appFeatures = [
    {
      icon: Zap,
      badge: 'PERFORMANCE',
      title: 'Zero Browser Lag',
      desc: 'Built with Rust & Tauri 2.0 to run smoothly without consuming heavy RAM like typical Chrome or Edge tabs.'
    },
    {
      icon: Layers,
      badge: 'MULTITASKING',
      title: 'System Tray & Quick Resume',
      desc: 'Minimize WarayFlix straight to your Windows taskbar tray icon and resume your movie in a single click.'
    },
    {
      icon: ShieldCheck,
      badge: 'STABILITY',
      title: 'Smart Server Failover',
      desc: 'Automatic backup server routing ensures your movies and series keep playing without broken stream errors.'
    },
    {
      icon: Play,
      badge: 'CINEMA UI',
      title: 'Pure Dark Immersion',
      desc: 'Edge-to-edge pure OLED black aesthetic with responsive keyboard shortcuts (⌘K, D, Space).'
    }
  ];

  const installSteps = [
    {
      step: '01',
      title: 'Download Installer',
      desc: 'Click the Download button below to get the official WarayFlix Windows 64-bit setup executable (WarayFlix_1.0.0_x64-setup.exe).'
    },
    {
      step: '02',
      title: 'Run Setup',
      desc: 'Open the downloaded .exe file. If prompted by Windows SmartScreen ("Windows protected your PC"), simply click "More info" and then "Run anyway".'
    },
    {
      step: '03',
      title: 'Start Streaming',
      desc: 'WarayFlix installs automatically and places a shortcut on your Desktop and Start Menu. Launch it and enjoy instant cinema streaming!'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white py-10 px-4 sm:px-8 md:px-14 select-none space-y-16 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-6 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-zinc-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Monitor className="w-3.5 h-3.5 stroke-[2] text-white" />
            <span>Official Desktop Edition</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            WarayFlix for <span className="text-white underline decoration-white/20 underline-offset-8">Windows</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            The high-precision cinema index, now engineered as a native, ultra-lightweight desktop application. Enjoy uninterrupted movies, series, and anime directly on your PC.
          </p>

          {/* Download CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download for Windows (x64)</span>
            </a>

            <div className="flex items-center gap-3 text-xs text-zinc-500 font-semibold">
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> 64-bit Architecture</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> ~15 MB Installer</span>
            </div>
          </div>
        </div>

        {/* ─── Key Desktop Features Grid ─── */}
        <div className="space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Why Use the Desktop App?
            </h2>
            <p className="text-xs text-zinc-400">Engineered for pure speed and distraction-free viewing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {appFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  className="p-6 rounded-2xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.2] transition space-y-3 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Installation Guide (3 Easy Steps) ─── */}
        <div className="space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              How to Install (Step-by-Step)
            </h2>
            <p className="text-xs text-zinc-400">Simple setup in less than 30 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {installSteps.map((step) => (
              <div 
                key={step.step}
                className="p-6 rounded-2xl bg-[#141416] border border-white/[0.08] space-y-3 relative overflow-hidden"
              >
                <span className="text-3xl font-black text-white/10 absolute top-4 right-4">
                  {step.step}
                </span>

                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-xs font-black">
                  {step.step}
                </div>

                <h3 className="text-sm font-bold text-white">
                  {step.title}
                </h3>

                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Windows SmartScreen Notice Card ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-white/[0.12] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Windows SmartScreen / Defender Prompt Notice
            </h4>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Because WarayFlix is a custom independent release, Windows SmartScreen may show a blue popup stating <i>"Windows protected your PC"</i>. This is completely standard for newly downloaded apps. Simply click <strong className="text-white">"More info"</strong> and then <strong className="text-white">"Run anyway"</strong> to complete the installation.
          </p>
        </div>

      </div>
    </div>
  );
}
