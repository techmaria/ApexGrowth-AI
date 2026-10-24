import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  Check,
  CheckCheck,
  Sparkles,
  Search,
  Flame,
  X,
} from 'lucide-react';
import { ContentOpportunity, SignalCategory } from '../../types';

interface OpportunitiesViewProps {
  opportunities: ContentOpportunity[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkApprove: () => void;
  isBulkApproving: boolean;
  onOpenAddSignalModal: () => void;
  onDeleteSignal: (id: string) => void;
  onUseInDraftStudio: (opp: ContentOpportunity) => void;
  onScanGemini: () => void;
  isScanning: boolean;
  onNavigateToTrends?: () => void;
}

const FILTER_CATEGORIES: ('All' | SignalCategory)[] = [
  'All',
  'Trend',
  'News',
  'Personal idea',
  'Event',
  'Creative reference',
];

const CATEGORY_LABELS: Record<string, string> = {
  All: 'All Signals',
  Trend: 'Trends',
  News: 'News',
  'Personal idea': 'Personal Ideas',
  Event: 'Festivals & Events',
  'Creative reference': 'Creative References',
};

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkApprove,
  isBulkApproving,
  onOpenAddSignalModal,
  onDeleteSignal,
  onUseInDraftStudio,
  onScanGemini,
  isScanning,
  onNavigateToTrends,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | SignalCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOpportunities = opportunities.filter((item) => {
    if (activeFilter !== 'All' && item.signalType !== activeFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const titleMatch = item.title?.toLowerCase().includes(query);
    const hookMatch = item.hook?.toLowerCase().includes(query);
    const scriptMatch = item.script?.toLowerCase().includes(query);
    const signalMatch = item.signal?.toLowerCase().includes(query);
    const sourceMatch = item.sourceContext?.toLowerCase().includes(query);
    const nicheMatch = item.niche?.toLowerCase().includes(query);
    const platformMatch = item.platforms?.some((p) => p.toLowerCase().includes(query));

    return Boolean(
      titleMatch ||
      hookMatch ||
      scriptMatch ||
      signalMatch ||
      sourceMatch ||
      nicheMatch ||
      platformMatch
    );
  });

  const queuedFiltered = filteredOpportunities.filter((o) => o.status === 'QUEUED');
  const selectedQueuedCount = queuedFiltered.filter((o) => selectedIds.has(o.id)).length;
  const isAllQueuedSelected =
    queuedFiltered.length > 0 && selectedQueuedCount === queuedFiltered.length;
  const isSomeQueuedSelected =
    selectedQueuedCount > 0 && selectedQueuedCount < queuedFiltered.length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
        <div className="space-y-2">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
            STAGE 02 · MULTI-SIGNAL DISCOVERY
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
            Signal queue.
          </h1>
          <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
            Scans trends, news, events, personal ideas, and references into a prioritized queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onNavigateToTrends && (
            <button
              type="button"
              onClick={onNavigateToTrends}
              className="px-3 py-2 rounded-lg border border-[#E0D9CD] hover:border-[#172822] bg-[#FAF8F5] text-[#172822] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#DFA058]" />
              <span>Trends</span>
            </button>
          )}

