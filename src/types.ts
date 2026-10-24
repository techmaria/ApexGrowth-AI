export type SignalCategory = 'Trend' | 'News' | 'Personal idea' | 'Event' | 'Creative reference';

export interface PerformanceStats {
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  edited?: boolean;
}

export interface ContentOpportunity {
  id: string;
  signal: string;
  signalType?: SignalCategory;
  sourceContext?: string;
  dateAdded?: string;
  title: string;
  hook: string;
  script: string;
  veo_prompt: string;
  imagen_prompt: string;
  predictedRetention: number;
  viralityScore: number;
  platforms: string[];
  niche: string;
  audience: string;
  tone: string;
  status: 'QUEUED' | 'APPROVED' | 'RENDERING' | 'DISPATCHED' | 'REJECTED';
  cloudStorageStatus?: string;
  bigqueryTelemetry?: string;
  rejectionReason?: string;
  scheduledReminderTime?: string;
  calendarStatus?: 'Approved' | 'Scheduled' | 'Published';
  performance?: PerformanceStats;
  customBackgroundImage?: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  niche: string;
  signal: string;
  title: string;
  hook: string;
  status: 'QUEUED' | 'APPROVED' | 'RENDERING' | 'DISPATCHED' | 'REJECTED';
  platforms: string[];
  veoPrompt: string;
  imagenPrompt: string;
  gcsBucketUri?: string;
  predictedRetention: number;
  viralityScore: number;
  feedback?: string;
}

export interface CreatorBrief {
  businessName?: string;
  niche: string;
  audience: string;
  location?: string;
  language?: string;
  platforms: string[];
  tone: string;
  goals?: string;
  referenceStyles?: string;
}

export interface DraftOption {
  id: string;
  title: string;
  hook: string;
  script: string;
  angle: string;
  style: string;
  platforms: string[];
  visualDirection?: string;
  veoPrompt?: string;
  imagenPrompt?: string;
  predictedRetention?: number;
  viralityScore?: number;
  approved?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  customBackgroundImage?: string;
}

export interface GMCFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  price: string;
  google_product_category: string;
  brand: string;
  gtin: string;
  mpn: string;
  condition: 'new' | 'refurbished' | 'used';
  custom_label_0: string; // Viral Hook / Campaign Angle
  custom_label_1: string; // Platform Target
  custom_label_2: string; // Virality / Retention Metric
  custom_label_3?: string;
  marketingHighlights?: string[];
  opportunityId?: string;
  status?: 'READY' | 'PUBLISHED';
}

export type SocialPlatform =
  | 'TikTok'
  | 'Instagram'
  | 'YouTube'
  | 'X'
  | 'Facebook'
  | 'LinkedIn'
  | 'Pinterest'
  | 'Threads'
  | 'Bluesky';

export interface PlatformScheduleConfig {
  enabled: boolean;
  accountHandle: string;
  autoHashtags: boolean;
  customHashtags: string;
  preferredTimeSlot: string;
  format: string;
  crossPostDelayMinutes: number;
  visibility: 'public' | 'unlisted' | 'private';
}

export interface ScheduledPostPlatformStatus {
  platform: SocialPlatform;
  status: 'PENDING' | 'DISPATCHED' | 'FAILED' | 'SKIPPED';
  scheduledTime: string;
  dispatchedAt?: string;
  postUrl?: string;
  postId?: string;
  format?: string;
}

export interface ScheduledPost {
  id: string;
  opportunityId: string;
  title: string;
  hook: string;
  script: string;
  niche: string;
  viralityScore: number;
  predictedRetention: number;
  scheduledTime: string; // Target dispatch ISO
  status: 'SCHEDULED' | 'DISPATCHED' | 'PAUSED' | 'CANCELLED';
  platformStatuses: ScheduledPostPlatformStatus[];
  caption: string;
  hashtags: string[];
  createdAt: string;
}

export interface DistributionSettings {
  autoScheduleOnApproval: boolean;
  frequencyMode: 'ai_peak' | 'fixed_interval' | 'manual';
  timezone: string;
  postsPerDay: number;
  peakHourSlots: string[];
  platforms: Record<SocialPlatform, PlatformScheduleConfig>;
  blotatoWebhookUrl?: string;
  enableCrossPlatformOffset: boolean;
}

export interface DemographicInsights {
  ageBracket: string;
  primaryRoles: string[];
  purchasingMindset: string;
  primaryFrustrations: string[];
  coreAspirations: string[];
  mediaConsumption: {
    peakHours: string;
    formatPreference: string;
    fatigueFactor: string;
  };
}

export interface ContentHookInsight {
  id: string;
  hook: string;
  angle: string;
  psychologicalTrigger: string;
  predictedRetention: number;
  viralityScore: number;
  explanation: string;
  scriptSnippet: string;
  targetPlatforms: string[];
}

export interface DeepDiveTrendAnalysis {
  id: string;
  timestamp: string;
  niche: string;
  audience: string;
  summary: string;
  demographics: DemographicInsights;
  contentHooks: ContentHookInsight[];
}

export interface TrendingTagPlatformStats {
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  sharePercent: number;
  trendVelocity: string;
}

export interface TrendingTopicItem {
  id: string;
  tag: string;
  cleanTopic: string;
  category: 'Viral Challenge' | 'Pain Point Solution' | 'Product Feature' | 'Aesthetic Setup' | 'Industry News';
  velocityRate: string;
  growthStatus: 'Breakout' | 'Surging' | 'Steady Climb' | 'Peaked';
  estimatedImpressions: string;
  engagementScore: number;
  relevanceScore: number;
  platforms: ('TikTok' | 'Instagram' | 'YouTube')[];
  platformStats: TrendingTagPlatformStats[];
  sentiment: 'Overwhelmingly Positive' | 'High Debate / Controversial' | 'Educational Demand';
  sampleSpokenHook: string;
  audioVisualAngle: string;
  relatedHashtags: string[];
  whyItMatters: string;
}

export interface TrendingTopicsData {
  niche: string;
  audience: string;
  lastUpdated: string;
  summary: string;
  topics: TrendingTopicItem[];
  topSurgingTag: string;
  averageVelocity: string;
  dominantPlatform: string;
}



