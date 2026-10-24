import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Bookmark,
  BarChart3,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ContentOpportunity, PerformanceStats } from '../../types';

interface PerformanceViewProps {
  opportunities: ContentOpportunity[];
  onUpdateMetrics: (id: string, stats: PerformanceStats) => void;
  onOpenEditMetricsModal: (opp: ContentOpportunity) => void;
}

type FilterMode = 'all_approved' | 'published' | 'scheduled';
type ScaleMode = 'dual' | 'unified';

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  opportunities,
  onOpenEditMetricsModal,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all_approved');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('dual');

  // Filter approved opportunities
  const approvedOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      const isApproved =
        o.status === 'APPROVED' ||
        o.status === 'DISPATCHED' ||
        o.calendarStatus === 'Approved' ||
        o.calendarStatus === 'Scheduled' ||
        o.calendarStatus === 'Published' ||
        o.performance !== undefined;

      if (!isApproved) return false;

      if (filterMode === 'published') {
        return o.calendarStatus === 'Published' || o.status === 'DISPATCHED';
      }
      if (filterMode === 'scheduled') {
        return o.calendarStatus === 'Scheduled' || o.status === 'APPROVED';
      }
      return true;
    });
  }, [opportunities, filterMode]);

  // Aggregate high-level totals
  const totalReach = useMemo(() => {
    return approvedOpportunities.reduce(
      (sum, item) => sum + (item.performance?.reach || Math.round((item.viralityScore || 80) * 11 + (item.predictedRetention || 75) * 2.5)),
      0
    );
  }, [approvedOpportunities]);

  const totalLikes = useMemo(() => {
    return approvedOpportunities.reduce(
      (sum, item) => sum + (item.performance?.likes || Math.round((item.viralityScore || 80) * 0.9)),
      0
    );
  }, [approvedOpportunities]);

  const totalComments = useMemo(() => {
    return approvedOpportunities.reduce(
      (sum, item) => sum + (item.performance?.comments || Math.round((item.predictedRetention || 75) * 0.16)),
      0
    );
  }, [approvedOpportunities]);

  const totalSaves = useMemo(() => {
    return approvedOpportunities.reduce(
      (sum, item) => sum + (item.performance?.saves || Math.max(12, Math.round((item.predictedRetention || 75) * 0.42))),
      0
    );
  }, [approvedOpportunities]);

  const avgSaveRate = totalReach > 0 ? ((totalSaves / totalReach) * 100).toFixed(1) : '0.0';

  // Format chart data for Recharts BarChart comparing reach and saves
  const chartData = useMemo(() => {
    return approvedOpportunities.map((item) => {
      const reach =
        item.performance?.reach ??
        Math.round((item.viralityScore || 80) * 11 + (item.predictedRetention || 75) * 2.5);
      const saves =
        item.performance?.saves ??
        Math.max(12, Math.round((item.predictedRetention || 75) * 0.42));
      const saveRate = reach > 0 ? ((saves / reach) * 100).toFixed(1) : '0.0';

      // Truncate title for clean XAxis label
      const shortTitle =
        item.title.length > 18 ? item.title.slice(0, 16) + '…' : item.title;

      return {
        id: item.id,
        rawItem: item,
        title: item.title,
        shortTitle,
        reach,
        saves,
        saveRate: parseFloat(saveRate),
        status: item.calendarStatus || item.status,
        platforms: item.platforms?.join(', ') || 'Instagram',
      };
    });
  }, [approvedOpportunities]);

  // Find top performers for highlight insights
  const topSavedItem = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.saves - a.saves)[0];
  }, [chartData]);

  const topReachItem = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.reach - a.reach)[0];
  }, [chartData]);

  // Custom Recharts tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-[#121D19]/95 backdrop-blur-xs border border-[#E2DDD3] dark:border-[#263C33] rounded-xl p-4 shadow-xl text-xs space-y-2.5 min-w-[240px]">
          <div className="border-b border-[#F0EBE0] dark:border-[#20322B] pb-2">
            <p className="font-serif text-sm font-medium text-[#1A2521] dark:text-[#E8ECE9] line-clamp-2">
              {data.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-mono text-[#889790] dark:text-[#8E9F97] uppercase">
                {data.platforms}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#263C33] text-[#55655E] dark:text-[#BAC7C1] font-mono">
                {data.status}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#55655E] dark:text-[#BAC7C1]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#172822] dark:bg-[#4EA37E] inline-block" />
                Reach:
              </span>
              <span className="font-mono font-semibold text-[#1A2521] dark:text-[#E8ECE9]">
                {data.reach.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#55655E] dark:text-[#BAC7C1]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DFA058] inline-block" />
                Saves:
              </span>
              <span className="font-mono font-semibold text-[#A87432] dark:text-[#E2A968]">
                {data.saves.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#F0EBE0] dark:border-[#20322B]">
              <span className="text-[#7A8C84] dark:text-[#8E9F97]">Save Rate (Intent):</span>
              <span className="font-mono font-semibold text-[#2C5E48] dark:text-[#7BC3A2]">
                {data.saveRate}%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#889790] dark:text-[#7A8E85] pt-1 text-center italic border-t border-dashed border-[#F0EBE0] dark:border-[#20322B]">
            Click bar to edit / record actuals
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
              PERFORMANCE
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5E6E67] bg-[#F4EFE6] px-2 py-0.5 rounded-full border border-[#E5DFD3]">
              <Sparkles className="w-2.5 h-2.5 text-[#A87432]" />
              $0 Client-Side Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
            Content metrics & engagement.
          </h1>
          <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
            Compare audience reach against high-intent saves across approved opportunities.
          </p>
        </div>

        {/* Quick summary badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white border border-[#E8E2D6] px-3.5 py-2 rounded-xl shadow-2xs">
          <Percent className="w-4 h-4 text-[#A87432]" />
          <div>
            <div className="text-[10px] font-mono uppercase text-[#7A8C84]">
              Avg. Save-to-Reach
            </div>
            <div className="text-sm font-serif font-semibold text-[#1A2521]">
              {avgSaveRate}%{' '}
              <span className="text-[10px] font-mono text-[#5E6E67] font-normal">
                bookmark rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reach */}
        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#889790]">
            <span className="text-[10px] font-mono uppercase font-semibold">
              TOTAL REACH
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#172822]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-normal text-[#1A2521]">
              {totalReach.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7A8C84] mt-0.5">Impressions across approved posts</div>
          </div>
        </div>

        {/* Saves */}
        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#889790]">
            <span className="text-[10px] font-mono uppercase font-semibold">
              TOTAL SAVES
            </span>
            <Bookmark className="w-3.5 h-3.5 text-[#DFA058]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-normal text-[#1A2521]">
              {totalSaves.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7A8C84] mt-0.5">High-intent evergreen bookmarks</div>
          </div>
        </div>

        {/* Likes */}
        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#889790]">
            <span className="text-[10px] font-mono uppercase font-semibold">
              LIKES & REACTIONS
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-normal text-[#1A2521]">
              {totalLikes.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7A8C84] mt-0.5">Direct positive resonance</div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#889790]">
            <span className="text-[10px] font-mono uppercase font-semibold">
              COMMENTS
            </span>
            <Activity className="w-3.5 h-3.5 text-[#A87432]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-normal text-[#1A2521]">
              {totalComments.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#7A8C84] mt-0.5">Audience replies & discussions</div>
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION: Reach vs. Saves Bar Chart */}
      <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F0EBE0]">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#172822]" />
              <h3 className="text-lg font-serif font-normal text-[#1A2521]">
                Reach vs. Saves engagement overview
              </h3>
            </div>
            <p className="text-xs text-[#7A8C84] mt-0.5">
              Side-by-side Recharts comparison showing distribution expansion vs. bookmark intent for approved opportunities.
            </p>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="inline-flex items-center bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setFilterMode('all_approved')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterMode === 'all_approved'
                    ? 'bg-[#172822] text-white font-medium shadow-2xs'
                    : 'text-[#5E6E67] hover:text-[#1A2521]'
                }`}
              >
                All Approved ({opportunities.filter((o) => o.status === 'APPROVED' || o.calendarStatus).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('published')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterMode === 'published'
                    ? 'bg-[#172822] text-white font-medium shadow-2xs'
                    : 'text-[#5E6E67] hover:text-[#1A2521]'
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('scheduled')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterMode === 'scheduled'
                    ? 'bg-[#172822] text-white font-medium shadow-2xs'
                    : 'text-[#5E6E67] hover:text-[#1A2521]'
                }`}
              >
                Scheduled
              </button>
            </div>

            {/* Scale mode toggle */}
            <div className="inline-flex items-center bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setScaleMode('dual')}
                title="Dual scale allows comparing relative trends across different orders of magnitude"
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  scaleMode === 'dual'
                    ? 'bg-[#A87432] text-white font-medium shadow-2xs'
                    : 'text-[#5E6E67] hover:text-[#1A2521]'
                }`}
              >
                Dual Scale
              </button>
              <button
                type="button"
                onClick={() => setScaleMode('unified')}
                title="Unified scale shows true absolute magnitude"
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  scaleMode === 'unified'
                    ? 'bg-[#A87432] text-white font-medium shadow-2xs'
                    : 'text-[#5E6E67] hover:text-[#1A2521]'
                }`}
              >
                Absolute
              </button>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        {chartData.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E2DDD3]">
            <Layers className="w-8 h-8 text-[#A87432] mx-auto opacity-70" />
            <div className="text-sm font-serif text-[#1A2521]">No approved opportunities to chart yet</div>
            <p className="text-xs text-[#7A8C84] max-w-sm mx-auto">
              Approve signals from the Opportunities or Draft Studio tab to populate the reach and saves engagement trends.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -5, bottom: 25 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #F0EBE0)" vertical={false} />
                  <XAxis
                    dataKey="shortTitle"
                    tick={{ fontSize: 11, fill: 'var(--chart-axis, #7A8C84)' }}
                    tickLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                    axisLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />

                  {/* Reach Axis (Left) */}
                  <YAxis
                    yAxisId="reach"
                    orientation="left"
                    tick={{ fontSize: 11, fill: 'var(--chart-reach, #172822)' }}
                    tickLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                    axisLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  />

                  {/* Saves Axis (Right - in dual scale mode) */}
                  {scaleMode === 'dual' ? (
                    <YAxis
                      yAxisId="saves"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#DFA058' }}
                      tickLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                      axisLine={{ stroke: 'var(--chart-grid, #E8E2D6)' }}
                      tickFormatter={(val) => `${val}`}
                    />
                  ) : null}

                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />

                  {/* Reach Bar */}
                  <Bar
                    yAxisId="reach"
                    dataKey="reach"
                    name="Reach (Impressions)"
                    fill="var(--chart-reach, #172822)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={(entry: any) => {
                      const item = entry?.rawItem || approvedOpportunities.find((o) => o.id === entry?.id);
                      if (item) onOpenEditMetricsModal(item);
                    }}
                  />

                  {/* Saves Bar */}
                  <Bar
                    yAxisId={scaleMode === 'dual' ? 'saves' : 'reach'}
                    dataKey="saves"
                    name="Saves (Bookmarks)"
                    fill="#DFA058"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={(entry: any) => {
                      const item = entry?.rawItem || approvedOpportunities.find((o) => o.id === entry?.id);
                      if (item) onOpenEditMetricsModal(item);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement Highlights Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F0EBE0] text-xs">
              {/* Highlight 1: Top Saved */}
              <div className="bg-[#FAF8F5] rounded-lg p-3 border border-[#E8E2D6] space-y-1">
                <div className="flex items-center gap-1.5 text-[#A87432] text-[10px] font-mono uppercase font-semibold">
                  <Bookmark className="w-3 h-3" />
                  Top Bookmarked Post
                </div>
                {topSavedItem ? (
                  <div>
                    <div className="font-medium text-[#1A2521] truncate">{topSavedItem.title}</div>
                    <div className="text-[11px] text-[#7A8C84] font-mono mt-0.5">
                      {topSavedItem.saves} saves · {topSavedItem.saveRate}% save rate
                    </div>
                  </div>
                ) : (
                  <div className="text-[#889790]">No data</div>
                )}
              </div>

              {/* Highlight 2: Top Reach */}
              <div className="bg-[#FAF8F5] rounded-lg p-3 border border-[#E8E2D6] space-y-1">
                <div className="flex items-center gap-1.5 text-[#172822] text-[10px] font-mono uppercase font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  Max Audience Reach
                </div>
                {topReachItem ? (
                  <div>
                    <div className="font-medium text-[#1A2521] truncate">{topReachItem.title}</div>
                    <div className="text-[11px] text-[#7A8C84] font-mono mt-0.5">
                      {topReachItem.reach.toLocaleString()} impressions
                    </div>
                  </div>
                ) : (
                  <div className="text-[#889790]">No data</div>
                )}
              </div>

              {/* Highlight 3: Save-to-Reach Insight */}
              <div className="bg-[#FAF8F5] rounded-lg p-3 border border-[#E8E2D6] space-y-1">
                <div className="flex items-center gap-1.5 text-[#2C5E48] text-[10px] font-mono uppercase font-semibold">
                  <Info className="w-3 h-3" />
                  Algorithm Strategy
                </div>
                <div className="text-[#55655E] text-[11px] leading-tight">
                  High save-to-reach ratio ({avgSaveRate}%) signals value density to platform recommendation algorithms.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approved & Published Work Table Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-serif font-normal text-[#1A2521]">
              Approved opportunities breakdown
            </h3>
            <p className="text-xs text-[#7A8C84]">
              Individual metrics and manual entry log.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#7A8C84] uppercase bg-white border border-[#E8E2D6] px-2.5 py-1 rounded-md">
            {approvedOpportunities.length} POSTS
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E2D6] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D6] text-[10px] font-mono uppercase text-[#889790]">
                <tr>
                  <th className="py-2.5 px-5 font-semibold">OPPORTUNITY</th>
                  <th className="py-2.5 px-3 font-semibold">STATUS</th>
                  <th className="py-2.5 px-4 font-semibold text-right">REACH</th>
                  <th className="py-2.5 px-4 font-semibold text-right">SAVES</th>
                  <th className="py-2.5 px-4 font-semibold text-right">SAVE RATE</th>
                  <th className="py-2.5 px-4 font-semibold text-right">LIKES</th>
                  <th className="py-2.5 px-5 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE2] text-[#1A2521]">
                {approvedOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7A8C84]">
                      No approved opportunities logged yet.
                    </td>
                  </tr>
                ) : (
                  approvedOpportunities.map((item) => {
                    const reach =
                      item.performance?.reach ||
                      Math.round((item.viralityScore || 80) * 11 + (item.predictedRetention || 75) * 2.5);
                    const saves =
                      item.performance?.saves ||
                      Math.max(12, Math.round((item.predictedRetention || 75) * 0.42));
                    const likes =
                      item.performance?.likes ||
                      Math.round((item.viralityScore || 80) * 0.9);
                    const rate = reach > 0 ? ((saves / reach) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-5 max-w-xs">
                          <div className="font-medium text-xs text-[#1A2521] truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#7A8C84] mt-0.5">
                            {item.platforms && item.platforms.length > 0
                              ? item.platforms.join(' · ')
                              : 'Instagram · TikTok'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              item.calendarStatus === 'Published'
                                ? 'bg-[#EAF4EF] text-[#2C5E48] border-[#CFE4D7]'
                                : item.calendarStatus === 'Scheduled'
                                ? 'bg-[#FEF7EE] text-[#A87432] border-[#F4E1C6]'
                                : 'bg-[#FAF8F5] text-[#55655E] border-[#E8E2D6]'
                            }`}
                          >
                            {item.calendarStatus || item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] font-medium text-[#1A2521]">
                          {reach.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] font-medium text-[#A87432]">
                          {saves.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-[#2C5E48] font-medium">
                          {rate}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-[#7A8C84]">
                          {likes.toLocaleString()}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenEditMetricsModal(item)}
                            className="text-xs font-medium text-[#172822] hover:underline cursor-pointer bg-[#FAF8F5] hover:bg-[#F2ECE2] px-2.5 py-1 rounded border border-[#E2DDD3] transition-colors"
                          >
                            {item.performance?.edited ? 'Edit metrics' : 'Record'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
