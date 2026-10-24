import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { ContentOpportunity } from '../types';

interface PipelineTrendsChartProps {
  opportunities: ContentOpportunity[];
  onSelectOpportunity?: (index: number) => void;
  selectedIndex?: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
  opportunities: ContentOpportunity[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, opportunities }) => {
  if (!active || !payload || !payload.length) return null;

  // Find corresponding opportunity by label or index
  const opp = opportunities.find(
    (o, idx) => `Opp #${idx + 1}` === label || o.title === label || (o.id && o.id === label)
  );

  const virality = payload.find((p) => p.dataKey === 'viralityScore')?.value ?? 0;
  const retention = payload.find((p) => p.dataKey === 'predictedRetention')?.value ?? 0;

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2.5 z-50">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
          {label}
        </span>
        {opp?.status && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              opp.status === 'APPROVED'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : opp.status === 'REJECTED'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {opp.status}
          </span>
        )}
      </div>

      {opp?.title && (
        <p className="font-semibold text-slate-200 line-clamp-2 leading-snug">
          {opp.title}
        </p>
      )}

      {opp?.signal && (
        <p className="text-[11px] text-slate-400 truncate">
          <span className="text-slate-500">Signal:</span> {opp.signal}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-amber-400 font-medium text-[11px]">
            <Flame className="w-3.5 h-3.5" />
            <span>Virality</span>
          </div>
          <div className="text-base font-bold text-amber-300 mt-0.5 font-mono">
            {virality}
            <span className="text-[10px] text-amber-500 font-normal"> /100</span>
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            {virality >= 90 ? '🌟 Viral Spike' : virality >= 80 ? '🔥 High Reach' : '⚡ Moderate'}
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Retention</span>
          </div>
          <div className="text-base font-bold text-emerald-300 mt-0.5 font-mono">
            {retention}%
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            {retention >= 80 ? '🎯 High Completion' : '📈 Steady Watch'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PipelineTrendsChart: React.FC<PipelineTrendsChartProps> = ({
  opportunities,
  onSelectOpportunity,
  selectedIndex,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metricFilter, setMetricFilter] = useState<'both' | 'virality' | 'retention'>('both');

  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  // Prepare chart data format
  const chartData = opportunities.map((opp, idx) => ({
    name: `Opp #${idx + 1}`,
    id: opp.id,
    fullTitle: opp.title,
    viralityScore: Number(opp.viralityScore) || 0,
    predictedRetention: Number(opp.predictedRetention) || 0,
    signal: opp.signal,
    status: opp.status,
    index: idx,
  }));

  // Calculations for summary metrics
  const avgVirality = Math.round(
    chartData.reduce((acc, d) => acc + d.viralityScore, 0) / (chartData.length || 1)
  );
  const avgRetention = Math.round(
    chartData.reduce((acc, d) => acc + d.predictedRetention, 0) / (chartData.length || 1)
  );

  const topOpp = [...chartData].sort(
    (a, b) => (b.viralityScore + b.predictedRetention) - (a.viralityScore + a.predictedRetention)
  )[0];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                Opportunity Virality & Retention Trends
              </h3>
              <span className="bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {opportunities.length} Items
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative benchmark of forecasted virality score vs. predicted audience retention across all opportunities
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Metric Selector Filter */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setMetricFilter('both')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metricFilter === 'both'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setMetricFilter('virality')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                metricFilter === 'virality'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              Virality
            </button>
            <button
              onClick={() => setMetricFilter('retention')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                metricFilter === 'retention'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Retention
            </button>
          </div>

          {/* Toggle Expand/Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            title={isCollapsed ? 'Expand chart' : 'Collapse chart'}
            aria-label={isCollapsed ? 'Expand chart' : 'Collapse chart'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* KPI Snapshot Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Avg Virality Score
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-amber-300">{avgVirality}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Avg Retention
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-300">{avgRetention}%</span>
                <span className="text-xs text-slate-500">completion</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between col-span-2">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Top Performing Signal
              </span>
              {topOpp ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-xs font-semibold text-indigo-200 block truncate">
                      {topOpp.name}: {topOpp.fullTitle}
                    </span>
                    <span className="text-[10px] text-slate-400">{topOpp.signal}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                    <span className="text-amber-400 font-bold">V:{topOpp.viralityScore}</span>
                    <span className="text-emerald-400 font-bold">R:{topOpp.predictedRetention}%</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500">No opportunities available</span>
              )}
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 sm:p-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  barGap={6}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const payloadItem = state.activePayload[0].payload as { index: number };
                      if (onSelectOpportunity && typeof payloadItem.index === 'number') {
                        onSelectOpportunity(payloadItem.index);
                      }
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="viralityBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="retentionBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />

                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    ticks={[0, 25, 50, 75, 100]}
                  />

                  <Tooltip
                    content={<CustomTooltip opportunities={opportunities} />}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.07)' }}
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                    formatter={(value) => (
                      <span className="text-slate-300 font-medium">
                        {value === 'viralityScore' ? 'Virality Score (/100)' : 'Predicted Retention (%)'}
                      </span>
                    )}
                  />

                  {/* Benchmark target line at 80 */}
                  <ReferenceLine
                    y={80}
                    stroke="#6366f1"
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                    label={{
                      value: 'High Performance Benchmark (80)',
                      fill: '#818cf8',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />

                  {(metricFilter === 'both' || metricFilter === 'virality') && (
                    <Bar
                      dataKey="viralityScore"
                      name="viralityScore"
                      fill="url(#viralityBarGrad)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      animationDuration={800}
                    />
                  )}

                  {(metricFilter === 'both' || metricFilter === 'retention') && (
                    <Bar
                      dataKey="predictedRetention"
                      name="predictedRetention"
                      fill="url(#retentionBarGrad)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      animationDuration={800}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive hint footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Clicking any bar selects and opens the corresponding opportunity card below.
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  Amber: Virality Score
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  Emerald: Predicted Retention
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
