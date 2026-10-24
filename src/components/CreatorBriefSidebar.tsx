import React from 'react';
import { Briefcase, Users, Share2, Volume2, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { CreatorBrief } from '../types';

interface CreatorBriefSidebarProps {
  brief: CreatorBrief;
  setBrief: React.Dispatch<React.SetStateAction<CreatorBrief>>;
  onScan: () => void;
  isScanning: boolean;
}

const AVAILABLE_PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'LinkedIn Video'];
const BRAND_TONES = [
  'Educational & Authoritative',
  'Humorous & Relatable',
  'Cinematic & Minimalist',
  'Contrarian & Provocative',
];

const PRESETS = [
  {
    name: 'Ergonomics & Desk Gear',
    niche: 'Ergonomic Office Furniture',
    audience: 'Remote workers & founders',
    tone: 'Educational & Authoritative',
    platforms: ['TikTok', 'Instagram Reels'],
  },
  {
    name: 'AI Productivity SaaS',
    niche: 'AI Workflow Automation Tools',
    audience: 'Software engineers & tech leads',
    tone: 'Contrarian & Provocative',
    platforms: ['TikTok', 'YouTube Shorts'],
  },
  {
    name: 'Specialty Coffee Roasters',
    niche: 'Artisanal Single-Origin Coffee',
    audience: 'Urban coffee geeks & designers',
    tone: 'Cinematic & Minimalist',
    platforms: ['Instagram Reels', 'TikTok'],
  },
];

export const CreatorBriefSidebar: React.FC<CreatorBriefSidebarProps> = ({
  brief,
  setBrief,
  onScan,
  isScanning,
}) => {
  const togglePlatform = (p: string) => {
    if (brief.platforms.includes(p)) {
      if (brief.platforms.length > 1) {
        setBrief({ ...brief, platforms: brief.platforms.filter((item) => item !== p) });
      }
    } else {
      setBrief({ ...brief, platforms: [...brief.platforms, p] });
    }
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setBrief({
      niche: preset.niche,
      audience: preset.audience,
      tone: preset.tone,
      platforms: preset.platforms,
    });
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-slate-900/60 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm space-y-6">
      {/* Step 1 Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            1
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Creator Brief
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
          Onboarding
        </span>
      </div>

      {/* Preset Quick Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Quick Test Niches
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.name}
              onClick={() => applyPreset(pr)}
              className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                brief.niche === pr.niche
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      {/* Niche Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          Niche / Business
        </label>
        <input
          type="text"
          value={brief.niche}
          onChange={(e) => setBrief({ ...brief, niche: e.target.value })}
          placeholder="e.g. Ergonomic Office Furniture"
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
        />
      </div>

      {/* Target Audience Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Target Audience
        </label>
        <input
          type="text"
          value={brief.audience}
          onChange={(e) => setBrief({ ...brief, audience: e.target.value })}
          placeholder="e.g. Remote workers & founders"
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
        />
      </div>

      {/* Target Platforms */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          Target Platforms (Auto-Format)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_PLATFORMS.map((platform) => {
            const isSelected = brief.platforms.includes(platform);
            return (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{platform}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-indigo-400 shadow-sm shadow-indigo-400' : 'bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Tone */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
          Brand Tone
        </label>
        <select
          value={brief.tone}
          onChange={(e) => setBrief({ ...brief, tone: e.target.value })}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium cursor-pointer"
        >
          {BRAND_TONES.map((tone) => (
            <option key={tone} value={tone} className="bg-slate-900 text-slate-100">
              {tone}
            </option>
          ))}
        </select>
      </div>

      {/* Trigger Scan Button */}
      <button
        onClick={onScan}
        disabled={isScanning || !brief.niche.trim()}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
          isScanning
            ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
        }`}
      >
        {isScanning ? (
          <>
            <span className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
            <span>Scanning Multi-Signal Pipeline...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>Scan Multi-Signal Pipeline</span>
          </>
        )}
      </button>

      {/* Micro Pipeline Context */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Signal Pipeline</span>
          <span className="text-emerald-400">4 Active</span>
        </div>
        <div className="flex flex-wrap gap-1 text-[10px]">
          <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-amber-500/20">Google Trends</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded text-sky-300 border border-sky-500/20">Search Grounding</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded text-purple-300 border border-purple-500/20">Industry News</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">Viral Hooks</span>
        </div>
      </div>
    </aside>
  );
};
