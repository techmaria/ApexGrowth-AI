import React, { useState } from 'react';
import { X, Play, Pause, Film, Sparkles, CheckCircle2, Sliders, Volume2 } from 'lucide-react';
import { ContentOpportunity } from '../types';

interface VeoPreviewModalProps {
  opportunity: ContentOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VeoPreviewModal: React.FC<VeoPreviewModalProps> = ({
  opportunity,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        {/* Left Side: 9:16 Vertical Video Frame Simulation */}
        <div className="bg-black flex items-center justify-center p-4 sm:p-6 md:w-1/2 relative border-b md:border-b-0 md:border-r border-slate-800">
          <div className="w-56 h-[420px] rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
            {/* Top Bar inside Phone Viewport */}
            <div className="flex items-center justify-between text-[11px] text-white/80 z-10">
              <span className="font-mono text-xs font-bold text-amber-400">9:16 1080p</span>
              <span className="bg-red-500/80 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Veo 3.1
              </span>
            </div>

            {/* Simulated Dynamic Visual Scene */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/80 to-black">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center mb-3 animate-subtle-pulse">
                <Film className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 line-clamp-2 px-2 mb-1">
                {opportunity.title}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-3 px-3 italic">
                "{opportunity.hook}"
              </p>
            </div>

            {/* Bottom Audio / Subtitles Overlay */}
            <div className="z-10 bg-black/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Volume2 className="w-3 h-3" />
                  AI Voiceover
                </span>
                <span className="font-mono text-[9px]">00:04 / 00:28</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full w-1/3 animate-pulse" />
              </div>
            </div>

            {/* Play/Pause Overlay Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Right Side: Generation Metadata & Specs */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Veo Generation Specs
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Full Video Model Prompt
              </label>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-purple-300 leading-relaxed max-h-36 overflow-y-auto">
                {opportunity.veo_prompt}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Render Pipeline Settings
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Aspect Ratio</div>
                  <div className="font-bold text-slate-200 font-mono">9:16 Portrait</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Frame Rate</div>
                  <div className="font-bold text-slate-200 font-mono">60 FPS Cinematic</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Audio Sync</div>
                  <div className="font-bold text-emerald-400 font-mono">Gemini TTS Match</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Storage Target</div>
                  <div className="font-bold text-sky-400 font-mono truncate">gs://apexgrowth</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Ready for Cloud Run Worker
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
