import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ContentOpportunity, DraftOption } from '../types';

interface EditDraftModalProps {
  isOpen: boolean;
  opportunity: ContentOpportunity | null;
  draft: DraftOption | null;
  onClose: () => void;
  onSave: (updatedDraft: DraftOption) => void;
}

export const EditDraftModal: React.FC<EditDraftModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
}) => {
  if (!isOpen || !draft) return null;

  const [title, setTitle] = useState(draft.title);
  const [hook, setHook] = useState(draft.hook);
  const [script, setScript] = useState(draft.script);
  const [visualDirection, setVisualDirection] = useState(draft.visualDirection || '');
  const [veoPrompt, setVeoPrompt] = useState(draft.veoPrompt || '');
  const [imagenPrompt, setImagenPrompt] = useState(draft.imagenPrompt || '');

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setHook(draft.hook);
      setScript(draft.script);
      setVisualDirection(draft.visualDirection || '');
      setVeoPrompt(draft.veoPrompt || draft.visualDirection || '');
      setImagenPrompt(draft.imagenPrompt || '');
    }
  }, [draft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...draft,
      title,
      hook,
      script,
      visualDirection: veoPrompt || visualDirection,
      veoPrompt,
      imagenPrompt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121D19] border border-[#E8E2D6] dark:border-[#263C33] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between border-b border-[#F2ECE2] dark:border-[#20322B] pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
              HUMAN-IN-THE-LOOP EDIT
            </div>
            <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
              Refine sample video
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#889790] dark:text-[#8E9F97] hover:text-[#1A2521] dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Title / Angle Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              0-3s Spoken Hook (High Retention)
            </label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs font-serif text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Scene Script &amp; Caption
            </label>
            <textarea
              rows={5}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968] resize-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Veo 3.1 Multimodal Video Vision Prompt
            </label>
            <textarea
              rows={2}
              value={veoPrompt}
              onChange={(e) => setVeoPrompt(e.target.value)}
              placeholder="Cinematic vertical 9:16 prompt for Veo 3.1 video model"
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968] resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Imagen 3 Visual Asset / Thumbnail Prompt
            </label>
            <textarea
              rows={2}
              value={imagenPrompt}
              onChange={(e) => setImagenPrompt(e.target.value)}
              placeholder="High-fidelity 8k thumbnail asset prompt for Imagen 3"
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968] resize-none"
            />
          </div>

          <div className="pt-2 border-t border-[#F2ECE2] dark:border-[#20322B] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#7A8C84] dark:text-[#8E9F97] hover:text-[#1A2521] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#172822] hover:bg-[#0E1A16] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save edits</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
