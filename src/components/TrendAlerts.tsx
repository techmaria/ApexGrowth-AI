import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Plus,
  Check,
  Clock,
  Radio,
} from 'lucide-react';
import { CreatorBrief, ContentOpportunity, TrendingTopicItem, TrendingTopicsData } from '../types';
import { fetchTrendingTopics } from '../services/geminiService';

interface TrendAlertsProps {
  brief: CreatorBrief;
  onAddSignalToQueue: (newSignal: Partial<ContentOpportunity>) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
  existingOpportunityTitles?: string[];
}

export const TrendAlerts: React.FC<TrendAlertsProps> = ({
  brief,
  onAddSignalToQueue,
  onShowToast,
  existingOpportunityTitles = [],
}) => {
  const [trendingData, setTrendingData] = useState<TrendingTopicsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState(120);
  const [secondsUntilNextPoll, setSecondsUntilNextPoll] = useState(120);
  const [lastPolledTime, setLastPolledTime] = useState<Date>(new Date());
  const [addedTopicIds, setAddedTopicIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const pollTrends = async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchTrendingTopics(
        brief.niche || 'Independent plant shop',
        brief.audience || 'Apartment dwellers and first-time plant parents',
        brief.platforms.length > 0 ? brief.platforms : ['TikTok', 'Instagram', 'YouTube']
      );

      if (data && data.topics && data.topics.length > 0) {
        setTrendingData(data);
        setLastPolledTime(new Date());
        setSecondsUntilNextPoll(pollIntervalSeconds);
        if (!silent) {
          onShowToast('success', `Found ${data.topics.length} trends for "${brief.niche}".`);
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      if (!silent) {
        onShowToast('warning', 'Trends loaded from cached fallback.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    pollTrends(false);
  }, [brief.niche]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (isPollingEnabled) {
      setSecondsUntilNextPoll(pollIntervalSeconds);

      countdownRef.current = setInterval(() => {
        setSecondsUntilNextPoll((prev) => {
          if (prev <= 1) return pollIntervalSeconds;
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setInterval(() => {
        pollTrends(true);
      }, pollIntervalSeconds * 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isPollingEnabled, pollIntervalSeconds, brief.niche]);

  const handleAddTopicToQueue = (topic: TrendingTopicItem) => {
    onAddSignalToQueue({
      title: topic.cleanTopic,
      hook: topic.sampleSpokenHook || topic.whyItMatters,
      script: `Visual direction: Handheld documentary framing highlighting ${topic.cleanTopic}.\nAudio hook: "${topic.sampleSpokenHook || topic.cleanTopic}"`,
      signal: topic.tag,
      signalType: 'Trend',
      sourceContext: `Trend alert: ${topic.cleanTopic}`,
      predictedRetention: 85,
      viralityScore: topic.relevanceScore || 92,
      platforms: topic.platforms.length > 0 ? topic.platforms : brief.platforms,
      status: 'QUEUED',
      dateAdded: 'RECENT',
    });

    setAddedTopicIds((prev) => new Set(prev).add(topic.id));
    onShowToast('success', `Added "${topic.cleanTopic}" to queue.`);
  };

  const topics = trendingData?.topics || [];
  const categories = ['All', ...Array.from(new Set(topics.map((t) => t.category).filter(Boolean)))];

  const filteredTopics = topics.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
        <div className="space-y-2">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
            TRENDS
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
            Live signals.
          </h1>
          <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
            Social trends scored for <span className="font-medium text-[#1A2521]">{brief.niche}</span>.
          </p>
        </div>

        {/* Polling Controls Panel */}
        <div className="bg-white border border-[#E8E2D6] rounded-xl p-3 shadow-2xs flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPollingEnabled(!isPollingEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPollingEnabled
                ? 'bg-[#172822] text-white'
                : 'bg-[#FAF8F5] text-[#7A8C84] border border-[#E0D9CD]'
            }`}
          >
            <Radio className={`w-3 h-3 ${isPollingEnabled ? 'text-[#E2A968]' : ''}`} />
            <span>{isPollingEnabled ? 'Live polling' : 'Paused'}</span>
          </button>

          <select
            value={pollIntervalSeconds}
            onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
            disabled={!isPollingEnabled}
            className="bg-[#FAF8F5] border border-[#E0D9CD] rounded-lg px-2.5 py-1.5 text-xs text-[#1A2521] focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value={60}>1m</option>
            <option value={120}>2m</option>
            <option value={300}>5m</option>
          </select>

          <button
            type="button"
            onClick={() => pollTrends(false)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-[#E0D9CD] hover:border-[#172822] bg-white text-[#172822] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-[#A87432]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border border-[#E8E2D6] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#63756E]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#889790]" />
          <span>
            Last polled: <span className="font-mono text-[#1A2521]">{lastPolledTime.toLocaleTimeString()}</span>
          </span>
          {isPollingEnabled && (
            <span className="text-[#A87432] font-mono text-[11px] ml-1">
              ({secondsUntilNextPoll}s)
            </span>
          )}
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#172822] text-white font-medium'
                    : 'text-[#63756E] hover:text-[#1A2521]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {filteredTopics.map((topic) => {
          const isAdded =
            addedTopicIds.has(topic.id) ||
            existingOpportunityTitles.some(
              (t) => t.toLowerCase() === (topic.cleanTopic || '').toLowerCase()
            );

          return (
            <div
              key={topic.id}
              onClick={() => handleAddTopicToQueue(topic)}
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between space-y-3.5 shadow-2xs transition-all cursor-pointer group ${
                isAdded
                  ? 'border-[#2C5E48]/50 bg-[#FAFDFB]'
                  : 'border-[#E8E2D6] hover:border-[#172822]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-[#A87432] font-medium">
                    {topic.tag}
                  </span>
                  <span className="font-mono text-[#73847C] uppercase text-[10px]">
                    {topic.velocityRate}
                  </span>
                </div>

                <h3 className="text-base font-serif font-normal text-[#1A2521] leading-snug group-hover:text-[#2C5E48] transition-colors">
                  {topic.cleanTopic}
                </h3>

                {topic.sampleSpokenHook && (
                  <p className="text-xs font-serif italic text-[#5E6E67] leading-relaxed">
                    "{topic.sampleSpokenHook}"
                  </p>
                )}

                <p className="text-xs text-[#5E6E67] leading-relaxed line-clamp-2">
                  {topic.whyItMatters}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F2ECE2] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#889790]">
                  {topic.category}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTopicToQueue(topic);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-[#EAEFEA] text-[#2C5E48]'
                      : 'bg-[#172822] hover:bg-[#0E1A16] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
