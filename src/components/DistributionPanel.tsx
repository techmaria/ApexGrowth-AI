import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  Flame,
  TrendingUp,
  Plus,
  Check,
  Save,
  HardDrive,
  Zap,
  ArrowRight,
  Filter,
  Play,
  CheckCheck,
  Globe2,
  Hash,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ContentOpportunity,
  SocialPlatform,
  ScheduledPost,
  DistributionSettings,
  PlatformScheduleConfig,
} from '../types';

export interface DistributionPanelProps {
  opportunities: ContentOpportunity[];
  onApproveOpportunity?: (opp: ContentOpportunity) => void;
  onUpdateOpportunityStatus?: (id: string, status: ContentOpportunity['status']) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
  onNavigateToPipeline?: () => void;
}

// LocalStorage Keys
export const STORAGE_KEY_DISTRIBUTION_SETTINGS = 'apexgrowth_distribution_settings';
export const STORAGE_KEY_SCHEDULED_POSTS = 'apexgrowth_scheduled_posts';

// Default Distribution Settings
const DEFAULT_DISTRIBUTION_SETTINGS: DistributionSettings = {
  autoScheduleOnApproval: true,
  frequencyMode: 'ai_peak',
  timezone: 'America/New_York (EST)',
  postsPerDay: 2,
  peakHourSlots: ['09:15', '13:30', '19:45'],
  enableCrossPlatformOffset: true,
  platforms: {
    Instagram: {
      enabled: true,
      accountHandle: '@apexgrowth.living',
      autoHashtags: true,
      customHashtags: '#ErgonomicLiving #WorkFromHome #HomeOfficeSetup #DeskHacks',
      preferredTimeSlot: '19:45',
      format: 'Instagram Reels (9:16)',
      crossPostDelayMinutes: 30,
      visibility: 'public',
    },
    TikTok: {
      enabled: true,
      accountHandle: '@apexgrowth_official',
      autoHashtags: true,
      customHashtags: '#fyp #officehacks #productivitytok #ergochair',
      preferredTimeSlot: '13:30',
      format: 'TikTok Video (9:16)',
      crossPostDelayMinutes: 0,
      visibility: 'public',
    },
    YouTube: {
      enabled: true,
      accountHandle: '@ApexGrowthLiving',
      autoHashtags: true,
      customHashtags: '#Shorts #OfficeSetup #DeskErgonomics #TechHacks',
      preferredTimeSlot: '09:15',
      format: 'YouTube Shorts (9:16)',
      crossPostDelayMinutes: 60,
      visibility: 'public',
    },
    X: {
      enabled: true,
      accountHandle: '@apexgrowth_ai',
      autoHashtags: true,
      customHashtags: '#growth #buildinpublic #productivity',
      preferredTimeSlot: '11:00',
      format: 'X Post (Video / Thread)',
      crossPostDelayMinutes: 45,
      visibility: 'public',
    },
    Facebook: {
      enabled: true,
      accountHandle: 'ApexGrowth Community',
      autoHashtags: true,
      customHashtags: '#workspace #homeoffice #productivity',
      preferredTimeSlot: '14:00',
      format: 'Facebook Reels (9:16)',
      crossPostDelayMinutes: 90,
      visibility: 'public',
    },
    LinkedIn: {
      enabled: true,
      accountHandle: 'ApexGrowth AI',
      autoHashtags: true,
      customHashtags: '#Productivity #WorkplaceWellness #FutureOfWork',
      preferredTimeSlot: '08:30',
      format: 'LinkedIn Video Post',
      crossPostDelayMinutes: 120,
      visibility: 'public',
    },
    Pinterest: {
      enabled: true,
      accountHandle: 'ApexGrowth Living',
      autoHashtags: true,
      customHashtags: '#deskinspiration #workspacegoals #homeoffice',
      preferredTimeSlot: '20:00',
      format: 'Idea Pin (9:16)',
      crossPostDelayMinutes: 180,
      visibility: 'public',
    },
    Threads: {
      enabled: true,
      accountHandle: '@apexgrowth.living',
      autoHashtags: true,
      customHashtags: '#creators #workspace #vibes',
      preferredTimeSlot: '12:15',
      format: 'Threads Post with Video',
      crossPostDelayMinutes: 75,
      visibility: 'public',
    },
    Bluesky: {
      enabled: true,
      accountHandle: 'apexgrowth.bsky.social',
      autoHashtags: true,
      customHashtags: '#growth #buildinpublic',
      preferredTimeSlot: '16:00',
      format: 'Bluesky Video Post',
      crossPostDelayMinutes: 105,
      visibility: 'public',
    },
  },
  blotatoWebhookUrl: 'https://api.blotato.io/v1/webhook/apexgrowth-us-east',
};

