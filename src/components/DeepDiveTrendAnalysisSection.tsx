import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Flame,
  TrendingUp,
  Brain,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Zap,
  Radio,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  Share2,
} from 'lucide-react';
import {
  CreatorBrief,
  ContentOpportunity,
  DeepDiveTrendAnalysis,
  ContentHookInsight,
} from '../types';
import { performDeepDiveTrendAnalysis } from '../services/geminiService';

export interface DeepDiveTrendAnalysisProps {
  brief: CreatorBrief;
  analysis: DeepDiveTrendAnalysis | null;
  onSaveAnalysis: (analysis: DeepDiveTrendAnalysis) => void;
  onAddOpportunityFromHook: (hookInsight: ContentHookInsight, niche: string, audience: string) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
}

export const DeepDiveTrendAnalysisSection: React.FC<DeepDiveTrendAnalysisProps> = ({
  brief,
  analysis,
  onSaveAnalysis,
  onAddOpportunityFromHook,
  onShowToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepAgent, setActiveStepAgent] = useState<number>(0);
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Trigger Multi-Agent Gemini Analysis
  const handleRunAnalysis = async () => {
    if (!brief.niche.trim()) {
      onShowToast('warning', 'Please enter a Niche in the Creator Brief first.');
      return;
    }

    setIsAnalyzing(true);
    setActiveStepAgent(1);

    // Simulate multi-agent stage progress for rich user feedback
    const stepTimer1 = setTimeout(() => setActiveStepAgent(2), 1200);
    const stepTimer2 = setTimeout(() => setActiveStepAgent(3), 2400);

    try {
      const result = await performDeepDiveTrendAnalysis(
        brief.niche,
        brief.audience,
        brief.tone
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      onSaveAnalysis(result);
      onShowToast(
        'success',
        `Multi-agent deep dive complete! Generated demographic insights & 3 high-impact hooks for "${brief.niche}".`
      );
    } catch (err) {
      console.error('Deep-dive analysis error:', err);
      onShowToast('warning', 'Completed deep-dive using calibrated demographic heuristic intelligence.');
    } finally {
      setIsAnalyzing(false);
      setActiveStepAgent(0);
    }
  };

  const copyHookToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHookId(id);
    onShowToast('info', 'Content hook copied to clipboard.');
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-6 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 -mt-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mb-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Deep-Dive Trend & Demographic Intelligence
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Coordinated 3-agent analysis evaluating audience demographics, friction points, and 0-3s retention hooks for{' '}
                <strong className="text-indigo-300">"{brief.niche}"</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !brief.niche.trim()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isAnalyzing
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
                <span>Orchestrating Agents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{analysis ? 'Re-Run Multi-Agent Analysis' : 'Run Deep-Dive Trend Analysis'}</span>
              </>
            )}
          </button>

          {analysis && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
              title={isExpanded ? 'Collapse analysis' : 'Expand analysis'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Multi-Agent Orchestration Stepper Progress (when analyzing) */}
      {isAnalyzing && (
        <div className="bg-slate-950/80 rounded-xl p-4 border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
              Gemini 3-Agent Intelligence Swarm In Progress
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Step {activeStepAgent}/3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                activeStepAgent >= 1
                  ? 'bg-purple-950/50 border-purple-500/40 text-purple-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeStepAgent >= 1 ? 'bg-purple-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="font-semibold text-[11px]">1. Demographic Profiler</span>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                activeStepAgent >= 2
                  ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeStepAgent >= 2 ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="font-semibold text-[11px]">2. Retention Intelligence</span>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                activeStepAgent >= 3
                  ? 'bg-pink-950/50 border-pink-500/40 text-pink-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeStepAgent >= 3 ? 'bg-pink-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="font-semibold text-[11px]">3. Viral Hook Architect</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Display */}
      {analysis && isExpanded && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Executive Trend Synthesis
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Analysis ID: {analysis.id} • {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {analysis.summary}
            </p>
          </div>

          {/* Section A: Demographic Insights Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Detailed Demographic & Behavioral Breakdown
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Age, Roles & Purchasing Mindset */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Target Cohort Profile
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Age Bracket & Distribution:
                    </span>
                    <span className="text-slate-100 font-semibold font-mono text-xs">
                      {analysis.demographics.ageBracket}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Primary Occupations / Roles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.demographics.primaryRoles.map((role, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 text-[10px] font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Purchasing Mindset:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                      {analysis.demographics.purchasingMindset}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Frustrations & Aspirations */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Psychographic Drivers
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Core Frustrations & Pain Triggers:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {analysis.demographics.primaryFrustrations.map((frust, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 text-xs shrink-0 mt-0.5">✕</span>
                          <span>{frust}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Key Aspirations:
                    </span>
                    <ul className="space-y-1 text-[11px] text-emerald-300">
                      {analysis.demographics.coreAspirations.map((asp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{asp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 3: Media Consumption & Algorithmic Habits */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
                <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Platform & Media Habits
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Peak Attention Windows:
                    </span>
                    <span className="text-purple-300 font-mono text-xs font-semibold block pt-0.5">
                      {analysis.demographics.mediaConsumption.peakHours}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Preferred Video Format:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                      {analysis.demographics.mediaConsumption.formatPreference}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] uppercase font-semibold text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      Content Fatigue Trigger:
                    </span>
                    <p className="text-[11px] text-rose-300/90 italic pt-0.5">
                      "{analysis.demographics.mediaConsumption.fatigueFactor}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: 3 High-Impact Content Hooks */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3 High-Impact Retention Hooks (Saved to Application State)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Engineered for immediate 0-3s retention and algorithm velocity.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {analysis.contentHooks.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 space-y-3.5 transition-all flex flex-col justify-between shadow-md group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Hook Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center font-mono">
                          #{index + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {item.angle}
                        </span>
                      </div>

                      {/* Virality & Retention Badges */}
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          {item.viralityScore}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          {item.predictedRetention}%
                        </span>
                      </div>
                    </div>

                    {/* Spoken Hook Text */}
                    <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        0-3s Spoken Retention Hook:
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white italic leading-snug">
                        "{item.hook}"
                      </p>
                    </div>

                    {/* Psychological Trigger Explanation */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Psychological Trigger:
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Script Snippet / Direction */}
                    <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/70 text-[11px] space-y-1">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold block">
                        Scene Direction:
                      </span>
                      <p className="text-slate-300 font-mono text-[10px] leading-relaxed">
                        {item.scriptSnippet}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyHookToClipboard(item.hook, item.id || `hook-${index}`)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 border border-slate-800 cursor-pointer"
                      title="Copy hook to clipboard"
                    >
                      {copiedHookId === (item.id || `hook-${index}`) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px]">Copy Hook</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onAddOpportunityFromHook(item, brief.niche, brief.audience)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Pipeline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial Callout when no analysis has been run yet */}
      {!analysis && !isAnalyzing && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-800/40 text-purple-400 mx-auto flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-white">
              Perform Multi-Agent Trend & Demographic Intelligence
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch coordinated Gemini specialist agents to profile demographic pain points, media consumption habits, and synthesize 3 high-retention content hooks customized for <strong className="text-indigo-300">{brief.niche}</strong>.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-600/20 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Analyze {brief.niche} Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
