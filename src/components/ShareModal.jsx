import React, { useState } from 'react';
import { X, Copy, Check, Smartphone } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, title, url }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&bgcolor=18181C&color=FFFFFF&margin=12`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up p-6 space-y-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-400">
            <Smartphone className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Send to Phone / Share</span>
          </div>
          <h3 className="text-base font-bold text-white truncate px-4">
            {title || "Scan to Stream"}
          </h3>
        </div>

        {/* QR Code Container */}
        <div className="p-3 bg-[#141416] rounded-2xl border border-white/10 w-fit mx-auto shadow-inner">
          <img 
            src={qrCodeUrl} 
            alt="Scan QR code to open on mobile" 
            className="w-48 h-48 rounded-xl object-contain"
          />
        </div>

        <p className="text-[11px] text-zinc-400 font-light max-w-xs mx-auto">
          Scan with your phone camera to continue watching seamlessly on mobile.
        </p>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 bg-[#141416] p-1.5 rounded-xl border border-white/[0.06]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent text-[11px] text-zinc-300 px-2 truncate font-mono focus:outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer ${
              copied 
                ? 'bg-white text-black font-semibold' 
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 stroke-[2]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 stroke-[1.5]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
