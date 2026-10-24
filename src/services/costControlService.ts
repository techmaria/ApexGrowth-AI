import { CostControlStatus, ProviderAdapterInfo } from '../types';

const STORAGE_KEY_COUNTERS = 'apexgrowth_cost_control_counters_v1';
const STORAGE_KEY_DATE = 'apexgrowth_cost_control_utc_date_v1';

// Conservative prototype daily limits under ZERO_BILLING mode
export const ZERO_BILLING_LIMITS = {
  geminiTextGenerationsLimit: 10,
  opportunityDiscoveriesLimit: 5,
  videoRenderAttemptsLimit: 2,
  videoIntelAnalysesLimit: 5,
  aiVideoGenerationsLimit: 0, // Blocked until verified free provider connected
  maxConcurrentAiJobs: 1,
  maxConcurrentVideoRenders: 1,
};

export type TrackedOperation =
  | 'gemini_text'
  | 'opportunity_discovery'
  | 'video_render'
  | 'video_intel'
  | 'ai_video';

interface DailyCounters {
  geminiTextGenerations: number;
  opportunityDiscoveries: number;
  videoRenderAttempts: number;
  videoIntelAnalyses: number;
  aiVideoGenerations: number;
}

const DEFAULT_COUNTERS: DailyCounters = {
  geminiTextGenerations: 2,
  opportunityDiscoveries: 1,
  videoRenderAttempts: 0,
  videoIntelAnalyses: 1,
  aiVideoGenerations: 0,
};

function getUtcDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getTimeUntilUtcMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diffMs = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function loadCounters(): DailyCounters {
  try {
    const todayUtc = getUtcDateString();
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE);

    if (storedDate !== todayUtc) {
      // New UTC day: reset daily counters
      localStorage.setItem(STORAGE_KEY_DATE, todayUtc);
      localStorage.setItem(STORAGE_KEY_COUNTERS, JSON.stringify(DEFAULT_COUNTERS));
      return { ...DEFAULT_COUNTERS };
    }

    const storedData = localStorage.getItem(STORAGE_KEY_COUNTERS);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.warn('CostControl: Could not read counters from localStorage', e);
  }
  return { ...DEFAULT_COUNTERS };
}

function saveCounters(counters: DailyCounters): void {
  try {
    localStorage.setItem(STORAGE_KEY_COUNTERS, JSON.stringify(counters));
    localStorage.setItem(STORAGE_KEY_DATE, getUtcDateString());
  } catch (e) {
    console.warn('CostControl: Could not persist counters to localStorage', e);
  }
}

export const MODULAR_PROVIDERS: ProviderAdapterInfo[] = [
  {
    id: 'prov-gemini',
    name: 'Google Gemini (gemini-3.8-flash)',
    category: 'Text Generation',
    status: 'CONNECTED',
    costClassification: 'FREE_TIER_ELIGIBLE',
    pricingVerified: true,
    notes: 'Free-tier eligible via Google AI Studio API key. Rate-limited to 10 daily generations.',
  },
  {
    id: 'prov-search-grounding',
    name: 'Google Search Grounding',
    category: 'Trend Discovery',
    status: 'CONNECTED',
    costClassification: 'FREE_TIER_ELIGIBLE',
    pricingVerified: true,
    notes: 'Grounding query expansion via Gemini 3.8 Flash tools. Max 5 scans daily.',
  },
  {
    id: 'prov-video-multimodal',
    name: 'Gemini Multimodal Video Engine',
    category: 'Analytics',
    status: 'CONNECTED',
    costClassification: 'FREE_TIER_ELIGIBLE',
    pricingVerified: true,
    notes: 'Processes video keyframes and verbatim audio with gemini-3.8-flash. Max 5 analyses daily.',
  },
  {
    id: 'prov-stock-media',
    name: 'Free Stock Asset Discovery',
    category: 'Stock Video Discovery',
    status: 'CONNECTED',
    costClassification: 'ZERO_COST',
    pricingVerified: true,
    notes: 'Built-in curated B-roll repository and public license assets with zero billing.',
  },
  {
    id: 'prov-client-renderer',
    name: 'Browser WebCodecs / Canvas Studio',
    category: 'Video Rendering',
    status: 'CONNECTED',
    costClassification: 'ZERO_COST',
    pricingVerified: true,
    notes: 'Runs 100% in client browser memory with HTML5 Canvas. Zero cloud render compute required.',
  },
  {
    id: 'prov-generative-video',
    name: 'Veo / GenAI Video Engine',
    category: 'AI Video Generation',
    status: 'DISABLED',
    costClassification: 'BLOCKED_PAID',
    pricingVerified: false,
    notes: 'Gated to 0 calls. Blocked by ZERO_BILLING mode to prevent unexpected cloud charges.',
  },
  {
    id: 'prov-database',
    name: 'Client LocalStorage + Sheets Sync',
    category: 'Database',
    status: 'CONNECTED',
    costClassification: 'ZERO_COST',
    pricingVerified: true,
    notes: 'Zero-cloud persistent storage. Optional Google Sheets OAuth for spreadsheet sync.',
  },
  {
    id: 'prov-social-publish',
    name: 'Social Distribution Dispatcher',
    category: 'Social Publishing',
    status: 'CONNECTED',
    costClassification: 'ZERO_COST',
    pricingVerified: true,
    notes: 'Manual creator approval required. Direct clipboard/download workflow, no paid buffer fees.',
  },
];

