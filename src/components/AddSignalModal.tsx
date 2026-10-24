import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SignalCategory, ContentOpportunity } from '../types';

interface AddSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSignal: Partial<ContentOpportunity>) => void;
  defaultNiche: string;
}

const CATEGORIES: SignalCategory[] = [
  'Trend',
  'News',
  'Personal idea',
  'Event',
  'Creative reference',
];

export const AddSignalModal: React.FC<AddSignalModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultNiche,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SignalCategory>('Trend');
  const [sourceContext, setSourceContext] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      signalType: category,
      sourceContext: sourceContext.trim() || 'Observation',
      hook: description.trim() || title.trim(),
      script: description.trim() || title.trim(),
      niche: defaultNiche,
      status: 'QUEUED',
      dateAdded: 'RECENT',
    });

    setTitle('');
    setSourceContext('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121D19] border border-[#E8E2D6] dark:border-[#263C33] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl transition-colors">
        <div className="flex items-center justify-between border-b border-[#F2ECE2] dark:border-[#20322B] pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
              SIGNAL
            </div>
            <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
              Add signal
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
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1 px-2.5 rounded-md border text-center transition-colors cursor-pointer text-xs ${
                    category === cat
                      ? 'bg-[#172822] dark:bg-[#E2A968] text-white dark:text-[#14231E] border-[#172822] dark:border-[#E2A968] font-medium'
                      : 'bg-[#FAF8F5] dark:bg-[#172520] text-[#556760] dark:text-[#BAC7C1] border-[#E0D9CD] dark:border-[#263C33] hover:border-[#172822] dark:hover:border-[#E2A968]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. The "plant shelfie" reset'
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Source (optional)
            </label>
            <input
              type="text"
              value={sourceContext}
              onChange={(e) => setSourceContext(e.target.value)}
              placeholder="e.g. Shop calendar, Observation"
              className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E0D9CD] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] focus:outline-none focus:border-[#172822] dark:focus:border-[#E2A968]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4D5E57] dark:text-[#9FB1A9] mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What perspective or hook do you bring?"
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
              className="px-4 py-1.5 rounded-lg bg-[#172822] hover:bg-[#0E1A16] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-medium cursor-pointer shadow-xs transition-colors"
            >
              Save signal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
