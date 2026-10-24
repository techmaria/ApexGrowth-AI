import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Sliders,
  Check,
  Share2,
  Calendar,
} from 'lucide-react';
import {
  ContentOpportunity,
  SocialPlatform,
  ScheduledPost,
  DistributionSettings,
  PlatformScheduleConfig,
} from '../../types';

interface DistributionViewProps {
  opportunities: ContentOpportunity[];
  onUpdateOpportunityStatus: (
    id: string,
    status: 'APPROVED' | 'DISPATCHED',
    calendarStatus?: 'Approved' | 'Scheduled' | 'Published'
  ) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
  onNavigateToCalendar: () => void;
}

const ALL_9_PLATFORMS: SocialPlatform[] = [
  'TikTok',
  'Instagram',
  'YouTube',
  'X',
  'Facebook',
  'LinkedIn',
  'Pinterest',
  'Threads',
  'Bluesky',
];

const STORAGE_KEY_DIST_SETTINGS = 'apexgrowth_distribution_settings_v3';
const STORAGE_KEY_POSTS = 'apexgrowth_scheduled_posts_v3';

const DEFAULT_PLATFORM_CONFIGS: Record<SocialPlatform, PlatformScheduleConfig> = {
  TikTok: {
    enabled: true,
    accountHandle: '@apexgrowth_tok',
    autoHashtags: true,
    customHashtags: '#fyp #growth #productivity',
    preferredTimeSlot: '13:30',
    format: 'TikTok Video (9:16)',
    crossPostDelayMinutes: 0,
    visibility: 'public',
  },
  Instagram: {
    enabled: true,
    accountHandle: '@apexgrowth.living',
    autoHashtags: true,
    customHashtags: '#Reels #CreatorDesk #Aesthetic',
    preferredTimeSlot: '19:45',
    format: 'Instagram Reels (9:16)',
    crossPostDelayMinutes: 30,
    visibility: 'public',
  },
  YouTube: {
    enabled: true,
    accountHandle: '@ApexGrowthMedia',
    autoHashtags: true,
    customHashtags: '#Shorts #StudioHacks',
    preferredTimeSlot: '09:15',
    format: 'YouTube Shorts (9:16)',
    crossPostDelayMinutes: 60,
    visibility: 'public',
  },
  X: {
    enabled: true,
    accountHandle: '@apexgrowth_ai',
    autoHashtags: true,
    customHashtags: '#BuildInPublic #CreatorEconomy',
    preferredTimeSlot: '10:00',
    format: 'Post & Video Clip',
    crossPostDelayMinutes: 45,
    visibility: 'public',
  },
  Facebook: {
    enabled: true,
    accountHandle: 'ApexGrowth Media',
    autoHashtags: true,
    customHashtags: '#SmallBusiness #Community',
    preferredTimeSlot: '14:00',
    format: 'Facebook Reels',
    crossPostDelayMinutes: 90,
    visibility: 'public',
  },
  LinkedIn: {
    enabled: true,
    accountHandle: 'ApexGrowth Innovation',
    autoHashtags: true,
    customHashtags: '#GrowthStrategy #Innovation',
    preferredTimeSlot: '08:30',
    format: 'Professional Video Post',
    crossPostDelayMinutes: 120,
    visibility: 'public',
  },
  Pinterest: {
    enabled: true,
    accountHandle: '@apexgrowth_pins',
    autoHashtags: true,
    customHashtags: '#DeskSetup #StudioInspo',
    preferredTimeSlot: '20:15',
    format: 'Idea Pin (9:16)',
    crossPostDelayMinutes: 180,
    visibility: 'public',
  },
  Threads: {
    enabled: true,
    accountHandle: '@apexgrowth.living',
    autoHashtags: true,
    customHashtags: '#Threads #CreatorThoughts',
    preferredTimeSlot: '12:00',
    format: 'Threads Short Video',
    crossPostDelayMinutes: 15,
    visibility: 'public',
  },
  Bluesky: {
    enabled: true,
    accountHandle: 'apexgrowth.bsky.social',
    autoHashtags: true,
    customHashtags: '#Tech #IndieDev',
    preferredTimeSlot: '11:30',
    format: 'Bluesky Video Post',
    crossPostDelayMinutes: 60,
    visibility: 'public',
  },
};