export function getCostControlStatus(): CostControlStatus {
  const counters = loadCounters();

  return {
    mode: 'ZERO_BILLING',
    utcResetDate: getUtcDateString(),
    timeUntilResetUtc: getTimeUntilUtcMidnight(),
    dailyCounters: {
      geminiTextGenerations: counters.geminiTextGenerations,
      geminiTextGenerationsLimit: ZERO_BILLING_LIMITS.geminiTextGenerationsLimit,
      opportunityDiscoveries: counters.opportunityDiscoveries,
      opportunityDiscoveriesLimit: ZERO_BILLING_LIMITS.opportunityDiscoveriesLimit,
      videoRenderAttempts: counters.videoRenderAttempts,
      videoRenderAttemptsLimit: ZERO_BILLING_LIMITS.videoRenderAttemptsLimit,
      videoIntelAnalyses: counters.videoIntelAnalyses,
      videoIntelAnalysesLimit: ZERO_BILLING_LIMITS.videoIntelAnalysesLimit,
      aiVideoGenerations: counters.aiVideoGenerations,
      aiVideoGenerationsLimit: ZERO_BILLING_LIMITS.aiVideoGenerationsLimit,
    },
    concurrency: {
      activeJobs: 0,
      maxConcurrentAiJobs: ZERO_BILLING_LIMITS.maxConcurrentAiJobs,
      maxConcurrentVideoRenders: ZERO_BILLING_LIMITS.maxConcurrentVideoRenders,
    },
    safeguards: {
      paidApiCallsBlocked: true,
      automaticPurchasesDisabled: true,
      autoPublishingDisabled: true,
      circuitBreakerOpen: false,
    },
    providers: MODULAR_PROVIDERS,
  };
}

export function canExecuteOperation(op: TrackedOperation): {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxLimit?: number;
} {
  const counters = loadCounters();

  switch (op) {
    case 'gemini_text':
      if (counters.geminiTextGenerations >= ZERO_BILLING_LIMITS.geminiTextGenerationsLimit) {
        return {
          allowed: false,
          reason: `Daily Gemini generation limit reached (${counters.geminiTextGenerations}/${ZERO_BILLING_LIMITS.geminiTextGenerationsLimit}). Resets 00:00 UTC.`,
          currentCount: counters.geminiTextGenerations,
          maxLimit: ZERO_BILLING_LIMITS.geminiTextGenerationsLimit,
        };
      }
      return { allowed: true, currentCount: counters.geminiTextGenerations, maxLimit: ZERO_BILLING_LIMITS.geminiTextGenerationsLimit };

    case 'opportunity_discovery':
      if (counters.opportunityDiscoveries >= ZERO_BILLING_LIMITS.opportunityDiscoveriesLimit) {
        return {
          allowed: false,
          reason: `Daily opportunity refresh limit reached (${counters.opportunityDiscoveries}/${ZERO_BILLING_LIMITS.opportunityDiscoveriesLimit}). Resets 00:00 UTC.`,
          currentCount: counters.opportunityDiscoveries,
          maxLimit: ZERO_BILLING_LIMITS.opportunityDiscoveriesLimit,
        };
      }
      return { allowed: true, currentCount: counters.opportunityDiscoveries, maxLimit: ZERO_BILLING_LIMITS.opportunityDiscoveriesLimit };

    case 'video_render':
      if (counters.videoRenderAttempts >= ZERO_BILLING_LIMITS.videoRenderAttemptsLimit) {
        return {
          allowed: false,
          reason: `Daily video render attempts limit reached (${counters.videoRenderAttempts}/${ZERO_BILLING_LIMITS.videoRenderAttemptsLimit}). Resets 00:00 UTC.`,
          currentCount: counters.videoRenderAttempts,
          maxLimit: ZERO_BILLING_LIMITS.videoRenderAttemptsLimit,
        };
      }
      return { allowed: true, currentCount: counters.videoRenderAttempts, maxLimit: ZERO_BILLING_LIMITS.videoRenderAttemptsLimit };

    case 'video_intel':
      if (counters.videoIntelAnalyses >= ZERO_BILLING_LIMITS.videoIntelAnalysesLimit) {
        return {
          allowed: false,
          reason: `Daily video intelligence analysis limit reached (${counters.videoIntelAnalyses}/${ZERO_BILLING_LIMITS.videoIntelAnalysesLimit}). Resets 00:00 UTC.`,
          currentCount: counters.videoIntelAnalyses,
          maxLimit: ZERO_BILLING_LIMITS.videoIntelAnalysesLimit,
        };
      }
      return { allowed: true, currentCount: counters.videoIntelAnalyses, maxLimit: ZERO_BILLING_LIMITS.videoIntelAnalysesLimit };

    case 'ai_video':
      return {
        allowed: false,
        reason: 'Generative AI Video is gated in ZERO_BILLING mode (0 credits allowed) to prevent cloud billing.',
        currentCount: 0,
        maxLimit: 0,
      };

    default:
      return { allowed: true };
  }
}

export function recordOperation(op: TrackedOperation): void {
  const counters = loadCounters();

  switch (op) {
    case 'gemini_text':
      counters.geminiTextGenerations += 1;
      break;
    case 'opportunity_discovery':
      counters.opportunityDiscoveries += 1;
      break;
    case 'video_render':
      counters.videoRenderAttempts += 1;
      break;
    case 'video_intel':
      counters.videoIntelAnalyses += 1;
      break;
    case 'ai_video':
      counters.aiVideoGenerations += 1;
      break;
  }

  saveCounters(counters);
}

export function resetCountersForTesting(): void {
  localStorage.setItem(STORAGE_KEY_COUNTERS, JSON.stringify(DEFAULT_COUNTERS));
  localStorage.setItem(STORAGE_KEY_DATE, getUtcDateString());
}