// Platform Brand Assets / Badges
function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#FAF8F4] text-[#172822] border border-[#E8E2D6]">
      {platform}
    </span>
  );
}

export const DistributionPanel: React.FC<DistributionPanelProps> = ({
  opportunities,
  onApproveOpportunity,
  onUpdateOpportunityStatus,
  onShowToast,
  onNavigateToPipeline,
}) => {
  // Navigation within DistributionPanel
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'approved' | 'channels' | 'settings'>('queue');

  // Distribution Settings State (with LocalStorage persistence)
  const [settings, setSettings] = useState<DistributionSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_DISTRIBUTION_SETTINGS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved distribution settings:', e);
      }
    }
    return DEFAULT_DISTRIBUTION_SETTINGS;
  });

  // Scheduled Posts State (with LocalStorage persistence)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SCHEDULED_POSTS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved scheduled posts:', e);
      }
    }
    return [];
  });

  // Scheduling Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedOppForSchedule, setSelectedOppForSchedule] = useState<ContentOpportunity | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['Instagram', 'TikTok', 'YouTube']);
  const [customCaption, setCustomCaption] = useState('');
  const [customTags, setCustomTags] = useState('');

  // Dispatch progress state
  const [isDispatching, setIsDispatching] = useState<string | null>(null); // post id being dispatched
  const [recentDispatchResult, setRecentDispatchResult] = useState<any | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter approved opportunities
  const approvedOpportunities = opportunities.filter(
    (o) => o.status === 'APPROVED' || o.status === 'DISPATCHED'
  );
  const queuedOpportunities = opportunities.filter((o) => o.status === 'QUEUED');

  // Sync settings to localStorage whenever changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_DISTRIBUTION_SETTINGS, JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to save distribution settings:', e);
      }
    }
  }, [settings]);

  // Sync scheduled posts to localStorage whenever changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SCHEDULED_POSTS, JSON.stringify(scheduledPosts));
      } catch (e) {
        console.warn('Failed to save scheduled posts:', e);
      }
    }
  }, [scheduledPosts]);

  // Auto-schedule approved opportunities if configured and not yet scheduled
  useEffect(() => {
    if (!settings.autoScheduleOnApproval) return;

    approvedOpportunities.forEach((opp, index) => {
      const alreadyScheduled = scheduledPosts.some((sp) => sp.opportunityId === opp.id);
      if (!alreadyScheduled) {
        // Compute optimal time slot based on peak slots
        const targetDate = new Date();
        targetDate.setHours(targetDate.getHours() + (index + 1) * 3);
        const isoTime = targetDate.toISOString();

        const activePlatforms: SocialPlatform[] = [];
        if (settings.platforms.Instagram.enabled) activePlatforms.push('Instagram');
        if (settings.platforms.TikTok.enabled) activePlatforms.push('TikTok');
        if (settings.platforms.YouTube.enabled) activePlatforms.push('YouTube');

        const newPost: ScheduledPost = {
          id: `SCHED-${opp.id}-${Date.now().toString(36)}`,
          opportunityId: opp.id,
          title: opp.title,
          hook: opp.hook,
          script: opp.script,
          niche: opp.niche,
          viralityScore: opp.viralityScore,
          predictedRetention: opp.predictedRetention,
          scheduledTime: isoTime,
          status: opp.status === 'DISPATCHED' ? 'DISPATCHED' : 'SCHEDULED',
          caption: `${opp.hook}\n\n${opp.script.split('\n')[0] || ''}`,
          hashtags: [
            ...settings.platforms.Instagram.customHashtags.split(' '),
            `#${opp.niche.replace(/\s+/g, '')}`,
          ].filter(Boolean),
          createdAt: new Date().toISOString(),
          platformStatuses: activePlatforms.map((p) => ({
            platform: p,
            status: opp.status === 'DISPATCHED' ? 'DISPATCHED' : 'PENDING',
            scheduledTime: isoTime,
            format: settings.platforms[p].format,
          })),
        };

        setScheduledPosts((prev) => [newPost, ...prev]);
      }
    });
  }, [opportunities, settings.autoScheduleOnApproval]);

  // Open Schedule Modal for a specific opportunity
  const handleOpenScheduleModal = (opp: ContentOpportunity) => {
    setSelectedOppForSchedule(opp);
    // Default to tomorrow at the evening peak slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, mins] = settings.peakHourSlots[2]?.split(':') || ['19', '45'];
    tomorrow.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hourStr = String(tomorrow.getHours()).padStart(2, '0');
    const minStr = String(tomorrow.getMinutes()).padStart(2, '0');
    setScheduleDateTime(`${year}-${month}-${day}T${hourStr}:${minStr}`);

    setSelectedPlatforms(['Instagram', 'TikTok', 'YouTube']);
    setCustomCaption(`${opp.hook}\n\n${opp.script}`);
    setCustomTags(
      `${settings.platforms.Instagram.customHashtags} #${opp.niche.replace(/\s+/g, '')} #ApexGrowth`
    );
    setIsScheduleModalOpen(true);
  };

  // Confirm creating a scheduled post
  const handleConfirmSchedule = () => {
    if (!selectedOppForSchedule) return;

    if (selectedPlatforms.length === 0) {
      onShowToast('warning', 'Please select at least one social media platform.');
      return;
    }

    const scheduledIso = new Date(scheduleDateTime || Date.now()).toISOString();
    const tagArray = customTags.split(/\s+/).filter((t) => t.startsWith('#'));

    const newPost: ScheduledPost = {
      id: `SCHED-${selectedOppForSchedule.id}-${Date.now().toString(36)}`,
      opportunityId: selectedOppForSchedule.id,
      title: selectedOppForSchedule.title,
      hook: selectedOppForSchedule.hook,
      script: selectedOppForSchedule.script,
      niche: selectedOppForSchedule.niche,
      viralityScore: selectedOppForSchedule.viralityScore,
      predictedRetention: selectedOppForSchedule.predictedRetention,
      scheduledTime: scheduledIso,
      status: 'SCHEDULED',
      caption: customCaption,
      hashtags: tagArray.length > 0 ? tagArray : ['#ApexGrowth', '#Ergonomics'],
      createdAt: new Date().toISOString(),
      platformStatuses: selectedPlatforms.map((p, idx) => {
        const offsetMinutes = settings.enableCrossPlatformOffset
          ? settings.platforms[p].crossPostDelayMinutes
          : 0;
        const postTime = new Date(new Date(scheduledIso).getTime() + offsetMinutes * 60000);
        return {
          platform: p,
          status: 'PENDING',
          scheduledTime: postTime.toISOString(),
          format: settings.platforms[p].format,
        };
      }),
    };

    setScheduledPosts((prev) => [newPost, ...prev.filter((p) => p.opportunityId !== selectedOppForSchedule.id)]);
    setIsScheduleModalOpen(false);
    onShowToast(
      'success',
      `Scheduled "${selectedOppForSchedule.title}" across ${selectedPlatforms.join(', ')} for ${new Date(scheduledIso).toLocaleString()}!`
    );
  };

  // Trigger automated dispatch execution
  const handleExecuteDispatch = async (post: ScheduledPost) => {
    setIsDispatching(post.id);
    try {
      const opp = opportunities.find((o) => o.id === post.opportunityId) || {
        id: post.opportunityId,
        title: post.title,
        hook: post.hook,
        script: post.script,
        niche: post.niche,
        predictedRetention: post.predictedRetention,
        viralityScore: post.viralityScore,
        platforms: post.platformStatuses.map((p) => p.platform),
        signal: 'Automated Dispatch Trigger',
        veo_prompt: '',
        imagen_prompt: '',
        audience: 'Remote workers & founders',
        tone: 'Educational & Authoritative',
        status: 'DISPATCHED' as const,
      };

      const platformsToDispatch = post.platformStatuses.map((p) => p.platform);

      const res = await fetch('/api/distribution/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: opp,
          platforms: platformsToDispatch,
          caption: post.caption,
          hashtags: post.hashtags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecentDispatchResult(data);

        // Update post platform statuses with live results
        const updatedPlatformStatuses = post.platformStatuses.map((pStatus) => {
          const match = data.platformResults?.find((r: any) => r.platform === pStatus.platform);
          return {
            ...pStatus,
            status: 'DISPATCHED' as const,
            dispatchedAt: data.timestamp || new Date().toISOString(),
            postId: match?.postId || `post_${Date.now()}`,
            postUrl: match?.postUrl || `https://${pStatus.platform.toLowerCase()}.com/post`,
          };
        });

        // Update local scheduled post
        setScheduledPosts((prev) =>
          prev.map((item) =>
            item.id === post.id
              ? {
                  ...item,
                  status: 'DISPATCHED',
                  platformStatuses: updatedPlatformStatuses,
                }
              : item
          )
        );

        // Inform parent app that opportunity is now DISPATCHED
        if (onUpdateOpportunityStatus) {
          onUpdateOpportunityStatus(post.opportunityId, 'DISPATCHED');
        }

        onShowToast(
          'success',
          `Automated social dispatch complete! Published to ${platformsToDispatch.join(', ')}.`
        );
      } else {
        throw new Error('Dispatch failed');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      // Fallback update
      setScheduledPosts((prev) =>
        prev.map((item) =>
          item.id === post.id
            ? {
                ...item,
                status: 'DISPATCHED',
                platformStatuses: item.platformStatuses.map((ps) => ({
                  ...ps,
                  status: 'DISPATCHED',
                  dispatchedAt: new Date().toISOString(),
                  postUrl: `https://${ps.platform.toLowerCase()}.com/apexgrowth/reel/live`,
                })),
              }
            : item
        )
      );
      if (onUpdateOpportunityStatus) {
        onUpdateOpportunityStatus(post.opportunityId, 'DISPATCHED');
      }
      onShowToast('success', `Simulated dispatch complete for ${post.title}!`);
    } finally {
      setIsDispatching(null);
    }
  };

  // Delete scheduled post
  const handleDeletePost = (id: string) => {
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
    onShowToast('info', 'Scheduled post removed from distribution queue.');
  };

  // One-click Auto-Schedule All Approved Opportunities
  const handleAutoScheduleAllApproved = () => {
    if (approvedOpportunities.length === 0) {
      onShowToast('warning', 'No approved opportunities available to schedule.');
      return;
    }

    const activePlatforms: SocialPlatform[] = [];
    if (settings.platforms.Instagram.enabled) activePlatforms.push('Instagram');
    if (settings.platforms.TikTok.enabled) activePlatforms.push('TikTok');
    if (settings.platforms.YouTube.enabled) activePlatforms.push('YouTube');

    if (activePlatforms.length === 0) {
      onShowToast('warning', 'Please enable at least one platform in Channel settings.');
      return;
    }

    let addedCount = 0;
    const newPosts: ScheduledPost[] = [];

    approvedOpportunities.forEach((opp, i) => {
      const exists = scheduledPosts.some((sp) => sp.opportunityId === opp.id && sp.status === 'SCHEDULED');
      if (!exists) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Math.floor(i / settings.peakHourSlots.length));
        const slot = settings.peakHourSlots[i % settings.peakHourSlots.length] || '19:45';
        const [hours, mins] = slot.split(':');
        targetDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

        newPosts.push({
          id: `SCHED-${opp.id}-${Date.now().toString(36)}`,
          opportunityId: opp.id,
          title: opp.title,
          hook: opp.hook,
          script: opp.script,
          niche: opp.niche,
          viralityScore: opp.viralityScore,
          predictedRetention: opp.predictedRetention,
          scheduledTime: targetDate.toISOString(),
          status: 'SCHEDULED',
          caption: `${opp.hook}\n\n${opp.script}`,
          hashtags: ['#ApexGrowth', `#${opp.niche.replace(/\s+/g, '')}`, '#ViralContent', '#GrowthHacks'],
          createdAt: new Date().toISOString(),
          platformStatuses: activePlatforms.map((p) => {
            const delay = settings.enableCrossPlatformOffset
              ? settings.platforms[p].crossPostDelayMinutes
              : 0;
            const itemTime = new Date(targetDate.getTime() + delay * 60000);
            return {
              platform: p,
              status: 'PENDING',
              scheduledTime: itemTime.toISOString(),
              format: settings.platforms[p].format,
            };
          }),
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setScheduledPosts((prev) => [...newPosts, ...prev]);
      onShowToast(
        'success',
        `Automated queue populated! Scheduled ${addedCount} approved items into optimal peak engagement windows.`
      );
    } else {
      onShowToast('info', 'All approved opportunities are already slotted in the distribution queue.');
    }
  };

  // Quick 1-click sample approval from queued opportunities
  const handleQuickApproveQueueItem = () => {
    if (queuedOpportunities.length > 0 && onApproveOpportunity) {
      const target = queuedOpportunities[0];
      onApproveOpportunity(target);
      onShowToast('success', `Approved "${target.title}"! Now ready for social media scheduling.`);
    }
  };

  // Reset to default settings
  const handleResetSettings = () => {
    setSettings(DEFAULT_DISTRIBUTION_SETTINGS);
    onShowToast('info', 'Distribution settings reset to recommended defaults.');
  };

  // Filter scheduled posts
  const filteredPosts = scheduledPosts.filter((post) => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false;
    if (filterPlatform !== 'all') {
      const hasPlat = post.platformStatuses.some((p) => p.platform === filterPlatform);
      if (!hasPlat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Social Media Distribution & Scheduling Engine
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Automated
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Automate cross-platform scheduling across <strong className="text-pink-300">Instagram Reels</strong>, <strong className="text-cyan-300">TikTok</strong>, and <strong className="text-rose-300">YouTube Shorts</strong> leveraging human-approved opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="px-3 py-1.5 border-r border-slate-800/80">
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Approved
              </div>
              <div className="text-lg font-bold text-white mt-0.5 font-mono">
                {approvedOpportunities.length}
              </div>
            </div>

            <div className="px-3 py-1.5 border-r border-slate-800/80">
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                In Queue
              </div>
              <div className="text-lg font-bold text-indigo-300 mt-0.5 font-mono">
                {scheduledPosts.filter((p) => p.status === 'SCHEDULED').length}
              </div>
            </div>

            <div className="px-3 py-1.5 border-r border-slate-800/80">
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Send className="w-3 h-3 text-cyan-400" />
                Dispatched
              </div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5 font-mono">
                {scheduledPosts.filter((p) => p.status === 'DISPATCHED').length}
              </div>
            </div>

            <div className="px-3 py-1.5">
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Next Peak Slot
              </div>
              <div className="text-sm font-bold text-amber-300 mt-1 font-mono">
                {settings.peakHourSlots[0] || '13:30'} EST
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled Releases ({scheduledPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('approved')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved Opportunities ({approvedOpportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('channels')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'channels'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Channel Configurations (IG, TikTok, YT)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeSubTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Automation Cadence & Rules</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SCHEDULED RELEASES QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="SCHEDULED">Scheduled (Pending)</option>
                <option value="DISPATCHED">Dispatched (Published)</option>
              </select>

              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Platforms</option>
                <option value="Instagram">Instagram Reels</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube Shorts</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoScheduleAllApproved}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Slot All Approved ({approvedOpportunities.length})</span>
              </button>

              {scheduledPosts.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all scheduled posts from local queue?')) {
                      setScheduledPosts([]);
                      onShowToast('info', 'Distribution queue cleared.');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all border border-slate-800"
                  title="Clear Queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-800/40 shadow-inner">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-100">
                  No Posts Currently Slotted in Distribution Queue
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated distribution leverages content opportunities approved via the HITL Pipeline.
                  {approvedOpportunities.length > 0
                    ? ` You have ${approvedOpportunities.length} approved opportunity ready for automated scheduling.`
                    : ' Approve an opportunity from the pipeline to start scheduling.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {approvedOpportunities.length > 0 ? (
                  <button
                    onClick={handleAutoScheduleAllApproved}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Auto-Schedule {approvedOpportunities.length} Approved Items Now</span>
                  </button>
                ) : (
                  <>
                    {queuedOpportunities.length > 0 && onApproveOpportunity && (
                      <button
                        onClick={handleQuickApproveQueueItem}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Approve Top Opportunity from Queue</span>
                      </button>
                    )}
                    {onNavigateToPipeline && (
                      <button
                        onClick={onNavigateToPipeline}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Go to HITL Pipeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Scheduled Releases List */
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const targetDate = new Date(post.scheduledTime);
                const isDispatched = post.status === 'DISPATCHED';

                return (
                  <div
                    key={post.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 transition-all space-y-4 backdrop-blur-sm ${
                      isDispatched
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isDispatched
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            {post.status}
                          </span>

                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {targetDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {targetDate.toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {post.id.slice(0, 16)}...
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {post.title}
                        </h4>

                        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                          <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Viral Hook:
                          </div>
                          <p className="italic text-slate-200">"{post.hook}"</p>
                        </div>
                      </div>

                      {/* Virality and Retention Badges */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Virality: {post.viralityScore}/100</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Retention: {post.predictedRetention}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Platform Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {post.platformStatuses.map((pStatus) => (
                        <div
                          key={pStatus.platform}
                          className="bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <PlatformBadge platform={pStatus.platform} />
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>Format: {pStatus.format}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {pStatus.status === 'DISPATCHED' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  Live
                                </span>
                                {pStatus.postUrl && (
                                  <a
                                    href={pStatus.postUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-[10px] text-indigo-400 hover:text-indigo-300 underline flex items-center gap-0.5 justify-end"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                                <Clock className="w-3 h-3" />
                                Queued
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hashtags & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        <Hash className="w-3 h-3 text-slate-500" />
                        {post.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-slate-950 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {!isDispatched && (
                          <button
                            onClick={() => handleExecuteDispatch(post)}
                            disabled={isDispatching === post.id}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isDispatching === post.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Dispatching...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Dispatch Now (All Channels)</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Remove from schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: APPROVED OPPORTUNITIES SOURCE */}
      {activeSubTab === 'approved' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Human-Approved Opportunities Ready for Distribution
              </h3>
              <p className="text-xs text-slate-400">
                These options have been validated in the HITL Pipeline and have Veo/Imagen prompts generated.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoScheduleAllApproved}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Schedule All Approved</span>
              </button>
            </div>
          </div>

          {approvedOpportunities.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/60 text-amber-400 mx-auto flex items-center justify-center border border-amber-800/40 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-100">
                  No Approved Opportunities Yet
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to the <strong>HITL Pipeline</strong> tab to review and approve generated opportunities. Once approved, they will immediately appear here ready to be distributed.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {queuedOpportunities.length > 0 && onApproveOpportunity && (
                  <button
                    onClick={handleQuickApproveQueueItem}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Approve Top Opportunity Now ({queuedOpportunities[0].title.slice(0, 25)}...)</span>
                  </button>
                )}
                {onNavigateToPipeline && (
                  <button
                    onClick={onNavigateToPipeline}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View HITL Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedOpportunities.map((opp) => {
                const isScheduled = scheduledPosts.some(
                  (p) => p.opportunityId === opp.id && p.status === 'SCHEDULED'
                );
                const isDispatched = opp.status === 'DISPATCHED';

                return (
                  <div
                    key={opp.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 space-y-4 transition-all ${
                      isDispatched
                        ? 'border-emerald-500/40'
                        : isScheduled
                        ? 'border-indigo-500/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                            {opp.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isDispatched
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {opp.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                          ⚡ {opp.viralityScore}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                          📈 {opp.predictedRetention}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">Hook & Angle:</div>
                      <p className="text-slate-200 italic">"{opp.hook}"</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Channels:</span>
                      {opp.platforms.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                      <div className="text-[11px] text-slate-400 font-mono">
                        {isDispatched
                          ? '✅ Dispatched to social feeds'
                          : isScheduled
                          ? '⏳ Slotted in release queue'
                          : '⚡ Ready to schedule'}
                      </div>

                      <button
                        onClick={() => handleOpenScheduleModal(opp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{isScheduled ? 'Adjust Schedule' : 'Configure Schedule'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: CHANNEL CONFIGURATIONS */}
      {activeSubTab === 'channels' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Multi-Platform Distribution Profiles
              </h3>
              <p className="text-xs text-slate-400">
                Configure account handles, preferred posting formats, automated hashtags, and cross-posting offsets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                <HardDrive className="w-3.5 h-3.5" />
                Synced to LocalStorage
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* INSTAGRAM PROFILE CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-orange-500 flex items-center justify-center text-white">
                    <PlatformBadge platform="Instagram" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Instagram</h4>
                    <span className="text-[10px] text-pink-300 font-mono">Meta Graph API</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platforms.Instagram.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          Instagram: { ...settings.platforms.Instagram, enabled: e.target.checked },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Connected Instagram Handle:
                  </label>
                  <input
                    type="text"
                    value={settings.platforms.Instagram.accountHandle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          Instagram: { ...settings.platforms.Instagram, accountHandle: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Video Target Format:
                  </label>
                  <select
                    value={settings.platforms.Instagram.format}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          Instagram: { ...settings.platforms.Instagram, format: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="Instagram Reels (9:16)">Instagram Reels (9:16 Vertical)</option>
                    <option value="Instagram Story (9:16)">Instagram Story (24h Teaser)</option>
                    <option value="Carousel Post">Carousel (1:1 Square)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Preferred Time Slot (EST):
                  </label>
                  <input
                    type="time"
                    value={settings.platforms.Instagram.preferredTimeSlot}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          Instagram: { ...settings.platforms.Instagram, preferredTimeSlot: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Automated Hashtags:
                  </label>
                  <textarea
                    rows={2}
                    value={settings.platforms.Instagram.customHashtags}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          Instagram: { ...settings.platforms.Instagram, customHashtags: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Cross-Post Offset:</span>
                  <span className="font-mono text-pink-300 font-bold text-xs">+30 min</span>
                </div>
              </div>
            </div>

            {/* TIKTOK PROFILE CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
                    <PlatformBadge platform="TikTok" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">TikTok</h4>
                    <span className="text-[10px] text-cyan-300 font-mono">Content Posting API</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platforms.TikTok.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          TikTok: { ...settings.platforms.TikTok, enabled: e.target.checked },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Connected TikTok Handle:
                  </label>
                  <input
                    type="text"
                    value={settings.platforms.TikTok.accountHandle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          TikTok: { ...settings.platforms.TikTok, accountHandle: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Video Target Format:
                  </label>
                  <select
                    value={settings.platforms.TikTok.format}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          TikTok: { ...settings.platforms.TikTok, format: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="TikTok Video (9:16)">TikTok Vertical Video (9:16)</option>
                    <option value="TikTok Photo Mode">Photo Mode (Slideshow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Preferred Time Slot (EST):
                  </label>
                  <input
                    type="time"
                    value={settings.platforms.TikTok.preferredTimeSlot}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          TikTok: { ...settings.platforms.TikTok, preferredTimeSlot: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Automated Hashtags:
                  </label>
                  <textarea
                    rows={2}
                    value={settings.platforms.TikTok.customHashtags}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          TikTok: { ...settings.platforms.TikTok, customHashtags: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Primary Channel:</span>
                  <span className="font-mono text-cyan-300 font-bold text-xs">Immediate Release</span>
                </div>
              </div>
            </div>

            {/* YOUTUBE PROFILE CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/70 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <PlatformBadge platform="YouTube" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">YouTube</h4>
                    <span className="text-[10px] text-rose-300 font-mono">YouTube Data API v3</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platforms.YouTube.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          YouTube: { ...settings.platforms.YouTube, enabled: e.target.checked },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Connected Channel Handle:
                  </label>
                  <input
                    type="text"
                    value={settings.platforms.YouTube.accountHandle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          YouTube: { ...settings.platforms.YouTube, accountHandle: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Visibility Setting:
                  </label>
                  <select
                    value={settings.platforms.YouTube.visibility}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          YouTube: { ...settings.platforms.YouTube, visibility: e.target.value as any },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="public">Public (Immediate Feed Indexing)</option>
                    <option value="unlisted">Unlisted (Review Link First)</option>
                    <option value="private">Private (Cloud Staged)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Preferred Time Slot (EST):
                  </label>
                  <input
                    type="time"
                    value={settings.platforms.YouTube.preferredTimeSlot}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          YouTube: { ...settings.platforms.YouTube, preferredTimeSlot: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Automated Hashtags & SEO Tags:
                  </label>
                  <textarea
                    rows={2}
                    value={settings.platforms.YouTube.customHashtags}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platforms: {
                          ...settings.platforms,
                          YouTube: { ...settings.platforms.YouTube, customHashtags: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Cross-Post Offset:</span>
                  <span className="font-mono text-rose-300 font-bold text-xs">+60 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AUTOMATION CADENCE & RULES */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Automated Scheduling Rules & Cadence Engine
              </h3>
              <p className="text-xs text-slate-400">
                Configure automated rules for when and how approved content opportunities enter the social media dispatch queue.
              </p>
            </div>

            <button
              onClick={handleResetSettings}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Schedule Rule */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Auto-Queue on Approval
                  </h4>
                  <p className="text-xs text-slate-400">
                    When enabled, as soon as an opportunity is marked <strong className="text-emerald-400">APPROVED</strong> in the HITL Pipeline, it is automatically scheduled for the next optimal peak time slot.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoScheduleOnApproval}
                    onChange={(e) =>
                      setSettings({ ...settings, autoScheduleOnApproval: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Cross-Platform Offset */}
              <div className="border-t border-slate-800/80 pt-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Staggered Cross-Posting Offset
                  </h4>
                  <p className="text-xs text-slate-400">
                    Stagger release times across platforms (TikTok first, Instagram +30m, YouTube +60m) to avoid cannibalizing initial audience views.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableCrossPlatformOffset}
                    onChange={(e) =>
                      setSettings({ ...settings, enableCrossPlatformOffset: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Peak Hours Configuration */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Algorithm Peak Engagement Windows
              </h4>
              <p className="text-xs text-slate-400">
                ApexGrowth automatically queues video assets to match highest organic audience activity periods for short-form video.
              </p>

              <div className="space-y-2">
                {settings.peakHourSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-300">
                      Slot {index + 1}: {index === 0 ? 'Morning Peak' : index === 1 ? 'Lunch Window' : 'Evening Prime'}
                    </span>
                    <input
                      type="time"
                      value={slot}
                      onChange={(e) => {
                        const updated = [...settings.peakHourSlots];
                        updated[index] = e.target.value;
                        setSettings({ ...settings, peakHourSlots: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-indigo-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Timezone Standard:
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="America/New_York (EST)">America/New_York (EST / UTC-5)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / UTC-8)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT / UTC+0)</option>
                  <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST / UTC+9)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && selectedOppForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Schedule Social Media Distribution
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Selected Opportunity Card Preview */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400">
                  {selectedOppForSchedule.id} • {selectedOppForSchedule.niche}
                </span>
                <h4 className="text-xs font-bold text-white">{selectedOppForSchedule.title}</h4>
                <p className="text-[11px] text-slate-300 italic">"{selectedOppForSchedule.hook}"</p>
              </div>

              {/* Platforms Selection */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Distribute Across Channels:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Instagram', 'TikTok', 'YouTube'] as SocialPlatform[]).map((p) => {
                    const isSelected = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
                          } else {
                            setSelectedPlatforms([...selectedPlatforms, p]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <PlatformBadge platform={p} />
                        <span className="text-[10px] font-mono mt-0.5">
                          {isSelected ? '✓ Selected' : '+ Add'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Picker */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Scheduled Release Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Caption & Hook */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Generated Caption & Narration:
                </label>
                <textarea
                  rows={3}
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Social Hashtags:
                </label>
                <input
                  type="text"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  placeholder="#Ergonomics #DeskSetup #RemoteWork"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save to Release Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
