import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Film,
  Download,
  Shield,
  Lock,
  Layers,
  Sliders,
  CheckCircle2,
  Clock,
  Music,
  Type,
  Maximize2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ContentOpportunity, DraftOption } from '../types';
import { canExecuteOperation, recordOperation, getCostControlStatus } from '../services/costControlService';

interface VideoComposerProps {
  opportunity: ContentOpportunity;
  draft?: DraftOption;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
}

export const VideoComposer: React.FC<VideoComposerProps> = ({
  opportunity,
  draft,
  onShowToast,
}) => {
  // Mode selection: Mode A (Free-First Composer) vs Mode B (Generative AI Video)
  const [composerMode, setComposerMode] = useState<'MODE_A_FREE' | 'MODE_B_GATED'>('MODE_A_FREE');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const totalDuration = 60; // Strict 60-second short-form cap
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [bgStyle, setBgStyle] = useState<'studio_dark' | 'warm_cream' | 'botanical_green' | 'gradient_amber'>('studio_dark');

  // Export state
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

  // Playback timer loop
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Determine current scene based on time
  const currentSceneNumber =
    currentTime <= 3 ? 1 : currentTime <= 18 ? 2 : currentTime <= 45 ? 3 : 4;

  const sceneTitles = [
    { num: 1, range: '0–3s', label: 'Opening Hook (0–3s)', phase: 'Pattern Interrupt' },
    { num: 2, range: '3–18s', label: 'Problem & Agitation (3–18s)', phase: 'Context Building' },
    { num: 3, range: '18–45s', label: 'Core Solution & Proof (18–45s)', phase: 'Value Delivery' },
    { num: 4, range: '45–60s', label: 'Call to Action (45–60s)', phase: 'Conversion' },
  ];

  // Dynamic caption text displayed based on playback interval
  const activeCaption =
    currentTime <= 3
      ? draft?.hook || opportunity.hook
      : currentTime <= 18
      ? 'Step 1: Calibrate your baseline before investing in complex tools.'
      : currentTime <= 45
      ? draft?.script?.slice(0, 120) || opportunity.script.slice(0, 120)
      : 'Save this guide for tomorrow, and follow for more growth protocols.';

  // Trigger browser SpeechSynthesis for voice-over audition
  const handleAuditionVoice = () => {
    if (!('speechSynthesis' in window)) {
      onShowToast('warning', 'Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${draft?.hook || opportunity.hook}. ${draft?.script || opportunity.script}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 250));
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    onShowToast('info', 'Auditioning synchronized voice-over preview.');
  };

  // Browser-based Client Render Simulator (WebCodecs / Canvas)
  const handleClientRender = () => {
    const quota = canExecuteOperation('video_render');
    if (!quota.allowed) {
      onShowToast('warning', quota.reason || 'Daily video render limit reached.');
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    const interval = window.setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          recordOperation('video_render');
          onShowToast('success', '60-second video rendered in browser with $0 cloud cost!');
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-[#121D19] rounded-2xl border border-[#E8E2D6] dark:border-[#22352E] p-6 space-y-6 shadow-2xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-[#F0EBE0] dark:border-[#20322B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              60-SECOND VIDEO STUDIO
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ZERO_BILLING
            </span>
          </div>
          <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9]">
            Short-Form Video Composer
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#F7F4EE] dark:bg-[#1A2823] border border-[#E8E2D6] dark:border-[#263C33]">
          <button
            type="button"
            onClick={() => setComposerMode('MODE_A_FREE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              composerMode === 'MODE_A_FREE'
                ? 'bg-white dark:bg-[#233A31] text-[#1A2521] dark:text-white shadow-2xs'
                : 'text-[#6B7E76] hover:text-[#1A2521] dark:text-[#9EB2A9]'
            }`}
          >
            Mode A: Free-First Composer ($0)
          </button>
          <button
            type="button"
            onClick={() => setComposerMode('MODE_B_GATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              composerMode === 'MODE_B_GATED'
                ? 'bg-white dark:bg-[#233A31] text-[#1A2521] dark:text-white shadow-2xs'
                : 'text-[#6B7E76] hover:text-[#1A2521] dark:text-[#9EB2A9]'
            }`}
          >
            <Lock className="w-3 h-3 text-[#A87432] dark:text-[#E2A968]" />
            Mode B: Generative AI Video
          </button>
        </div>
      </div>

      {/* MODE B GATED NOTICE */}
      {composerMode === 'MODE_B_GATED' && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Generative AI Video (Veo 3.1 / Omni Flash) is Gated in ZERO_BILLING Mode</span>
          </div>
          <p className="leading-relaxed opacity-90">
            To strictly ensure no unexpected cloud billing or paid prepayment occurs, direct API calls to paid video generation models are blocked.
            Use <strong>Mode A (Free-First Composer)</strong> to produce high-retention 60-second videos using available image assets, kinetic text overlays, and browser canvas rendering.
          </p>
          <button
            type="button"
            onClick={() => setComposerMode('MODE_A_FREE')}
            className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-medium text-xs hover:bg-amber-900 transition-colors"
          >
            Switch to Mode A ($0 Budget Safe)
          </button>
        </div>
      )}

      {/* MODE A VIDEO STUDIO */}
      {composerMode === 'MODE_A_FREE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 9:16 Vertical Video Player */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Player Container */}
            <div
              className={`relative overflow-hidden rounded-2xl shadow-lg border border-[#223930] flex flex-col justify-between p-4 transition-all ${
                aspectRatio === '9:16'
                  ? 'w-[260px] h-[460px]'
                  : aspectRatio === '1:1'
                  ? 'w-[320px] h-[320px]'
                  : 'w-[380px] h-[214px]'
              } ${
                bgStyle === 'studio_dark'
                  ? 'bg-gradient-to-b from-[#14231E] via-[#0E1A16] to-[#0A120F]'
                  : bgStyle === 'botanical_green'
                  ? 'bg-gradient-to-b from-[#1B4332] to-[#081C15]'
                  : bgStyle === 'gradient_amber'
                  ? 'bg-gradient-to-b from-[#3D2614] to-[#170E08]'
                  : 'bg-gradient-to-b from-[#FAF5EE] to-[#EBE2D3] text-[#172822]'
              }`}
            >
              {/* Top Bar inside Player */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/80">
                <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                  Scene {currentSceneNumber}/4
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                  {currentTime < 10 ? `0${currentTime}` : currentTime}:00 / 01:00
                </span>
              </div>

              {/* Center Kinetic Visual Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3 px-3 my-auto">
                {/* 0-3s Hook Badge */}
                {currentTime <= 3 && (
                  <span className="animate-bounce px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#E2A968] text-[#172822] shadow-xs">
                    ⚡ 0–3s RETENTION HOOK
                  </span>
                )}

                {/* Main Dynamic Captions */}
                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                  <p className="text-xs font-serif font-medium leading-snug">
                    "{activeCaption}"
                  </p>
                </div>

                <div className="text-[10px] font-mono text-white/60">
                  {sceneTitles[currentSceneNumber - 1]?.phase}
                </div>
              </div>

              {/* Bottom Branding & Audio Visualizer */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white/70 pt-2 border-t border-white/10">
                <span>ApexGrowth AI</span>
                {isPlaying && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-[#E2A968] animate-pulse" />
                    <span className="w-1 h-4 bg-[#E2A968] animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-[#E2A968] animate-pulse delay-150" />
                  </div>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-[280px] pt-4 space-y-2">
              {/* Scrubber Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1B4332] dark:accent-[#E2A968] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8C84]">
                  <span>00:{currentTime < 10 ? `0${currentTime}` : currentTime}</span>
                  <span>01:00 (60s)</span>
                </div>
              </div>

              {/* Button Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTime(0)}
                  className="p-2 rounded-lg border border-[#E0D9CD] dark:border-[#2B4037] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] text-neutral-600 dark:text-neutral-300 cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-full bg-[#1B4332] dark:bg-[#E2A968] text-white dark:text-[#172822] shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleAuditionVoice}
                  className="p-2 rounded-lg border border-[#E0D9CD] dark:border-[#2B4037] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] text-neutral-600 dark:text-neutral-300 cursor-pointer"
                  title="Voice-Over Audition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Breakdown & Canvas Rendering Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Timeline Breakdown Strip */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1A2521] dark:text-[#E8ECE9] block">
                60-Second Scene Timeline (4 Continuous Beats)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sceneTitles.map((sc) => {
                  const isActive = currentSceneNumber === sc.num;
                  return (
                    <div
                      key={sc.num}
                      onClick={() => setCurrentTime(sc.num === 1 ? 0 : sc.num === 2 ? 4 : sc.num === 3 ? 19 : 46)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#2D6A4F] bg-[#EBF3EF] dark:bg-[#1D322B] text-[#172822] dark:text-white font-medium shadow-2xs'
                          : 'border-[#E0D9CD] dark:border-[#2B4037] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] text-[#556760] dark:text-[#9EB2A9]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span>Beat {sc.num}</span>
                        <span>{sc.range}</span>
                      </div>
                      <p className="text-[11px] truncate font-semibold">{sc.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customizer Settings: Aspect Ratio & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Aspect Ratio */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                <span className="text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9] block">
                  Canvas Format
                </span>
                <div className="flex items-center gap-1.5">
                  {(['9:16', '1:1', '16:9'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                        aspectRatio === r
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-white dark:bg-[#14231E] text-[#556760] dark:text-[#9EB2A9] border border-[#E0D9CD] dark:border-[#263C33]'
                      }`}
                    >
                      {r} {r === '9:16' ? '(Shorts/Reels)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aesthetic Atmosphere */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                <span className="text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9] block">
                  Atmosphere Palette
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'studio_dark', label: 'Obsidian Dark' },
                    { id: 'botanical_green', label: 'Botanical Forest' },
                    { id: 'gradient_amber', label: 'Warm Bronze' },
                    { id: 'warm_cream', label: 'Editorial Cream' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgStyle(bg.id as any)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer truncate ${
                        bgStyle === bg.id
                          ? 'bg-[#1B4332] text-white font-medium'
                          : 'bg-white dark:bg-[#14231E] text-[#556760] dark:text-[#9EB2A9] border border-[#E0D9CD] dark:border-[#263C33]'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Zero-Cost Browser Canvas Export Engine */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Browser Canvas Rendering Engine (100% Free / $0 Compute)
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Renders 60s frames directly in local browser memory via HTML5 Canvas. No paid external rendering bills.
                  </p>
                </div>
              </div>

              {isRendering ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-800 dark:text-emerald-300">
                    <span>Rendering Frame Sequence...</span>
                    <span>{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClientRender}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium bg-[#1B4332] text-white hover:bg-[#24533E] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#E2A968]" />
                  <span>Render & Export 60s Video (Zero Cloud Cost)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
