import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Scale, 
  Globe, 
  AlertTriangle, 
  ChevronDown, 
  Lock, 
  FileCheck2,
  Database,
  Layers,
  Cpu
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function LegalPage() {
  useDocumentTitle('Legal & DMCA Compliance — WarayFlix');
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const keyMetrics = [
    { label: 'MEDIA FILES HOSTED', value: '0 Files', desc: 'Zero local storage' },
    { label: 'ARCHITECTURE', value: 'Decentralized', desc: 'Client-side aggregation' },
    { label: 'METADATA SOURCE', value: 'TMDb API', desc: 'Open license attribution' },
    { label: 'USER PRIVACY', value: 'Local-First', desc: 'Zero tracking telemetry' },
  ];

  const navTabs = [
    { id: 'all', label: 'All Articles' },
    { id: 'dmca', label: 'DMCA Safe Harbor' },
    { id: 'hosting', label: 'Non-Hosting Policy' },
    { id: 'privacy', label: 'Data & Privacy' },
    { id: 'faq', label: 'Legal FAQ' },
  ];

  const policySections = [
    {
      id: 'hosting',
      tag: 'ARCHITECTURE',
      icon: Server,
      title: 'Non-Hosting Aggregator Protocol',
      subtitle: 'Zero Media Storage Policy',
      content:
        'WarayFlix functions strictly as an indexer and client-side web browser. We do not operate media storage servers, upload digital copies, or transmit video streams. All stream references point to third-party publicly accessible web endpoints that operate independently.'
    },
    {
      id: 'dmca',
      tag: 'COMPLIANCE',
      icon: Scale,
      title: 'DMCA Safe Harbor & Takedown Protocol',
      subtitle: 'Intellectual Property Protection',
      content:
        'In compliance with digital copyright frameworks, copyright owners should direct takedown requests directly to the external hosting entities where files are stored. WarayFlix maintains safe harbor compliance by operating solely as an informational directory.'
    },
    {
      id: 'privacy',
      tag: 'METADATA & API',
      icon: Globe,
      title: 'Third-Party Metadata Attribution',
      subtitle: 'The Movie Database (TMDb) & YouTube',
      content:
        'All media metadata, filmography credits, synopses, posters, backdrops, and trailer previews displayed across WarayFlix are dynamically retrieved via TMDb API and YouTube open embeds under standard non-commercial developer usage.'
    },
    {
      id: 'disclaimer',
      tag: 'DISCLAIMER',
      icon: AlertTriangle,
      title: 'Terms of Use & Disclaimer of Warranty',
      subtitle: 'User Responsibility Clause',
      content:
        'WarayFlix carries no affiliation with third-party stream hosters. The indexing of public internet links does not constitute endorsement. End users are responsible for ensuring compliance with intellectual property laws within their respective countries.'
    }
  ];

  const faqs = [
    {
      q: 'Does WarayFlix store or stream media from its own servers?',
      a: 'No. WarayFlix possesses zero servers containing media files. We operate purely as an indexing search engine that references publicly available embeds across the web.'
    },
    {
      q: 'How should copyright owners remove infringing content?',
      a: 'Because content resides on independent third-party web hosters, removal notices must be submitted directly to the hosting provider holding the file.'
    },
    {
      q: 'How does WarayFlix handle user bookmarks and privacy?',
      a: 'All bookmarks, watch history, and playlist states are stored on your local browser by default, using zero external tracking cookies.'
    }
  ];

  const filteredPolicies = activeTab === 'all' 
    ? policySections 
    : policySections.filter(p => p.id === activeTab);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      
      {/* ─── Hero Header & Status Badge ─── */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-white/[0.08] text-xs font-bold text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>COMPLIANCE & LEGAL FRAMEWORK</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05]">
            Legal Information & Terms
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed font-normal">
            Information regarding WarayFlix&apos;s non-hosting indexing architecture, digital copyright safe harbor guidelines, and third-party attribution.
          </p>
        </div>
      </div>

      {/* ─── 4-Card Architectural Metrics Bar ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {keyMetrics.map((metric, i) => (
          <div 
            key={i}
            className="bg-[#121212] border border-white/[0.08] rounded-2xl p-5 space-y-1 shadow-sm"
          >
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider block">
              {metric.label}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {metric.value}
            </h3>
            <p className="text-[11px] text-zinc-400 font-normal">
              {metric.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Filter Tabs & Section Selector ─── */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121212] border border-white/[0.08]">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Policy Articles Bento Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPolicies.map((policy, idx) => {
          const Icon = policy.icon;
          return (
            <div
              key={idx}
              className="bg-[#121212] border border-white/[0.08] hover:border-white/25 rounded-2xl p-6 sm:p-8 space-y-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#18181C] border border-white/[0.06]">
                    {policy.tag}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {policy.title}
                  </h2>
                  <span className="text-xs text-zinc-400 font-semibold block mt-0.5">
                    {policy.subtitle}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {policy.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Legal FAQ Accordion ─── */}
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <FileCheck2 className="w-4 h-4 text-white stroke-[2]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Legal & Architectural FAQ</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
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

      {/* ─── Client Privacy Guarantee Bar ─── */}
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-white shrink-0">
            <Lock className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-white font-bold block">Privacy-First Architecture</span>
            <span className="text-zinc-400 text-[11px]">All watch activity is stored client-side in browser memory with zero tracking profiles.</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-md bg-[#252525] text-zinc-300 text-[10px] font-bold border border-white/10">
            SSL 256-BIT ENCRYPTION
          </span>
        </div>
      </div>

    </div>
  );
}
