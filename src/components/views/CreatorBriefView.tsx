import React, { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { CreatorBrief } from '../../types';

interface CreatorBriefViewProps {
  brief: CreatorBrief;
  onSaveBrief: (updated: CreatorBrief) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
}

const AVAILABLE_PLATFORMS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'X',
  'Facebook',
  'LinkedIn',
  'Pinterest',
  'Threads',
  'Bluesky',
];

const AVAILABLE_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese'];

export const CreatorBriefView: React.FC<CreatorBriefViewProps> = ({
  brief,
  onSaveBrief,
  onShowToast,
}) => {
  const [form, setForm] = useState<CreatorBrief>({
    businessName: brief.businessName || 'Morrow & Moss',
    niche: brief.niche || 'Independent plant shop',
    audience: brief.audience || 'Apartment dwellers and first-time plant parents',
    location: brief.location || 'Portland, Oregon',
    language: brief.language || 'English',
    tone: brief.tone || 'Warm, knowledgeable, a little playful',
    goals: brief.goals || 'Build brand affinity and increase foot traffic to weekend repotting workshops',
    referenceStyles: brief.referenceStyles || 'Warm daylight close-ups, tactile ASMR audio, honest 10-second lessons',
    platforms:
      brief.platforms && brief.platforms.length > 0
        ? brief.platforms
        : ['TikTok', 'Instagram', 'YouTube'],
  });

  const [isSaved, setIsSaved] = useState(false);

  const togglePlatform = (plat: string) => {
    setForm((prev) => {
      const exists = prev.platforms.includes(plat);
      const next = exists
        ? prev.platforms.filter((p) => p !== plat)
        : [...prev.platforms, plat];
      return { ...prev, platforms: next.length > 0 ? next : [plat] };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBrief(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onShowToast('success', 'Brief saved.');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-2 pt-2">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
          01 · ONBOARDING BRIEF
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
          Your editorial voice.
        </h1>
        <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
          Sets niche, audience, geography, language, platforms, goals and reference styles. Stored locally on this device.
        </p>
      </div>

      {/* Main Grid: Form Left (8 cols), Summary Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Card */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-white rounded-2xl border border-[#E8E2D6] p-6 sm:p-7 space-y-5 shadow-2xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Business / Creator Name
              </label>
              <input
                type="text"
                value={form.businessName || ''}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Morrow & Moss"
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Niche &amp; Domain
              </label>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                placeholder="e.g. Independent plant shop"
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
              Target Audience
            </label>
            <textarea
              rows={2}
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder="e.g. Apartment dwellers and first-time plant parents"
              className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Geography &amp; Region
              </label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Portland, Oregon"
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Language
              </label>
              <select
                value={form.language || 'English'}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors cursor-pointer"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Tone of Voice
              </label>
              <input
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="e.g. Warm, knowledgeable, playful"
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
                Goals &amp; Objectives
              </label>
              <input
                type="text"
                value={form.goals || ''}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                placeholder="e.g. Lead generation, community growth"
                className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] mb-1">
              Reference Styles &amp; Creative Formats
            </label>
            <input
              type="text"
              value={form.referenceStyles || ''}
              onChange={(e) => setForm({ ...form, referenceStyles: e.target.value })}
              placeholder="e.g. Macro close-up B-roll, tactile ASMR audio, honest 10-second lessons"
              className="w-full bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:border-[#172822] transition-colors"
            />
          </div>

          <div className="border-t border-[#F2ECE2] pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-[#4D5E57]">
                Target Distribution Channels (9 Platforms Supported via Blotato)
              </label>
              <span className="text-[10px] font-mono text-[#889790]">
                {form.platforms.length}/9 selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {AVAILABLE_PLATFORMS.map((plat) => {
                const isSelected = form.platforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#172822] text-white font-medium'
                        : 'bg-[#FAF8F5] text-[#556760] border border-[#E0D9CD] hover:border-[#172822]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#172822] hover:bg-[#0E1A16] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save onboarding brief'}</span>
            </button>
          </div>
        </form>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#172822] text-white rounded-2xl p-6 space-y-4 shadow-xs border border-[#233A31]">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#DFA058] font-semibold">
              PROTOTYPE BRIEF
            </div>

            <div>
              <h3 className="text-xl font-serif font-normal text-white">
                {form.businessName || 'Morrow & Moss'}
              </h3>
              <p className="text-xs text-[#9EB2A9] mt-0.5">{form.niche || 'Independent plant shop'}</p>
            </div>

            <div className="border-t border-[#253D34] pt-3.5 space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-mono tracking-wider text-[#7E968C] uppercase">
                  Audience &amp; Region
                </span>
                <p className="text-[#E7ECE9] mt-0.5 leading-relaxed">
                  {form.audience} · {form.location || 'Global'}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono tracking-wider text-[#7E968C] uppercase">
                  Tone &amp; Goals
                </span>
                <p className="text-[#E7ECE9] mt-0.5 leading-relaxed">
                  {form.tone}
                </p>
                {form.goals && (
                  <p className="text-[#A4B8AF] text-[11px] mt-1 italic">
                    Goal: {form.goals}
                  </p>
                )}
              </div>

              {form.referenceStyles && (
                <div>
                  <span className="block text-[10px] font-mono tracking-wider text-[#7E968C] uppercase">
                    Reference Style
                  </span>
                  <p className="text-[#E7ECE9] mt-0.5 text-[11px]">
                    {form.referenceStyles}
                  </p>
                </div>
              )}

              <div>
                <span className="block text-[10px] font-mono tracking-wider text-[#7E968C] uppercase">
                  Platforms ({form.platforms.length})
                </span>
                <p className="text-[#E7ECE9] mt-0.5 leading-relaxed">
                  {form.platforms.join(' · ')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#EBE5DA]/50 border border-[#DDD5C7] rounded-xl p-4 text-xs text-[#52635C] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#A87432] font-semibold text-[11px]">
              <Lightbulb className="w-3.5 h-3.5 text-[#A87432] shrink-0" />
              <span>Human-in-the-Loop note</span>
            </div>
            <p className="leading-relaxed">
              Every draft stays fully editable. Nothing is dispatched to any of the 9 platforms without creator review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
