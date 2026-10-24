import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Edit3,
  XCircle,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  HardDrive,
  Database,
  TrendingUp,
  Flame,
  Radio,
  Sparkles,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import { ContentOpportunity } from '../types';

interface OpportunityCardProps {
  opportunity: ContentOpportunity;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove: (opp: ContentOpportunity) => void;
  onEdit: (opp: ContentOpportunity) => void;
  onReject: (opp: ContentOpportunity) => void;
  onPreviewVeo: (opp: ContentOpportunity) => void;
  onSyncToSheet?: (opp: ContentOpportunity) => void;
  onScheduleDistribution?: (opp: ContentOpportunity) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  index,
  isExpanded,
  onToggleExpand,
  onApprove,
  onEdit,
  onReject,
  onPreviewVeo,
  onSyncToSheet,
  onScheduleDistribution,
  isSelected = false,
  onToggleSelect,
}) => {
  const [copiedVeo, setCopiedVeo] = useState(false);
  const [copiedImagen, setCopiedImagen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const copyToClipboard = (text: string, type: 'veo' | 'imagen') => {
    navigator.clipboard.writeText(text);
    if (type === 'veo') {
      setCopiedVeo(true);
      setTimeout(() => setCopiedVeo(false), 2000);
    } else {
      setCopiedImagen(true);
      setTimeout(() => setCopiedImagen(false), 2000);
    }
  };

  const handleApproveClick = async () => {
    setIsApproving(true);
    await onApprove(opportunity);
    setIsApproving(false);
  };

  const getSignalBadgeColor = (signal: string) => {
    if (signal.includes('🔥') || signal.toLowerCase().includes('trend')) {
      return 'bg-amber-950/50 border-amber-500/40 text-amber-300';
    }
    if (signal.includes('📰') || signal.toLowerCase().includes('news')) {
      return 'bg-sky-950/50 border-sky-500/40 text-sky-300';
    }
    return 'bg-purple-950/50 border-purple-500/40 text-purple-300';
  };

  const getViralityTier = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Ultra Viral',
        desc: 'Top 5% Algorithm Velocity',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        flameColor: 'text-rose-400',
        barGradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
        borderGlow: 'border-rose-500/30',
        textColor: 'text-rose-400',
      };
    }
    if (score >= 80) {
      return {
        label: 'High Velocity',
        desc: 'Strong Organic Lift',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        flameColor: 'text-amber-400',
        barGradient: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500',
        borderGlow: 'border-amber-500/30',
        textColor: 'text-amber-400',
      };
    }
    if (score >= 70) {
      return {
        label: 'Steady Momentum',
        desc: 'Moderate Audience Pull',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        flameColor: 'text-yellow-400',
        barGradient: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        borderGlow: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
      };
    }
    return {
      label: 'Standard Baseline',
      desc: 'Targeted Niche Reach',
      badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
      flameColor: 'text-slate-400',
      barGradient: 'bg-gradient-to-r from-slate-500 to-yellow-500',
      borderGlow: 'border-slate-700/40',
      textColor: 'text-slate-400',
    };
  };

  const isApproved = opportunity.status === 'APPROVED' || opportunity.status === 'DISPATCHED';
  const isRejected = opportunity.status === 'REJECTED';
  const viralityTier = getViralityTier(opportunity.viralityScore);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-indigo-950/25 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : isApproved
          ? 'bg-emerald-950/15 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
          : isRejected
          ? 'bg-rose-950/10 border-rose-900/40 opacity-75'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/80 shadow-md'
      }`}
    >
      {/* Header Bar / Expander Trigger */}
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-700 hover:border-slate-500 text-transparent'
                }`}
                title={isSelected ? 'Deselect opportunity' : 'Select for bulk action'}
                aria-label={`Select ${opportunity.title}`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
            <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center font-mono">
              #{index + 1}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${getSignalBadgeColor(
                opportunity.signal
              )}`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              {opportunity.signal}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {opportunity.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Visual Virality Meter (Header Compact Gauge) */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <Flame className={`w-3.5 h-3.5 ${viralityTier.flameColor} ${opportunity.viralityScore >= 90 ? 'animate-pulse' : ''}`} />
            <span className="text-slate-400 hidden sm:inline">Virality:</span>
            <span className={`font-bold ${viralityTier.textColor}`}>{opportunity.viralityScore}</span>
            <span className="text-slate-600 text-[10px]">/100</span>

            {/* Compact Visual Progress Bar */}
            <div className="w-12 sm:w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${viralityTier.barGradient}`}
                style={{ width: `${Math.min(100, Math.max(0, opportunity.viralityScore))}%` }}
              />
            </div>
          </div>

          {/* Predicted Retention Score */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Retention:</span>
            <span className="font-bold text-emerald-400">{opportunity.predictedRetention}%</span>
          </div>

          {/* Status Badge */}
          {isApproved && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Approved
            </span>
          )}
          {isRejected && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </span>
          )}

          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-6 bg-slate-950/40">
          {/* Main 2-column layout (col_a: 2, col_b: 1) matching Streamlit app.py */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Col A (2 cols wide): Script, Hook, Prompts */}
            <div className="lg:col-span-2 space-y-4">
              {/* Visual Virality Meter & Heat Gauge Card */}
              <div className={`bg-slate-900/90 rounded-xl p-4 border ${viralityTier.borderGlow} relative overflow-hidden space-y-3 shadow-lg backdrop-blur-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${viralityTier.badgeColor}`}>
                      <Flame className={`w-4 h-4 ${viralityTier.flameColor} ${opportunity.viralityScore >= 90 ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Virality Meter
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${viralityTier.badgeColor}`}>
                          {viralityTier.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {viralityTier.desc} • Algorithmic reach potential based on hook retention.
                      </p>
                    </div>
                  </div>

                  {/* Numerical Score Gauge Badge */}
                  <div className="flex items-baseline gap-1 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                    <span className={`text-xl font-black font-mono tracking-tight ${viralityTier.textColor}`}>
                      {opportunity.viralityScore}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">/100</span>
                  </div>
                </div>

                {/* Main Visual Progress Bar / Heat Gauge */}
                <div className="space-y-1.5">
                  <div className="relative w-full h-3.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 overflow-hidden shadow-inner">
                    {/* Underlying Heat Gradient Track */}
                    <div className="absolute inset-0 opacity-15 bg-gradient-to-r from-yellow-500 via-amber-500 to-rose-600 rounded-full" />

                    {/* Dynamic Filled Gauge Bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out relative ${viralityTier.barGradient} shadow-md`}
                      style={{ width: `${Math.min(100, Math.max(5, opportunity.viralityScore))}%` }}
                    >
                      {/* Animated shimmer gleam */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Heat Gauge Scale Threshold Markers */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      0 (Cold)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70" />
                      50 (Baseline)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      75 (High Velocity)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-rose-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      90+ (Ultra Viral)
                    </span>
                  </div>
                </div>

                {/* Sub-Metrics Alignment */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Predicted Retention</span>
                    <span className="font-bold text-emerald-400 font-mono">{opportunity.predictedRetention}% Est.</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Organic Multiplier</span>
                    <span className="font-bold text-amber-300 font-mono">{(opportunity.viralityScore / 20).toFixed(1)}x Lift</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Signal Alignment</span>
                    <span className="font-bold text-sky-400 font-mono truncate block">
                      {opportunity.signal.split(' ')[0] || '🔥'} Grounded
                    </span>
                  </div>
                </div>
              </div>

              {/* Hook Box */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-indigo-900/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    0-3s Retention Hook
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Virality Score: <strong className="text-amber-400">{opportunity.viralityScore}/100</strong>
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-100 italic">
                  "{opportunity.hook}"
                </p>
              </div>

              {/* Script Outline Box */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Script Outline & Scene Beat
                  </span>
                  <div className="flex items-center gap-1">
                    {opportunity.platforms.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-950/80 p-3 rounded-lg border border-slate-800/60">
                  {opportunity.script}
                </p>
              </div>

              {/* Veo Video Prompt Box */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Veo 3.1 Video Prompt
                    </span>
                    <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">
                      9:16 Vertical • 1080p
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreviewVeo(opportunity)}
                      className="text-[11px] text-purple-300 hover:text-white px-2 py-1 rounded bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      Preview Simulation
                    </button>
                    <button
                      onClick={() => copyToClipboard(opportunity.veo_prompt, 'veo')}
                      className="text-xs text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Copy Veo prompt"
                    >
                      {copiedVeo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-purple-200/90 font-mono bg-slate-950 p-3 rounded-lg border border-purple-950/50 whitespace-pre-wrap break-words">
                  {opportunity.veo_prompt}
                </pre>
              </div>

              {/* Imagen Graphics Prompt Box */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      Imagen 3 Graphics Prompt
                    </span>
                    <span className="text-[10px] bg-sky-950/60 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono">
                      8K Ultra HD
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(opportunity.imagen_prompt, 'imagen')}
                    className="text-xs text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy Imagen prompt"
                  >
                    {copiedImagen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-xs text-sky-200/90 font-mono bg-slate-950 p-3 rounded-lg border border-sky-950/50 whitespace-pre-wrap break-words">
                  {opportunity.imagen_prompt}
                </pre>
              </div>
            </div>

            {/* Col B (1 col wide): Cloud Storage & BigQuery Status + Pipeline Indicators */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Cloud Storage Status */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-sky-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <HardDrive className="w-4 h-4" />
                    <span>Cloud Storage Status</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 break-all">
                    {opportunity.cloudStorageStatus || 'Assets Ready (gs://apexgrowth-assets-prod)'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Target URI: <code className="text-sky-300 text-[10px]">gs://apexgrowth-assets-prod/{opportunity.id}/</code>
                  </p>
                </div>

                {/* BigQuery Telemetry Status */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-indigo-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Database className="w-4 h-4" />
                    <span>BigQuery Telemetry</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                    {opportunity.bigqueryTelemetry || 'Logged to dataset social_growth_engine'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Event: <span className="text-indigo-300">OPPORTUNITY_DISCOVERY_HITL</span>
                  </p>
                </div>

                {/* Blotato Distribution Queue */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Blotato Multi-Platform
                  </span>
                  <p className="text-xs text-slate-400">
                    Automated dispatch ready for TikTok, Instagram Reels, and YouTube Shorts upon curator approval.
                  </p>
                </div>
              </div>

              {/* Rejection Feedback note if rejected */}
              {isRejected && opportunity.rejectionReason && (
                <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3 text-xs text-rose-300">
                  <strong>Rejection Note:</strong> {opportunity.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* HITL Action Buttons (c1, c2, c3, c4, c5) */}
          <div className={`pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 ${isApproved ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2.5`}>
            {/* c1: Approve & Auto-Post */}
            <button
              onClick={handleApproveClick}
              disabled={isApproving || isApproved}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isApproved
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isApproving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Queueing...</span>
                </>
              ) : isApproved ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approved</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve & Post</span>
                </>
              )}
            </button>

            {/* Social Media Distribution Scheduling button (when approved) */}
            {isApproved && onScheduleDistribution && (
              <button
                onClick={() => onScheduleDistribution(opportunity)}
                className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 hover:from-pink-600/50 hover:to-indigo-600/50 text-pink-300 border border-pink-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Schedule (IG/TT/YT)</span>
              </button>
            )}

            {/* c2: Edit Script */}
            <button
              onClick={() => onEdit(opportunity)}
              className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Script</span>
            </button>

            {/* c4: Sync to Sheet */}
            <button
              onClick={() => onSyncToSheet && onSyncToSheet(opportunity)}
              className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync to Sheet</span>
            </button>

            {/* c3: Reject */}
            <button
              onClick={() => onReject(opportunity)}
              disabled={isRejected}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                isRejected
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40 cursor-default'
                  : 'bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border-slate-800 hover:border-rose-800/50 cursor-pointer active:scale-[0.99]'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Reject #{index + 1}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
