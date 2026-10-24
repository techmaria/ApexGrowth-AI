import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ContentOpportunity, PerformanceStats } from '../types';

interface RecordMetricsModalProps {
  opportunity: ContentOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, stats: PerformanceStats) => void;
}

export const RecordMetricsModal: React.FC<RecordMetricsModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !opportunity) return null;

  const currentStats = opportunity.performance || {
    reach: 1284,
    likes: 96,
    comments: 14,
    saves: 37,
  };

  const [reach, setReach] = useState<number>(currentStats.reach);
  const [likes, setLikes] = useState<number>(currentStats.likes);
  const [comments, setComments] = useState<number>(currentStats.comments);
  const [saves, setSaves] = useState<number>(currentStats.saves);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(opportunity.id, {
      reach: Number(reach) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      saves: Number(saves) || 0,
      edited: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121D19] border border-[#E6DFD3] dark:border-[#263C33] rounded-2xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-xl transition-colors">
        <div className="flex items-center justify-between border-b border-[#F0EBE0] dark:border-[#20322B] pb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
              PERFORMANCE RECORD
            </div>
            <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5 truncate max-w-xs">
              {opportunity.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#889790] dark:text-[#8E9F97] hover:text-[#1A2521] dark:hover:text-white rounded-lg hover:bg-[#FAF8F5] dark:hover:bg-[#192722] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-[#52635C] dark:text-[#9FB1A9] leading-relaxed">
            Record actual metrics from your platform analytics for this post.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#4B5A54] dark:text-[#9FB1A9] mb-1.5">
                Reach (Impressions)
              </label>
              <input
                type="number"
                min="0"
                value={reach}
                onChange={(e) => setReach(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E2DDD3] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] font-mono focus:outline-none focus:ring-1 focus:ring-[#1D332D] dark:focus:ring-[#E2A968]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4B5A54] dark:text-[#9FB1A9] mb-1.5">
                Likes / Reactions
              </label>
              <input
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E2DDD3] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] font-mono focus:outline-none focus:ring-1 focus:ring-[#1D332D] dark:focus:ring-[#E2A968]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4B5A54] dark:text-[#9FB1A9] mb-1.5">
                Comments
              </label>
              <input
                type="number"
                min="0"
                value={comments}
                onChange={(e) => setComments(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E2DDD3] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] font-mono focus:outline-none focus:ring-1 focus:ring-[#1D332D] dark:focus:ring-[#E2A968]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4B5A54] dark:text-[#9FB1A9] mb-1.5">
                Saves / Bookmarks
              </label>
              <input
                type="number"
                min="0"
                value={saves}
                onChange={(e) => setSaves(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FAF8F5] dark:bg-[#15221D] border border-[#E2DDD3] dark:border-[#263C33] rounded-lg px-3 py-2 text-xs text-[#1A2521] dark:text-[#E8ECE9] font-mono focus:outline-none focus:ring-1 focus:ring-[#1D332D] dark:focus:ring-[#E2A968]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0EBE0] dark:border-[#20322B] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#7A8C84] dark:text-[#8E9F97] hover:text-[#1A2521] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1D332D] hover:bg-[#152521] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save metrics</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