          <button
            onClick={onScanGemini}
            disabled={isScanning}
            className="px-3 py-2 rounded-lg border border-[#E0D9CD] hover:border-[#172822] bg-white text-[#172822] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isScanning ? (
              <div className="w-3.5 h-3.5 border-2 border-[#172822]/40 border-t-[#172822] rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#A87432]" />
            )}
            <span>{isScanning ? 'Scanning...' : 'Gemini Search Scan ($0)'}</span>
          </button>

          <button
            onClick={onOpenAddSignalModal}
            className="px-3.5 py-2 rounded-lg bg-[#172822] hover:bg-[#0E1A16] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add signal</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#172822] text-white font-medium shadow-2xs'
                    : 'bg-white text-[#63756E] border border-[#E8E2D6] hover:border-[#172822]'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#889790]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals..."
            className="w-full bg-white border border-[#E8E2D6] rounded-lg pl-8.5 pr-7 py-1.5 text-xs text-[#1A2521] placeholder-[#889790] focus:outline-none focus:border-[#172822] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#889790] hover:text-[#1A2521] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Signals List (8 cols), Inputs Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Signals List */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Bulk Selection Bar */}
          <div className="bg-white rounded-xl border border-[#E8E2D6] px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
            <label
              htmlFor="select-all-signals"
              className="flex items-center gap-2 text-xs font-medium text-[#1A2521] cursor-pointer select-none"
            >
              <input
                id="select-all-signals"
                type="checkbox"
                checked={isAllQueuedSelected && queuedFiltered.length > 0}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeQueuedSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#C4BEB2] text-[#172822] focus:ring-[#172822] cursor-pointer accent-[#172822]"
              />
              <span>
                Select queued ({queuedFiltered.length})
              </span>
            </label>

            <button
              type="button"
              onClick={onBulkApprove}
              disabled={selectedQueuedCount === 0 || isBulkApproving}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedQueuedCount > 0 && !isBulkApproving
                  ? 'bg-[#172822] text-white cursor-pointer hover:bg-[#0E1A16]'
                  : 'bg-[#F2ECE2] text-[#9EB2A9] cursor-not-allowed'
              }`}
            >
              {isBulkApproving ? (
                <span>Approving...</span>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>
                    {selectedQueuedCount > 0 ? `Bulk approve (${selectedQueuedCount})` : 'Bulk approve'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Cards List */}
          {filteredOpportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-10 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-[#A87432] mx-auto opacity-70" />
              <h3 className="text-sm font-serif font-normal text-[#1A2521]">
                No signals found
              </h3>
              <p className="text-xs text-[#7A8C84] max-w-sm mx-auto">
                Add an observation or use Search Scan to discover fresh ideas.
              </p>
            </div>
          ) : (
            filteredOpportunities.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border transition-all p-5 space-y-2.5 shadow-2xs ${
                    isSelected
                      ? 'border-[#172822] ring-1 ring-[#172822]/20'
                      : 'border-[#E8E2D6] hover:border-[#CAD4CE]'
                  }`}
                >
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#73847C]">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(item.id)}
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-[#172822] border-[#172822] text-white'
                            : 'bg-white border-[#C4BEB2] text-transparent'
                        }`}
                        title={isSelected ? 'Deselect' : 'Select'}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </button>

                      <span className="font-mono uppercase font-semibold text-[#8B9892]">
                        {CATEGORY_LABELS[item.signalType || 'Trend'] || item.signalType || 'Trend'}
                      </span>
                      {item.sourceContext && (
                        <>
                          <span>·</span>
                          <span className="truncate">{item.sourceContext}</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSignal(item.id)}
                      className="p-1 text-[#A6B9B1] hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete signal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-serif font-normal text-[#1A2521] leading-snug">
                    {item.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs text-[#5E6E67] leading-relaxed">
                    {item.hook || item.script.slice(0, 140)}
                  </p>

                  {/* Footer */}
                  <div className="pt-2.5 border-t border-[#F2ECE2] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono uppercase text-[#889790]">
                      {item.dateAdded || 'RECENT'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUseInDraftStudio(item)}
                      className="font-medium text-[#172822] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Draft 3 sample videos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: The 5 Core Signals Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#EAEFEA]/70 border border-[#D5E1D9] rounded-2xl p-6 space-y-4">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#698579] font-semibold">
                THE 5 CORE SIGNALS
              </div>
              <h3 className="text-xl font-serif font-normal text-[#172822] mt-1">
                Supervised pipeline.
              </h3>
              <p className="text-xs text-[#576B62] mt-0.5">
                5 distinct inputs ingested before human review.
              </p>
            </div>

            <div className="divide-y divide-[#D7E4DC] text-xs space-y-2.5 pt-1">
              <div className="pt-2.5">
                <span className="font-mono text-[10px] text-[#7E968C] font-semibold mr-1.5">01</span>
                <span className="font-medium text-[#172822]">Trends</span>
                <p className="text-[11px] text-[#556760] mt-0.5">Gemini Search Grounding tracks emerging niche conversations &amp; hashtags.</p>
              </div>

              <div className="pt-2.5">
                <span className="font-mono text-[10px] text-[#7E968C] font-semibold mr-1.5">02</span>
                <span className="font-medium text-[#172822]">News</span>
                <p className="text-[11px] text-[#556760] mt-0.5">Scans timely developments and industry updates worth discussing.</p>
              </div>

              <div className="pt-2.5">
                <span className="font-mono text-[10px] text-[#7E968C] font-semibold mr-1.5">03</span>
                <span className="font-medium text-[#172822]">Personal Ideas</span>
                <p className="text-[11px] text-[#556760] mt-0.5">Turns rough thoughts, opinions, and backlogs into structured posts.</p>
              </div>

              <div className="pt-2.5">
                <span className="font-mono text-[10px] text-[#7E968C] font-semibold mr-1.5">04</span>
                <span className="font-medium text-[#172822]">Festivals &amp; Events</span>
                <p className="text-[11px] text-[#556760] mt-0.5">Identifies upcoming holidays, cultural occasions, and local happenings.</p>
              </div>

              <div className="pt-2.5">
                <span className="font-mono text-[10px] text-[#7E968C] font-semibold mr-1.5">05</span>
                <span className="font-medium text-[#172822]">Creative References</span>
                <p className="text-[11px] text-[#556760] mt-0.5">Replicates preferred format, tone, and structure without plagiarism.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
