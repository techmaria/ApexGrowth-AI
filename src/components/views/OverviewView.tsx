import React from 'react';
import {
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Radio,
  Sparkles,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';
import { ContentOpportunity, CreatorBrief } from '../../types';
import { WorkspaceTab } from '../Sidebar';

interface OverviewViewProps {
  brief: CreatorBrief;
  opportunities: ContentOpportunity[];
  onNavigate: (tab: WorkspaceTab) => void;
  onOpenAddModal: () => void;
  onSelectSignalForDraft: (opp: ContentOpportunity) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  brief,
  opportunities,
  onNavigate,
  onOpenAddModal,
  onSelectSignalForDraft,
}) => {
  const queuedOpps = opportunities.filter((o) => o.status === 'QUEUED');
  const approvedOpps = opportunities.filter(
    (o) => o.status === 'APPROVED' || o.status === 'DISPATCHED'
  );
  const dispatchedOpps = opportunities.filter((o) => o.status === 'DISPATCHED');

  const today = new Date();
  const dateFormatted = today
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();

  const workflowStages = [
    {
      num: '01',
      name: 'Discover',
      tag: '5 Signals',
      desc: 'Trends, News, Personal Ideas, Festivals & Events, Creative References',
      tab: 'opportunities' as WorkspaceTab,
    },
    {
      num: '02',
      name: 'Generate',
      tag: 'Multimodal',
      desc: '3 sample videos with 0–3s spoken hooks, scene script, Veo 3.1 & Imagen 3 prompts',
      tab: 'draft_studio' as WorkspaceTab,
    },
    {
      num: '03',
      name: 'Review',
      tag: 'HITL Control',
      desc: 'Human-in-the-Loop 5 actions: Accept, Reject, Edit, Regenerate, Save',
      tab: 'draft_studio' as WorkspaceTab,
    },
    {
      num: '04',
      name: 'Distribute',
      tag: '9 Platforms',
      desc: 'Blotato automation across TikTok, IG, YT, X, FB, LinkedIn, Pinterest, Threads, Bluesky',
      tab: 'distribution' as WorkspaceTab,
    },
    {
      num: '05',
      name: 'Analytics',
      tag: 'Google Sheets',
      desc: 'Live telemetry sync: reach, likes, comments, saves, and ROI tracking',
      tab: 'sheets' as WorkspaceTab,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
            <span>ApexGrowth AI · {dateFormatted}</span>
            <span className="text-[#C5D0CA]">·</span>
            <span className="text-[#5E6E67] font-normal normal-case font-sans">
              Team Szen Innovation / Maria Amor Iglesia
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
            5-Stage Growth Engine
          </h1>
          <p className="text-xs text-[#5E6E67] leading-relaxed max-w-2xl">
            Autonomous discovery to multi-platform distribution. Built with Gemini 3.8 Flash, Veo 3.1 &amp; Imagen 3 prompts, Blotato 9-channel dispatch, and Google Sheets integration—at strictly $0 deployment budget.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('distribution')}
            className="px-3.5 py-2 rounded-lg border border-[#D5DDD8] bg-white hover:bg-[#FAF8F4] text-[#172822] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#54645E]" />
            <span>Distribute</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg bg-[#172822] hover:bg-[#0E1A16] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add signal</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Workflow Pipeline Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE2] pb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold">
              ARCHITECTURE &amp; LIFECYCLE
            </div>
            <h2 className="text-lg font-serif font-medium text-[#1A2521] mt-0.5">
              The 5-Stage Content Pipeline
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#5E6E67]">
            <span className="inline-flex items-center gap-1 text-[#2C5E48]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2C5E48]" />
              $0 Budget Architecture
            </span>
            <span>·</span>
            <span>20+ hrs saved/wk</span>
          </div>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {workflowStages.map((stage) => (
            <button
              key={stage.num}
              onClick={() => onNavigate(stage.tab)}
              className="p-3.5 rounded-xl border border-[#EBE5D9] hover:border-[#2C5E48] hover:bg-[#FAF8F4] text-left transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-[#A87432]">{stage.num}</span>
                  <span className="text-[10px] font-mono text-[#73847C] bg-[#F4EFE6] px-1.5 py-0.5 rounded">
                    {stage.tag}
                  </span>
                </div>
                <div className="font-serif font-medium text-sm text-[#1A2521] mt-2 group-hover:text-[#2C5E48]">
                  {stage.name}
                </div>
                <p className="text-[11px] text-[#63756E] leading-relaxed mt-1">
                  {stage.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-[#172822] group-hover:underline pt-1">
                <span>Open</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E8E2D6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#889790]">
            Time Saved
          </div>
          <div className="text-2xl font-serif text-[#1A2521]">20+ hrs</div>
          <p className="text-[11px] text-[#5E6E67]">Per creator each week</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E2D6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#889790]">
            Core Signals
          </div>
          <div className="text-2xl font-serif text-[#1A2521]">5 Types</div>
          <p className="text-[11px] text-[#5E6E67]">Trends, news, ideas, events, ref</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E2D6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#889790]">
            Distribution Reach
          </div>
          <div className="text-2xl font-serif text-[#1A2521]">9 Platforms</div>
          <p className="text-[11px] text-[#5E6E67]">TikTok, IG, YT, X, FB, LinkedIn, ...</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E2D6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#889790]">
            Deployment Cost
          </div>
          <div className="text-2xl font-serif text-[#2C5E48]">$0.00</div>
          <p className="text-[11px] text-[#5E6E67]">Gemini Free / Local / Sheets</p>
        </div>
      </div>

      {/* Middle 2 Cards: Process Visual & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Process Orbit */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E2D6] p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#889790]" />
              5-SIGNAL ENGINE
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xs">
                <h2 className="text-2xl font-serif font-normal text-[#1A2521] leading-snug">
                  Notice. Shape. Ship.
                </h2>
                <p className="text-xs text-[#5E6E67] leading-relaxed">
                  Capture signals across 5 categories, generate 3 multimodal video directions with Veo 3.1 prompts, and publish across 9 channels.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('opportunities')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#172822] hover:bg-[#0E1A16] text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>View queue</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onNavigate('draft_studio')}
                    className="px-3.5 py-1.5 rounded-lg border border-[#D5DDD8] hover:bg-[#FAF8F4] text-[#172822] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Draft Studio</span>
                  </button>
                </div>
              </div>

              {/* Minimal Orbit */}
              <div className="relative w-44 h-44 shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="#EBE5D9"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill="none"
                    stroke="#EBE5D9"
                    strokeWidth="1"
                  />
                  <circle cx="100" cy="100" r="32" fill="#E8AF70" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <Sparkles className="w-3.5 h-3.5 text-[#1A2521] mb-0.5" />
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#1A2521] font-bold">
                    GEMINI
                  </span>
                </div>

                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase text-[#73847C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D6]">
                  Trend
                </span>
                <span className="absolute top-12 right-0 text-[9px] font-mono uppercase text-[#73847C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D6]">
                  Idea
                </span>
                <span className="absolute bottom-3 right-4 text-[9px] font-mono uppercase text-[#73847C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D6]">
                  Event
                </span>
                <span className="absolute bottom-3 left-4 text-[9px] font-mono uppercase text-[#73847C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D6]">
                  News
                </span>
                <span className="absolute top-12 left-0 text-[9px] font-mono uppercase text-[#73847C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D6]">
                  Ref
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F2ECE2] grid grid-cols-3 gap-2 text-[11px] text-[#73847C]">
            <div>
              <strong className="font-mono text-[#A87432] mr-1">01</strong>
              <span>5 Core signals</span>
            </div>
            <div>
              <strong className="font-mono text-[#A87432] mr-1">02</strong>
              <span>3 Sample videos</span>
            </div>
            <div>
              <strong className="font-mono text-[#A87432] mr-1">03</strong>
              <span>HITL 5 actions</span>
            </div>
          </div>
        </div>

        {/* Card 2: Activity Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E2D6] p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold">
                  STATUS
                </div>
                <h3 className="text-xl font-serif font-normal text-[#1A2521] mt-0.5">
                  Pipeline State
                </h3>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EAEFEA] text-[#2C5E48] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="divide-y divide-[#F2ECE2] text-xs">
              <button
                onClick={() => onNavigate('opportunities')}
                className="w-full py-3 flex items-center justify-between hover:text-[#1A2521] group cursor-pointer text-left"
              >
                <div>
                  <div className="font-medium text-[#1A2521]">Queued signals</div>
                  <div className="text-[11px] text-[#7A8C84] mt-0.5">Ingested raw observations</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-[#1A2521]">{queuedOpps.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#889790] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('draft_studio')}
                className="w-full py-3 flex items-center justify-between hover:text-[#1A2521] group cursor-pointer text-left"
              >
                <div>
                  <div className="font-medium text-[#1A2521]">Draft Studio</div>
                  <div className="text-[11px] text-[#7A8C84] mt-0.5">3 Sample videos per signal</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-[#1A2521]">
                    {queuedOpps.length > 0 ? 3 : 0}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#889790] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('distribution')}
                className="w-full py-3 flex items-center justify-between hover:text-[#1A2521] group cursor-pointer text-left"
              >
                <div>
                  <div className="font-medium text-[#1A2521]">Blotato Dispatch</div>
                  <div className="text-[11px] text-[#7A8C84] mt-0.5">Automated to 9 networks</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-[#1A2521]">{dispatchedOpps.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#889790] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('sheets')}
                className="w-full py-3 flex items-center justify-between hover:text-[#1A2521] group cursor-pointer text-left"
              >
                <div>
                  <div className="font-medium text-[#1A2521]">Google Sheets Sync</div>
                  <div className="text-[11px] text-[#7A8C84] mt-0.5">Live performance logging</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#2C5E48]">Connected</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#889790] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] font-mono text-[#7A8C84]">
            <span>Cost: $0.00 / month</span>
            <span>Zero paid subscriptions</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards: Queue Preview & Proposal Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 3: In the Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E2D6] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold">
                INGESTION QUEUE
              </div>
              <h3 className="text-xl font-serif font-normal text-[#1A2521] mt-0.5">
                Active signals
              </h3>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-medium text-[#172822] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {opportunities.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectSignalForDraft(item)}
                className="p-3.5 rounded-xl border border-[#EBE5D9] hover:border-[#CAD4CE] hover:bg-[#FAF8F4] transition-all cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[#73847C]">
                    <span className="font-mono uppercase font-semibold text-[#8B9892]">
                      {item.signalType || 'Trend'}
                    </span>
                    <span>·</span>
                    <span className="truncate">{item.sourceContext || 'Observation'}</span>
                  </div>
                  <h4 className="text-sm font-medium text-[#1A2521] truncate group-hover:text-[#2C5E48]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#63756E] line-clamp-1">
                    {item.hook || item.script.slice(0, 90)}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#A6B9B1] group-hover:text-[#172822] transition-colors shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Proposal Architecture / HITL Statement */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E2D6] p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold">
              HUMAN-IN-THE-LOOP PRINCIPLE
            </div>
            <h3 className="text-xl font-serif font-normal text-[#1A2521] leading-snug">
              Every word approved by the creator.
            </h3>
            <p className="text-xs text-[#63756E] leading-relaxed">
              ApexGrowth provides 5 distinct review actions: Accept, Reject, Edit, Regenerate, and Save. No autonomous posting without explicit human verification.
            </p>
            <div className="space-y-1.5 pt-2 text-xs text-[#5E6E67]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48]" />
                <span>Multimodal generation with Veo 3.1 &amp; Imagen 3</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48]" />
                <span>Blotato scheduled dispatch across 9 platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48]" />
                <span>Zero infrastructure costs ($0 deployment)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#F2ECE2]">
            <button
              onClick={() => onNavigate('brief')}
              className="text-xs font-medium text-[#172822] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Edit creator brief</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <div className="w-8 h-8 rounded-full border border-[#E8E2D6] flex items-center justify-center text-[#889790]">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
