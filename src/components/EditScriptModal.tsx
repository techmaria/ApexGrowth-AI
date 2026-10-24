import React, { useState } from 'react';
import { X, Save, Edit3, Video, Image as ImageIcon, Flame } from 'lucide-react';
import { ContentOpportunity } from '../types';

interface EditScriptModalProps {
  opportunity: ContentOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ContentOpportunity) => void;
}

export const EditScriptModal: React.FC<EditScriptModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !opportunity) return null;

  const [title, setTitle] = useState(opportunity.title);
  const [hook, setHook] = useState(opportunity.hook);
  const [script, setScript] = useState(opportunity.script);
  const [veoPrompt, setVeoPrompt] = useState(opportunity.veo_prompt);
  const [imagenPrompt, setImagenPrompt] = useState(opportunity.imagen_prompt);

  const handleSave = () => {
    onSave({
      ...opportunity,
      title,
      hook,
      script,
      veo_prompt: veoPrompt,
      imagen_prompt: imagenPrompt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Script & Prompt</h3>
              <p className="text-xs text-slate-400">Refine content outline before automated render</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Content Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Hook */}
          <div className="space-y-1.5">
            <label className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              0-3s Spoken Retention Hook
            </label>
            <textarea
              rows={2}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Script Outline */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Full Script (Visual & Narration)</label>
            <textarea
              rows={4}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans"
            />
          </div>

          {/* Veo Prompt */}
          <div className="space-y-1.5">
            <label className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              Veo 3.1 Video Prompt (9:16 Vertical)
            </label>
            <textarea
              rows={3}
              value={veoPrompt}
              onChange={(e) => setVeoPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Imagen Prompt */}
          <div className="space-y-1.5">
            <label className="font-semibold text-sky-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Imagen 3 Graphics / Thumbnail Prompt
            </label>
            <textarea
              rows={2}
              value={imagenPrompt}
              onChange={(e) => setImagenPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-200 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