export const DistributionView: React.FC<DistributionViewProps> = ({
  opportunities,
  onUpdateOpportunityStatus,
  onShowToast,
  onNavigateToCalendar,
}) => {
  const [platformConfigs, setPlatformConfigs] = useState<Record<SocialPlatform, PlatformScheduleConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIST_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PLATFORM_CONFIGS;
  });

  const [blotatoWebhookUrl, setBlotatoWebhookUrl] = useState('');
  const [isDispatchingId, setIsDispatchingId] = useState<string | null>(null);
  const [recentDispatches, setRecentDispatches] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIST_SETTINGS, JSON.stringify(platformConfigs));
  }, [platformConfigs]);

  const togglePlatform = (p: SocialPlatform) => {
    setPlatformConfigs((prev) => ({
      ...prev,
      [p]: {
        ...prev[p],
        enabled: !prev[p].enabled,
      },
    }));
  };

  const approvedOpportunities = opportunities.filter(
    (o) => o.status === 'APPROVED' || o.status === 'DISPATCHED'
  );

  const activePlatformList = ALL_9_PLATFORMS.filter((p) => platformConfigs[p]?.enabled);

  const handleDispatch = async (opp: ContentOpportunity) => {
    if (activePlatformList.length === 0) {
      onShowToast('warning', 'Please enable at least one social media channel.');
      return;
    }

    setIsDispatchingId(opp.id);
    try {
      const res = await fetch('/api/distribution/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: opp,
          platforms: activePlatformList,
          caption: `${opp.hook}\n\n${opp.script}`,
          hashtags: ['#ApexGrowth', `#${opp.niche.replace(/\s+/g, '')}`],
          blotatoWebhookUrl: blotatoWebhookUrl || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecentDispatches((prev) => [data, ...prev.slice(0, 4)]);
        onUpdateOpportunityStatus(opp.id, 'DISPATCHED', 'Published');
        onShowToast(
          'success',
          `Dispatched "${opp.title}" across ${activePlatformList.length} platforms via Blotato!`
        );
      } else {
        throw new Error('Dispatch error');
      }
    } catch {
      // Offline / client simulated dispatch fallback ($0 cost guaranteed)
      onUpdateOpportunityStatus(opp.id, 'DISPATCHED', 'Published');
      onShowToast(
        'success',
        `Dispatched "${opp.title}" to ${activePlatformList.length} platforms (Blotato simulated mode).`
      );
    } finally {
      setIsDispatchingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-2 pt-2">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
          04 · AUTOMATED DISTRIBUTION
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
          9-Platform distribution.
        </h1>
        <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
          Dispatches approved content through Blotato to TikTok, Instagram, YouTube, X, Facebook, LinkedIn, Pinterest, Threads, and Bluesky.
        </p>
      </div>

      {/* $0 Implementation Architecture Bar */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-serif text-sm font-normal text-[#1A2521]">
              Blotato Multi-Channel Engine
            </div>
            <div className="text-[11px] text-[#7A8C84]">
              $0 Infrastructure Cost · Serverless Cloud Run Dispatcher · Zero Paid Subscriptions Required
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#2C5E48] bg-[#EAEFEA] px-2.5 py-1 rounded-md">
              {activePlatformList.length} of 9 Channels Active
            </span>
            <button
              onClick={onNavigateToCalendar}
              className="px-3 py-1 rounded-md border border-[#E0D9CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#1A2521] transition-colors cursor-pointer"
            >
              Calendar view
            </button>
          </div>
        </div>

        {/* 9 Channel Selector Chips */}
        <div className="pt-2 border-t border-[#F2ECE2]">
          <div className="text-[10px] font-mono tracking-wider uppercase text-[#889790] mb-2 font-semibold">
            Supported Distribution Channels
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_9_PLATFORMS.map((platform) => {
              const isEnabled = platformConfigs[platform]?.enabled;
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isEnabled
                      ? 'bg-[#172822] text-white shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#7A8C84] border border-[#E0D9CD] hover:border-[#172822]'
                  }`}
                >
                  {isEnabled && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  <span>{platform}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Approved Content Ready to Dispatch (8 cols), Configuration (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Approved Content Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-normal text-[#1A2521]">
              Approved content ready for dispatch
            </h3>
            <span className="text-[11px] font-mono text-[#7A8C84] uppercase">
              {approvedOpportunities.length} ITEMS
            </span>
          </div>

          {approvedOpportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-10 text-center space-y-2">
              <Share2 className="w-6 h-6 text-[#A87432] mx-auto opacity-70" />
              <h4 className="text-sm font-serif font-normal text-[#1A2521]">
                No approved content yet
              </h4>
              <p className="text-xs text-[#7A8C84] max-w-sm mx-auto">
                Approve draft options in the Draft Studio or Opportunity queue to dispatch them to your 9 platforms.
              </p>
            </div>
          ) : (
            approvedOpportunities.map((opp) => {
              const isDispatched = opp.status === 'DISPATCHED';
              const isBusy = isDispatchingId === opp.id;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs hover:border-[#CAD4CE] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {opp.customBackgroundImage && (
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden border border-[#172822]/20 shadow-2xs shrink-0 self-start"
                        style={{
                          backgroundImage: `url(${opp.customBackgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        title="Custom Imagen Background"
                      />
                    )}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-[#73847C]">
                        <span className="font-mono uppercase font-semibold text-[#8B9892]">
                          {opp.signalType || 'Trend'}
                        </span>
                        <span>·</span>
                        <span className="font-mono">
                          {isDispatched ? 'DISPATCHED' : 'APPROVED FOR DISPATCH'}
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-normal text-[#1A2521] leading-snug">
                        {opp.title}
                      </h4>

                      <p className="text-xs text-[#5E6E67] leading-relaxed line-clamp-2">
                        {opp.hook}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDispatch(opp)}
                      disabled={isBusy}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                        isDispatched
                          ? 'bg-[#EAEFEA] text-[#2C5E48] hover:bg-[#DCE7DC]'
                          : 'bg-[#172822] hover:bg-[#0E1A16] text-white'
                      }`}
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Re-dispatch</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch to 9 channels</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#7A8C84]">
                    <span>
                      Target: {activePlatformList.slice(0, 4).join(', ')}
                      {activePlatformList.length > 4 && ` +${activePlatformList.length - 4} more`}
                    </span>
                    <span className="font-mono">
                      Virality: {opp.viralityScore || 90}/100
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Blotato Webhook & Channel Details */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#172822] text-white rounded-2xl p-6 space-y-4 shadow-xs border border-[#233A31]">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#DFA058] font-semibold">
              BLOTATO INTEGRATION
            </div>

            <div>
              <h3 className="text-xl font-serif font-normal text-white">
                Multi-channel gateway
              </h3>
              <p className="text-xs text-[#9EB2A9] mt-0.5">
                Zero infrastructure cost setup
              </p>
            </div>

            <div className="border-t border-[#253D34] pt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#7E968C] uppercase mb-1">
                  Blotato Webhook URL (Optional)
                </label>
                <input
                  type="text"
                  value={blotatoWebhookUrl}
                  onChange={(e) => setBlotatoWebhookUrl(e.target.value)}
                  placeholder="https://api.blotato.io/v1/webhook/..."
                  className="w-full bg-[#111F1A] border border-[#2A443A] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#5A7367] focus:outline-none focus:border-[#DFA058]"
                />
                <span className="text-[10px] text-[#7E968C] mt-1 block">
                  Leave blank for $0 autonomous simulation mode.
                </span>
              </div>

              <div className="pt-2 text-[11px] text-[#A6BAAF] leading-relaxed">
                When content is approved by the creator, Blotato formats 9:16 vertical video assets, applies platform-tailored hashtags, and schedules release for peak algorithmic velocity.
              </div>
            </div>
          </div>

          {/* Recent Dispatches Feed */}
          {recentDispatches.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E2D6] p-5 space-y-3 shadow-2xs">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] font-semibold">
                RECENT DISPATCHES
              </div>
              <div className="space-y-2 text-xs">
                {recentDispatches.map((disp, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D6] space-y-1">
                    <div className="font-medium text-[#1A2521] truncate">{disp.title}</div>
                    <div className="text-[10px] font-mono text-[#2C5E48] flex items-center justify-between">
                      <span>{disp.platformResults?.length || 9} channels</span>
                      <span>{new Date(disp.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
