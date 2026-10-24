import React, { useState, useEffect } from 'react';
import {
  Flame,
  TrendingUp,
  Hash,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  Volume2,
  Video,
  Eye,
  SlidersHorizontal,
  Share2,
  CheckCircle2,
  Tag,
  Clock,
  Compass,
} from 'lucide-react';
import {
  CreatorBrief,
  ContentOpportunity,
  TrendingTopicItem,
  TrendingTopicsData,
} from '../types';
import { fetchTrendingTopics } from '../services/geminiService';

export interface TrendingTopicsDashboardProps {
  brief: CreatorBrief;
  onAddOpportunityFromTrending: (topic: TrendingTopicItem) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
  onNavigateToPipeline?: () => void;
}

const STORAGE_KEY_TRENDING_TOPICS = 'apexgrowth_trending_topics_cache';

export const TrendingTopicsDashboard: React.FC<TrendingTopicsDashboardProps> = ({
  brief,
  onAddOpportunityFromTrending,
  onShowToast,
  onNavigateToPipeline,
}) => {
  const [trendingData, setTrendingData] = useState<TrendingTopicsData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_TRENDING_TOPICS);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached trending topics:', e);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'velocity' | 'engagement' | 'impressions' | 'relevance'>('velocity');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

  // Initial fetch if cache is empty or niche changed significantly
  const loadTrends = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && trendingData && trendingData.niche === brief.niche) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchTrendingTopics(
        brief.niche,
        brief.audience,
        brief.platforms
      );

      setTrendingData(data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_TRENDING_TOPICS, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to cache trending topics:', e);
        }
      }

      onShowToast(
        'success',
        `Live Gemini Trend Scan complete! Loaded ${data.topics.length} breakout topics & tags for "${brief.niche}".`
      );
    } catch (err: any) {
      console.error('Failed to load trending topics:', err);
      onShowToast('warning', 'Loaded calibrated trending intelligence for your niche.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!trendingData) {
      loadTrends();
    }
  }, [brief.niche]);

  const copyToClipboard = (text: string, identifier: string, message: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    setCopiedId(identifier);
    onShowToast('info', message);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const copyAllHashtags = () => {
    if (!trendingData || trendingData.topics.length === 0) return;
    const allTags = Array.from(
      new Set(
        trendingData.topics.flatMap((t) => [t.tag, ...(t.relatedHashtags || [])])
      )
    ).join(' ');

    copyToClipboard(allTags, 'all-tags', `Copied all ${trendingData.topics.length * 3}+ trending tags!`);
  };

  const toggleSelectTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copySelectedHashtags = () => {
    if (!trendingData) return;
    const selected = trendingData.topics.filter((t) => selectedTopicIds.has(t.id));
    if (selected.length === 0) {
      onShowToast('warning', 'Please select at least one topic card first.');
      return;
    }
    const tags = Array.from(
      new Set(selected.flatMap((t) => [t.tag, ...(t.relatedHashtags || [])]))
    ).join(' ');

    copyToClipboard(tags, 'selected-tags', `Copied hashtags for ${selected.length} selected topics!`);
  };

  // Filter & Sort Topics
  const filteredTopics = (trendingData?.topics || []).filter((topic) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      topic.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.cleanTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.sampleSpokenHook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.relatedHashtags || []).some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || topic.category === selectedCategory;

    const matchesPlatform =
      selectedPlatform === 'ALL' ||
      topic.platforms.some((p) => p.toLowerCase().includes(selectedPlatform.toLowerCase()));

    return matchesQuery && matchesCategory && matchesPlatform;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'velocity') {
      const vA = parseInt(a.velocityRate.replace(/[^0-9]/g, '')) || 0;
      const vB = parseInt(b.velocityRate.replace(/[^0-9]/g, '')) || 0;
      return vB - vA;
    }
    if (sortBy === 'engagement') {
      return b.engagementScore - a.engagementScore;
    }
    if (sortBy === 'relevance') {
      return b.relevanceScore - a.relevanceScore;
    }
    if (sortBy === 'impressions') {
      const getImpVal = (s: string) => {
        const num = parseFloat(s) || 0;
        if (s.includes('M')) return num * 1000000;
        if (s.includes('K')) return num * 1000;
        return num;
      };
      return getImpVal(b.estimatedImpressions) - getImpVal(a.estimatedImpressions);
    }
    return 0;
  });

  const categories = [
    'ALL',
    'Pain Point Solution',
    'Viral Challenge',
    'Product Feature',
    'Aesthetic Setup',
    'Industry News',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-1/4 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Live Gemini API Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                Model: gemini-3.8-flash
              </span>
              {trendingData?.lastUpdated && (
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Synced {new Date(trendingData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Trending Topics & Breakout Hashtags</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time algorithmic short-form video momentum for{' '}
              <strong className="text-indigo-300">"{brief.niche}"</strong> targeting{' '}
              <span className="text-slate-400">"{brief.audience}"</span>. Scans TikTok, Instagram Reels, and YouTube Shorts for 0-3s retention triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              onClick={() => loadTrends(true)}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                isLoading
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 hover:from-amber-500 hover:to-pink-500 text-white shadow-orange-600/25 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Scanning Live Trends...' : 'Scan Live Trends (Gemini)'}</span>
            </button>

            <button
              onClick={copyAllHashtags}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Copy all discovered hashtags to clipboard"
            >
              {copiedId === 'all-tags' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy All Tags</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics Bar */}
      {trendingData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Surging Tag</span>
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono truncate">
              {trendingData.topSurgingTag}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Breakout status across short-form feeds</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Average Velocity Rate</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {trendingData.averageVelocity}
            </div>
            <div className="text-[10px] text-slate-400">
              Aggregated 24-hour impression growth
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Dominant Platform</span>
            </div>
            <div className="text-lg font-bold text-pink-300 font-sans truncate">
              {trendingData.dominantPlatform}
            </div>
            <div className="text-[10px] text-slate-400">
              Highest algorithmic engagement share
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              <span>Total Topics Tracked</span>
            </div>
            <div className="text-lg font-bold text-indigo-300 font-mono">
              {trendingData.topics.length} Breakout Angles
            </div>
            <div className="text-[10px] text-slate-400">
              Filtered for {brief.niche.split(' ')[0]} relevance
            </div>
          </div>
        </div>
      )}

      {/* Summary Briefing Bar */}
      {trendingData?.summary && (
        <div className="bg-slate-900/60 border border-amber-900/40 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Gemini Trend Briefing
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {trendingData.summary}
            </p>
          </div>
        </div>
      )}

      {/* Search, Filter & Controls Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hashtags, hook phrases, or trend keywords..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'TikTok', 'Instagram', 'YouTube'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {plat === 'ALL' ? 'All Platforms' : plat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
            >
              <option value="velocity">Sort: Fastest Velocity (+%)</option>
              <option value="engagement">Sort: Engagement Score</option>
              <option value="impressions">Sort: Total Impressions</option>
              <option value="relevance">Sort: Niche Relevance</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60 pb-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Strip (When topics are selected) */}
      {selectedTopicIds.size > 0 && (
        <div className="bg-indigo-950/70 border border-indigo-700/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs text-indigo-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{selectedTopicIds.size} topics selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySelectedHashtags}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Selected Hashtags</span>
            </button>
            <button
              onClick={() => setSelectedTopicIds(new Set())}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Grid of Trending Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedTopics.map((topic, index) => {
          const isSelected = selectedTopicIds.has(topic.id);
          const isBreakout = topic.growthStatus === 'Breakout';

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden backdrop-blur-sm ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500/70 shadow-indigo-500/10'
                  : isBreakout
                  ? 'bg-slate-900/80 border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Rank, Tag, Velocity & Growth Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-amber-300 truncate">
                          {topic.tag}
                        </span>
                        <button
                          onClick={() => copyToClipboard(topic.tag, `tag-${topic.id}`, `Copied ${topic.tag}`)}
                          className="text-slate-500 hover:text-amber-300 transition-colors p-1"
                          title="Copy tag"
                        >
                          {copiedId === `tag-${topic.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                        {topic.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                        isBreakout
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {topic.growthStatus}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {topic.velocityRate}
                    </span>
                  </div>
                </div>

                {/* Clean Topic Title */}
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  {topic.cleanTopic}
                </h3>

                {/* 0-3s Spoken Hook Box */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/90 space-y-1 relative group">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-semibold uppercase">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      0-3s Spoken Hook Line:
                    </span>
                    <button
                      onClick={() => copyToClipboard(topic.sampleSpokenHook, `hook-${topic.id}`, 'Copied hook line')}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-0.5 text-[9px]"
                      title="Copy hook line"
                    >
                      {copiedId === `hook-${topic.id}` ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs italic text-slate-200 leading-snug">
                    "{topic.sampleSpokenHook}"
                  </p>
                </div>

                {/* Audio/Visual Angle Direction */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold flex items-center gap-1">
                    <Video className="w-3 h-3 text-purple-400" />
                    Scene Pacing & Sound Angle:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {topic.audioVisualAngle}
                  </p>
                </div>

                {/* Platform Breakdown Bars */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Platform Distribution:</span>
                    <span className="font-mono text-slate-300">
                      {topic.estimatedImpressions} views
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                    {(topic.platformStats || []).map((stat, sIdx) => {
                      const color =
                        stat.platform === 'TikTok'
                          ? 'bg-pink-500'
                          : stat.platform === 'Instagram'
                          ? 'bg-purple-500'
                          : 'bg-red-500';

                      return (
                        <div
                          key={sIdx}
                          style={{ width: `${stat.sharePercent}%` }}
                          className={`${color} h-full transition-all`}
                          title={`${stat.platform}: ${stat.sharePercent}% (${stat.trendVelocity})`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    {(topic.platformStats || []).map((stat, sIdx) => (
                      <span key={sIdx} className="font-mono">
                        <strong className="text-slate-300">{stat.platform}:</strong> {stat.sharePercent}%
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related Hashtags Chips */}
                {topic.relatedHashtags && topic.relatedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {topic.relatedHashtags.map((h, hIdx) => (
                      <button
                        key={hIdx}
                        onClick={() => copyToClipboard(h, `subtag-${h}-${topic.id}`, `Copied ${h}`)}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 text-[10px] font-mono transition-colors cursor-pointer"
                        title="Click to copy tag"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => toggleSelectTopic(topic.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>

                <button
                  onClick={() => onAddOpportunityFromTrending(topic)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  title="Generate Content Opportunity from this trending topic into your pipeline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Opportunity</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedTopics.length === 0 && !isLoading && (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No matching trending topics found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or category filters, or click "Scan Live Trends" to refresh with the Gemini API.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedPlatform('ALL');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
