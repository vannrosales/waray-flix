import React, { useState } from 'react';
import { ShieldCheck, FileText, Scale, AlertTriangle, Mail, Check, Copy } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function LegalPage() {
  useDocumentTitle('Legal Information & DMCA — WarayFlix');
  const [copied, setCopied] = useState(false);
  const contactEmail = 'support@warayflix.vercel.app';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const legalSections = [
    {
      icon: FileText,
      title: 'No Hosting Policy',
      description:
        'WarayFlix functions solely as an aggregator that indexes publicly available content from across the web. We do not upload, store, or host any media files on our infrastructure. All streams and downloads originate from external third-party platforms.'
    },
    {
      icon: Scale,
      title: 'Content Removal Requests',
      description:
        "Since WarayFlix does not host any files, we cannot directly remove content. All removal requests must be submitted to the original hosting platforms where the content actually resides. We have no technical ability to delete files we don't control."
    },
    {
      icon: ShieldCheck,
      title: 'Copyright Concerns',
      description:
        "We respect intellectual property rights and operate within legal boundaries. If you're a copyright holder seeking to report content, we're happy to assist by directing you to the source where we discovered the material. Contact us and we'll provide what information we can."
    },
    {
      icon: AlertTriangle,
      title: 'Disclaimer',
      description:
        'WarayFlix only utilizes publicly accessible data and APIs. We maintain no ownership or control over any media content. Users are solely responsible for how they interact with third-party services accessed through our platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto space-y-10 select-none">
      {/* Page Header */}
      <div className="border-b border-white/[0.08] pb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">
          <ShieldCheck className="w-4 h-4 stroke-[2] text-white" />
          <span>COMPLIANCE & LEGAL NOTICE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          Legal Information
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-2xl leading-relaxed">
          WarayFlix operates as a content discovery platform. Please review the information below to understand how we operate and our policies regarding content.
        </p>
      </div>

      {/* 2x2 Grid of Core Legal Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {legalSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="bg-[#18181C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-3.5 shadow-sm hover:border-white/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                {section.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Full-Width Contact Information Card */}
      <div className="bg-[#18181C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
            <Mail className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Contact Information
          </h2>
        </div>

        <div className="space-y-3 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          <div className="flex flex-wrap items-center gap-2">
            <span>For general inquiries or to report issues:</span>
            <div className="inline-flex items-center gap-2 bg-[#141416] border border-white/[0.08] rounded-full px-3 py-1 text-xs font-mono text-white font-semibold">
              <span>{contactEmail}</span>
              <button
                onClick={handleCopyEmail}
                className="hover:text-white transition cursor-pointer p-0.5 text-zinc-400"
                title="Copy email address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5]" />}
              </button>
            </div>
          </div>

          <p>
            <strong className="text-white font-semibold">Important:</strong> WarayFlix does not host any content. We aggregate links to publicly available media from third-party sources. For content-specific matters, please reach out directly to the websites hosting the material.
          </p>
        </div>
      </div>
    </div>
  );
}
