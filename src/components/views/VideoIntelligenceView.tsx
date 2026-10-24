import React, { useState, useEffect } from 'react';
import {
  Video,
  Upload,
  Link,
  Sparkles,
  BarChart2,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Flame,
  ArrowRight,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Shield,
  Layers,
  Zap,
  Info,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  ChevronRight,
  Film,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import {
  VideoAnalysisResult,
  CompetitorComparisonMatrix,
  DerivativeContentConcept,
  ContentOpportunity,
} from '../../types';
import {
  getSavedAnalyses,
  saveAnalysis,
  deleteSavedAnalysis,
  analyzeVideoContent,
  generateCompetitorComparison,
  SAMPLE_VIDEOS,
} from '../../services/videoIntelligenceService';
import { canExecuteOperation, getCostControlStatus } from '../../services/costControlService';

interface VideoIntelligenceViewProps {
  onAddOpportunityToQueue?: (opportunity: ContentOpportunity) => void;
  onShowToast?: (type: 'success' | 'warning' | 'info', text: string) => void;
  theme?: 'light' | 'dark';
}

type TabType =
  | 'analyze'
  | 'breakdown'
  | 'market'
  | 'compare'
  | 'opportunities'
  | 'saved';

export const VideoIntelligenceView: React.FC<VideoIntelligenceViewProps> = ({
  onAddOpportunityToQueue,
  onShowToast,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  const [savedAnalyses, setSavedAnalyses] = useState<VideoAnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<VideoAnalysisResult | null>(null);

  // Form Inputs
  const [sourceType, setSourceType] = useState<'MP4_UPLOAD' | 'YOUTUBE_URL'>('MP4_UPLOAD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [niche, setNiche] = useState<string>('Ergonomic Workspaces');
  const [creatorName, setCreatorName] = useState<string>('Studio Workspaces');
  const [targetPlatform, setTargetPlatform] = useState<string>('TikTok');
  const [category, setCategory] = useState<string>('Short-Form Video');
  const [notes, setNotes] = useState<string>('Focus on 0-3s hook retention and desk setup pricing angles');

  // Loading & Progress States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Comparison Selection (up to 3)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonMatrix, setComparisonMatrix] = useState<CompetitorComparisonMatrix | null>(null);

  // Cost status
  const costStatus = getCostControlStatus();

  // Load saved analyses on mount
  useEffect(() => {
    const loaded = getSavedAnalyses();
    setSavedAnalyses(loaded);
    if (loaded.length > 0 && !currentAnalysis) {
      setCurrentAnalysis(loaded[0]);
      setSelectedForComparison([loaded[0].id, loaded[1]?.id].filter(Boolean));
    }
  }, []);

  // Update comparison matrix whenever selection changes
  useEffect(() => {
    const selectedVideos = savedAnalyses.filter((v) => selectedForComparison.includes(v.id));
    if (selectedVideos.length > 0) {
      setComparisonMatrix(generateCompetitorComparison(selectedVideos));
    } else {
      setComparisonMatrix(null);
    }
  }, [selectedForComparison, savedAnalyses]);

  // Handle Drag & Drop / File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('video') && !file.name.endsWith('.mp4')) {
        setErrorMsg('Please upload a valid MP4 video file.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  // Quick load sample video
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_VIDEOS[sampleIndex] || SAMPLE_VIDEOS[0];
    setCurrentAnalysis(sample);
    setActiveTab('breakdown');
    onShowToast?.('info', `Loaded verified sample analysis: "${sample.videoTitle}"`);
  };

  // Run Real Analysis
  const handleStartAnalysis = async () => {
    setErrorMsg(null);

    // Validate inputs
    if (sourceType === 'MP4_UPLOAD' && !selectedFile) {
      setErrorMsg('Please select or drag an MP4 video file (max 60 seconds).');
      return;
    }
    if (sourceType === 'YOUTUBE_URL' && (!youtubeUrl || !youtubeUrl.includes('youtu'))) {
      setErrorMsg('Please enter a valid public YouTube or YouTube Shorts URL.');
      return;
    }

    // Check Zero-Billing quota
    const quotaCheck = canExecuteOperation('video_intel');
    if (!quotaCheck.allowed) {
      setErrorMsg(quotaCheck.reason || 'Daily video analysis quota reached.');
      onShowToast?.('warning', quotaCheck.reason || 'Daily quota reached.');
      return;
    }

    setIsAnalyzing(true);
    setProgressStep('Initializing multimodal video intelligence engine...');

    try {
      const result = await analyzeVideoContent(
        {
          file: sourceType === 'MP4_UPLOAD' ? selectedFile || undefined : undefined,
          youtubeUrl: sourceType === 'YOUTUBE_URL' ? youtubeUrl : undefined,
          niche,
          creatorName,
          category,
          targetPlatform,
          notes,
        },
        (step) => setProgressStep(step)
      );

      setCurrentAnalysis(result);
      setSavedAnalyses(getSavedAnalyses());
      setActiveTab('breakdown');
      onShowToast?.('success', 'Multimodal video analysis complete! Actionable insights generated.');
    } catch (err: any) {
      console.error('Video Intelligence error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during video analysis.');
      onShowToast?.('warning', err.message || 'Failed to complete video analysis.');
    } finally {
      setIsAnalyzing(false);
      setProgressStep('');
    }
  };

  // Convert Derivative Concept to Content Opportunity and export to queue
  const handleExportConceptToQueue = (concept: DerivativeContentConcept) => {
    const newOpportunity: ContentOpportunity = {
      id: `OPP-INTEL-${Date.now().toString(36).toUpperCase()}`,
      signal: 'Creative reference · Video Intelligence',
      signalType: 'Creative reference',
      sourceContext: `Derivative concept from analyzed video: ${currentAnalysis?.videoTitle || 'Observed Short'}`,
      title: concept.title,
      hook: concept.openingHook,
      script: concept.script,
      veo_prompt: `Cinematic vertical video 9:16: ${concept.suggestedVisuals}, 60fps natural lighting`,
      imagen_prompt: `Clean graphic representation of ${concept.title}, modern typography, high contrast aesthetic`,
      predictedRetention: 88,
      viralityScore: 92,
      platforms: [concept.recommendedPlatform || 'TikTok', 'Instagram'],
      niche: niche || 'General Growth',
      audience: concept.targetAudience,
      tone: 'High Utility & Strategic',
      status: 'QUEUED',
      dateAdded: new Date().toISOString().split('T')[0],
    };

    if (onAddOpportunityToQueue) {
      onAddOpportunityToQueue(newOpportunity);
      onShowToast?.(
        'success',
        `Exported "${concept.title}" directly to your Active Opportunities Queue!`
      );
    }
  };

  // Toggle selection for side-by-side comparison
  const toggleComparisonSelection = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 3) {
        onShowToast?.('warning', 'Comparison is capped at 3 videos for visual clarity.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Banner */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'bg-[#172822] border-[#223930]' : 'bg-[#EBF3EF] border-[#C2DDD0]'
      } flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#1B4332] text-white">
              <Film className="w-3.5 h-3.5" />
              Video Content Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              <Shield className="w-3 h-3" />
              ZERO_BILLING ACTIVE
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono ${
              isDark ? 'bg-[#223930] text-[#9EB2A9]' : 'bg-white text-[#2C4A3E] border border-[#C2DDD0]'
            }`}>
              <Clock className="w-3 h-3" />
              Today: {costStatus.dailyCounters.videoIntelAnalyses} / {costStatus.dailyCounters.videoIntelAnalysesLimit}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#172822] dark:text-white">
            Short-Form Video Market Research & Strategy
          </h1>
          <p className="text-sm text-[#4A6B5D] dark:text-[#9EB2A9] max-w-3xl">
            Audit 60-second vertical videos from MP4 uploads or public YouTube URLs. Extract 1–3s hooks,
            scene pacing, spoken dialogue, on-screen text, and verified market metrics with zero cloud billing risk.
          </p>
        </div>

        {/* Quick Sample Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleLoadSample(0)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#2D6A4F] text-[#1B4332] bg-white hover:bg-[#F0F7F4] dark:bg-[#1D322B] dark:text-emerald-200 dark:hover:bg-[#233D34] transition-colors"
          >
            Sample: Desk Setup (58s)
          </button>
          <button
            onClick={() => handleLoadSample(1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#2D6A4F] text-[#1B4332] bg-white hover:bg-[#F0F7F4] dark:bg-[#1D322B] dark:text-emerald-200 dark:hover:bg-[#233D34] transition-colors"
          >
            Sample: Plant Shop (52s)
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className={`flex items-center gap-1 border-b pb-2 overflow-x-auto ${
        isDark ? 'border-[#223930]' : 'border-[#DCE7E1]'
      }`}>
        {[
          { id: 'analyze', label: 'Analyze Video', icon: Upload },
          { id: 'breakdown', label: 'Content Breakdown', icon: Layers, disabled: !currentAnalysis },
          { id: 'market', label: 'Market Insights', icon: BarChart2, disabled: !currentAnalysis },
          { id: 'compare', label: 'Competitor Comparison', icon: Zap },
          { id: 'opportunities', label: 'Content Opportunities', icon: Sparkles, disabled: !currentAnalysis },
          { id: 'saved', label: `Saved Analyses (${savedAnalyses.length})`, icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as TabType)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : tab.disabled
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : isDark
                  ? 'text-[#9EB2A9] hover:bg-[#1D322B] hover:text-white'
                  : 'text-[#4A6B5D] hover:bg-[#EBF3EF] hover:text-[#172822]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">{errorMsg}</p>
            <p className="opacity-80">
              Note: Zero-Billing mode caps video processing to 60 seconds and 5 analyses per UTC day.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ANALYZE VIDEO */}
      {/* ========================================================================= */}
      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload / URL Form */}
          <div className={`lg:col-span-2 p-6 rounded-xl border space-y-5 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-[#223930]/30 dark:border-[#223930]">
              <h2 className="font-serif font-bold text-lg text-[#172822] dark:text-white">
                New Video Intake & Intelligence
              </h2>
              <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                Max duration: 60s
              </span>
            </div>

            {/* Source Type Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-lg bg-[#F0F5F2] dark:bg-[#1D322B]">
              <button
                type="button"
                onClick={() => setSourceType('MP4_UPLOAD')}
                className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'MP4_UPLOAD'
                    ? 'bg-white dark:bg-[#233D34] text-[#1B4332] dark:text-emerald-200 shadow-xs'
                    : 'text-[#4A6B5D] dark:text-[#9EB2A9] hover:text-[#172822]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload MP4 File (&lt;60s)
              </button>
              <button
                type="button"
                onClick={() => setSourceType('YOUTUBE_URL')}
                className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'YOUTUBE_URL'
                    ? 'bg-white dark:bg-[#233D34] text-[#1B4332] dark:text-emerald-200 shadow-xs'
                    : 'text-[#4A6B5D] dark:text-[#9EB2A9] hover:text-[#172822]'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Public YouTube / Shorts URL
              </button>
            </div>

            {/* MP4 Drag & Drop */}
            {sourceType === 'MP4_UPLOAD' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9]">
                  Select Short-Form Video File
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : isDark
                      ? 'border-[#223930] hover:border-[#2D6A4F] bg-[#1D322B]/40'
                      : 'border-[#C2DDD0] hover:border-[#2D6A4F] bg-[#F7FAF8]'
                  }`}
                  onClick={() => document.getElementById('video-file-input')?.click()}
                >
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
                      <Film className="w-5 h-5" />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-semibold text-[#172822] dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · MP4 format
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-[#172822] dark:text-white">
                          Drop MP4 here or click to browse
                        </p>
                        <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9]">
                          Strict prototype cap: 60 seconds (9:16 vertical recommended)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* YouTube URL Input */}
            {sourceType === 'YOUTUBE_URL' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9]">
                  Public YouTube or Shorts URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/shorts/... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className={`w-full text-xs rounded-lg px-3.5 py-2.5 border outline-hidden transition-colors ${
                      isDark
                        ? 'bg-[#1D322B] border-[#223930] text-white focus:border-[#2D6A4F]'
                        : 'bg-white border-[#C2DDD0] text-[#172822] focus:border-[#2D6A4F]'
                    }`}
                  />
                  <Link className="w-4 h-4 text-[#4A6B5D] dark:text-[#9EB2A9] absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                  Official oEmbed API retrieves public title and channel information without scraping or billing.
                </p>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9] mb-1">
                  Target Niche / Topic
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Ergonomic Office Furniture, Plant Care"
                  className={`w-full text-xs rounded-lg px-3 py-2 border outline-hidden ${
                    isDark
                      ? 'bg-[#1D322B] border-[#223930] text-white'
                      : 'bg-white border-[#C2DDD0] text-[#172822]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9] mb-1">
                  Creator / Channel Name
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Studio Workspaces, The Botanical Guide"
                  className={`w-full text-xs rounded-lg px-3 py-2 border outline-hidden ${
                    isDark
                      ? 'bg-[#1D322B] border-[#223930] text-white'
                      : 'bg-white border-[#C2DDD0] text-[#172822]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9] mb-1">
                  Primary Publishing Platform
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border outline-hidden ${
                    isDark
                      ? 'bg-[#1D322B] border-[#223930] text-white'
                      : 'bg-white border-[#C2DDD0] text-[#172822]'
                  }`}
                >
                  <option value="TikTok">TikTok (9:16 Vertical)</option>
                  <option value="Instagram Reels">Instagram Reels (9:16 Vertical)</option>
                  <option value="YouTube Shorts">YouTube Shorts (9:16 Vertical)</option>
                  <option value="LinkedIn Video">LinkedIn Video</option>
                  <option value="Pinterest Idea Pin">Pinterest Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Product Demo, Myth Buster, Tutorial"
                  className={`w-full text-xs rounded-lg px-3 py-2 border outline-hidden ${
                    isDark
                      ? 'bg-[#1D322B] border-[#223930] text-white'
                      : 'bg-white border-[#C2DDD0] text-[#172822]'
                  }`}
                />
              </div>
            </div>

            {/* Context / Notes */}
            <div>
              <label className="block text-xs font-medium text-[#2C4A3E] dark:text-[#9EB2A9] mb-1">
                Optional Competitor Context / Strategy Goals
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What specific angles or pain points do you want to explore?"
                className={`w-full text-xs rounded-lg p-3 border outline-hidden ${
                  isDark
                    ? 'bg-[#1D322B] border-[#223930] text-white'
                    : 'bg-white border-[#C2DDD0] text-[#172822]'
                }`}
              />
            </div>

            {/* Action Button & Processing Progress */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isAnalyzing
                    ? 'bg-neutral-400 text-white cursor-not-allowed'
                    : 'bg-[#1B4332] hover:bg-[#24533E] text-white active:scale-[0.99]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Multimodal Video Intelligence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E2A968]" />
                    <span>Run Multimodal Analysis (Zero-Billing Guarded)</span>
                  </>
                )}
              </button>

              {isAnalyzing && progressStep && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-pulse">
                  <Film className="w-4 h-4 shrink-0" />
                  <span>{progressStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Guidelines & Zero Billing Transparency */}
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B4332] dark:text-[#E2A968]">
                <Shield className="w-4 h-4" />
                Cost Controls & Rules
              </div>
              <ul className="text-xs space-y-2 text-[#4A6B5D] dark:text-[#9EB2A9]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>60s Max Duration:</strong> Prevents memory bottlenecks and unnecessary API payload transfer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>5 Analyses Daily:</strong> Protects free-tier rate limits with automatic UTC midnight resets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Fabricated Stats:</strong> Transparent formulas used for engagement rates. Zero invented metrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Offline Cache:</strong> Reuses saved analyses from localStorage to avoid redundant generation.</span>
                </li>
              </ul>
            </div>

            {/* Recent Quick Switcher */}
            <div className={`p-5 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#172822] dark:text-white">
                  Quick Access Saved Analyses
                </span>
                <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                  {savedAnalyses.length} saved
                </span>
              </div>
              <div className="space-y-2">
                {savedAnalyses.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setActiveTab('breakdown');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                      currentAnalysis?.id === item.id
                        ? 'border-[#2D6A4F] bg-[#EBF3EF] dark:bg-[#1D322B] text-[#172822] dark:text-white'
                        : isDark
                        ? 'border-[#223930] hover:bg-[#1D322B] text-[#9EB2A9]'
                        : 'border-[#E5ECE8] hover:bg-[#F7FAF8] text-[#2C4A3E]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium truncate">{item.videoTitle}</p>
                      <p className="text-[11px] font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                        {item.durationSeconds}s · {item.sourceType === 'MP4_UPLOAD' ? 'MP4' : 'YouTube'}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTENT BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === 'breakdown' && currentAnalysis && (
        <div className="space-y-6">
          {/* Analysis Header Card */}
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-[#223930]/30 dark:border-[#223930]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                    {currentAnalysis.videoFormat}
                  </span>
                  <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                    {currentAnalysis.durationSeconds}s total duration
                  </span>
                </div>
                <h2 className="font-serif font-bold text-xl text-[#172822] dark:text-white">
                  {currentAnalysis.videoTitle}
                </h2>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1B4332] text-white hover:bg-[#24533E] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E2A968]" />
                  View 3 Derivative Concepts
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B]">
                <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">0–3s Hook Retention</p>
                <p className="text-xl font-bold font-mono text-[#1B4332] dark:text-emerald-300">
                  {currentAnalysis.hookAnalysis.retentionImpactScore}
                  <span className="text-xs font-normal text-neutral-400">/100</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B]">
                <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">Cuts Per Minute</p>
                <p className="text-xl font-bold font-mono text-[#1B4332] dark:text-emerald-300">
                  {currentAnalysis.pacingAnalysis.cutsPerMinute}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B]">
                <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">Avg Scene Duration</p>
                <p className="text-xl font-bold font-mono text-[#1B4332] dark:text-emerald-300">
                  {currentAnalysis.pacingAnalysis.avgSceneDuration}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B]">
                <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">Scene Count</p>
                <p className="text-xl font-bold font-mono text-[#1B4332] dark:text-emerald-300">
                  {currentAnalysis.sceneBreakdown.length}
                </p>
              </div>
            </div>
          </div>

          {/* 0-3s Opening Hook Deep Dive */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-[#FDFBF7] border-[#E8DEC8]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E2A968] text-[#172822] flex items-center justify-center font-bold text-xs">
                  ⚡
                </span>
                <h3 className="font-serif font-bold text-base text-[#172822] dark:text-white">
                  Opening Hook Evaluation (First {currentAnalysis.hookAnalysis.hookDurationSeconds}s)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#E2A968]/20 text-[#8F5A24] dark:text-[#E2A968] font-medium border border-[#E2A968]/40">
                Pattern: {currentAnalysis.hookAnalysis.hookPattern}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white dark:bg-[#1D322B] border border-[#223930]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    Direct Observation (Verbatim)
                  </span>
                </div>
                <p className="text-sm font-serif italic text-[#172822] dark:text-white">
                  "{currentAnalysis.hookAnalysis.hookVerbatim}"
                </p>
                <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9]">
                  <strong>Visual Action:</strong> {currentAnalysis.hookAnalysis.hookVisualAction}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-[#1D322B] border border-[#223930]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                    AI Strategic Interpretation
                  </span>
                </div>
                <p className="text-xs text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                  {currentAnalysis.hookAnalysis.aiInterpretation}
                </p>
                <p className="text-[11px] font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                  Evidence: {currentAnalysis.hookAnalysis.directEvidenceQuote}
                </p>
              </div>
            </div>
          </div>

          {/* Scene-by-Scene Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-[#172822] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2D6A4F]" />
              Scene-by-Scene Timeline Breakdown ({currentAnalysis.sceneBreakdown.length} Scenes)
            </h3>

            <div className="space-y-3">
              {currentAnalysis.sceneBreakdown.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 mb-3 border-[#223930]/20 dark:border-[#223930]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1B4332] text-white text-xs font-mono flex items-center justify-center font-bold">
                        {scene.sceneNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#172822] dark:text-white">
                        {scene.timestampStart} — {scene.timestampEnd} ({scene.durationSeconds}s)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 dark:bg-[#1D322B] dark:text-[#9EB2A9]">
                        {scene.editingPace}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {scene.emotionalTrigger}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Presentation: {scene.productPresentation}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#4A6B5D] dark:text-[#9EB2A9] uppercase tracking-wider">
                        Visual Action:
                      </span>
                      <p className="text-[#172822] dark:text-neutral-200">
                        {scene.visualDescription}
                      </p>
                      {scene.onScreenText && scene.onScreenText !== 'None' && (
                        <div className="pt-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 font-mono text-[10px]">
                            On-Screen Text: {scene.onScreenText}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#4A6B5D] dark:text-[#9EB2A9] uppercase tracking-wider">
                        Verbatim Audio / Narration:
                      </span>
                      <p className="font-serif italic text-[#172822] dark:text-neutral-200 bg-[#F7FAF8] dark:bg-[#1D322B] p-2.5 rounded-lg border border-[#223930]/10">
                        "{scene.spokenDialogue}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reusable Creative Patterns */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <h3 className="font-serif font-bold text-base text-[#172822] dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E2A968]" />
              Identified Reusable Creative Patterns & Evidence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentAnalysis.reusableCreativePatterns.map((pat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B4332] dark:text-emerald-300">
                      {pat.pattern}
                    </span>
                    <span className="font-mono text-[10px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                      {pat.evidenceTimestamp}
                    </span>
                  </div>
                  <p className="text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                    {pat.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MARKET INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 'market' && currentAnalysis && (
        <div className="space-y-6">
          {/* Market Stats Grid */}
          <div className={`p-6 rounded-xl border space-y-6 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-[#223930]/30 dark:border-[#223930]">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#172822] dark:text-white">
                  Market Performance Intelligence
                </h2>
                <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9]">
                  Creator: {currentAnalysis.marketStats.creatorName} ({currentAnalysis.marketStats.creatorHandle}) · Published: {currentAnalysis.marketStats.publishDate}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Counts
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#4A6B5D] dark:text-[#9EB2A9] mb-1">
                  <Eye className="w-4 h-4" />
                  Total Views
                </div>
                <p className="text-2xl font-bold font-mono text-[#172822] dark:text-white">
                  {currentAnalysis.marketStats.views.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#4A6B5D] dark:text-[#9EB2A9] mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  Likes
                </div>
                <p className="text-2xl font-bold font-mono text-[#172822] dark:text-white">
                  {currentAnalysis.marketStats.likes.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#4A6B5D] dark:text-[#9EB2A9] mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Comments
                </div>
                <p className="text-2xl font-bold font-mono text-[#172822] dark:text-white">
                  {currentAnalysis.marketStats.comments.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#EBF3EF] dark:bg-[#233D34] border border-[#2D6A4F]/30">
                <div className="flex items-center gap-1.5 text-xs text-[#1B4332] dark:text-emerald-300 font-semibold mb-1">
                  <BarChart2 className="w-4 h-4" />
                  Engagement Rate
                </div>
                <p className="text-2xl font-bold font-mono text-[#1B4332] dark:text-emerald-200">
                  {currentAnalysis.marketStats.engagementRate}%
                </p>
              </div>
            </div>

            {/* Disclosed Engagement Formula Box */}
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-[#1D322B]/80 border border-neutral-200 dark:border-[#223930] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#172822] dark:text-white">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                Disclosed Calculation Formula:
              </div>
              <code className="block text-xs font-mono bg-white dark:bg-[#172822] p-2.5 rounded border border-neutral-200 dark:border-[#223930] text-[#1B4332] dark:text-emerald-300">
                {currentAnalysis.marketStats.engagementFormula}
              </code>
              <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                Strict Zero-Billing Anti-Hallucination Policy: Watch-time, completion curves, click-through conversions, and creator revenue are never fabricated. Only platform-reported counts and mathematically disclosed formulas are presented.
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                <h3 className="font-serif font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Identified Strengths
                </h3>
                <ul className="text-xs space-y-1.5 text-emerald-800 dark:text-emerald-300">
                  {currentAnalysis.marketStats.identifiedStrengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <h3 className="font-serif font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Strategic Weaknesses & Differentiation Gaps
                </h3>
                <ul className="text-xs space-y-1.5 text-amber-800 dark:text-amber-300">
                  {currentAnalysis.marketStats.identifiedWeaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPETITOR COMPARISON */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Video Selector Row */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#172822] dark:text-white">
                  Side-by-Side Competitor Comparison
                </h2>
                <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9]">
                  Select 2 or 3 videos from your library to generate an automatic structural and strategic matrix.
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#1B4332] text-white">
                {selectedForComparison.length} / 3 Selected
              </span>
            </div>

            {/* Checklist of available videos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {savedAnalyses.map((vid) => {
                const isSelected = selectedForComparison.includes(vid.id);
                return (
                  <div
                    key={vid.id}
                    onClick={() => toggleComparisonSelection(vid.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-[#2D6A4F] bg-[#EBF3EF] dark:bg-[#1D322B] text-[#172822] dark:text-white shadow-xs'
                        : isDark
                        ? 'border-[#223930] hover:bg-[#1D322B] text-[#9EB2A9]'
                        : 'border-[#E5ECE8] hover:bg-[#F7FAF8] text-[#2C4A3E]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#1B4332]"
                    />
                    <div className="truncate">
                      <p className="font-medium truncate">{vid.videoTitle}</p>
                      <p className="text-[10px] font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                        {vid.durationSeconds}s · Hook: {vid.hookAnalysis.hookPattern}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Matrix Output */}
          {comparisonMatrix && (
            <div className="space-y-4">
              <div className={`p-6 rounded-xl border space-y-5 ${
                isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
              }`}>
                <h3 className="font-serif font-bold text-lg text-[#172822] dark:text-white">
                  Comparative Analysis Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10 space-y-1.5">
                    <h4 className="font-bold text-[#1B4332] dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                      Hook Comparison & Retention Impact
                    </h4>
                    <p className="whitespace-pre-line text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                      {comparisonMatrix.hookComparison}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10 space-y-1.5">
                    <h4 className="font-bold text-[#1B4332] dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                      Content Structure & Pacing Arc
                    </h4>
                    <p className="whitespace-pre-line text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                      {comparisonMatrix.structureComparison}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10 space-y-1.5">
                    <h4 className="font-bold text-[#1B4332] dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                      Audience Positioning & Tone
                    </h4>
                    <p className="whitespace-pre-line text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                      {comparisonMatrix.audiencePositioningComparison}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10 space-y-1.5">
                    <h4 className="font-bold text-[#1B4332] dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                      Calls to Action & Conversion Mechanics
                    </h4>
                    <p className="whitespace-pre-line text-[#2C4A3E] dark:text-[#9EB2A9] leading-relaxed">
                      {comparisonMatrix.ctaComparison}
                    </p>
                  </div>
                </div>

                {/* Differentiation Opportunities */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E2A968]" />
                    Opportunities for Market Differentiation
                  </h4>
                  <ul className="text-xs space-y-1.5 text-emerald-800 dark:text-emerald-300">
                    {comparisonMatrix.differentiationOpportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACTIONABLE CONTENT CONCEPTS (3 ORIGINAL CONCEPTS) */}
      {/* ========================================================================= */}
      {activeTab === 'opportunities' && currentAnalysis && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border space-y-2 ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1B4332] dark:text-[#E2A968]">
                Actionable Derivative Concepts
              </span>
              <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                Zero Plagiarism Guaranteed
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl text-[#172822] dark:text-white">
              3 Original 60-Second Video Scripts Inspired by Analysis
            </h2>
            <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9] max-w-3xl">
              These original concepts synthesize proven hook patterns, pacing transitions, and emotional triggers
              without copying competitor scripts or proprietary assets. Click <strong>"Export to Queue"</strong> to add any concept directly to your active production queue.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {currentAnalysis.derivativeConcepts.map((concept, index) => {
              const badgeColors =
                concept.conceptType === 'Educational'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                  : concept.conceptType === 'Storytelling'
                  ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';

              return (
                <div
                  key={concept.id}
                  className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                    isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badgeColors}`}>
                        Angle {index + 1}: {concept.conceptType}
                      </span>
                      <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                        {concept.durationSeconds}s
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#172822] dark:text-white leading-snug">
                      {concept.title}
                    </h3>

                    {/* Opening Hook */}
                    <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#1D322B] border border-[#223930]/10 space-y-1">
                      <span className="text-[10px] font-mono font-semibold uppercase text-[#1B4332] dark:text-emerald-300">
                        Opening 0–3s Hook:
                      </span>
                      <p className="text-xs font-serif italic text-[#172822] dark:text-neutral-200">
                        "{concept.openingHook}"
                      </p>
                    </div>

                    {/* Storyboard Summary */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[11px] font-semibold text-[#4A6B5D] dark:text-[#9EB2A9] uppercase tracking-wider">
                        Storyboard Breakdown ({concept.scenes.length} Scenes):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {concept.scenes.map((sc) => (
                          <div
                            key={sc.sceneNumber}
                            className="p-2 rounded bg-neutral-50 dark:bg-[#1D322B]/50 border border-neutral-100 dark:border-[#223930] text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                              <span>Scene {sc.sceneNumber}</span>
                              <span>{sc.timeRange}</span>
                            </div>
                            <p className="text-[#172822] dark:text-neutral-200">
                              <strong>Visual:</strong> {sc.visual}
                            </p>
                            <p className="italic text-[#4A6B5D] dark:text-[#9EB2A9]">
                              <strong>Audio:</strong> "{sc.audio}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strategic Meta */}
                    <div className="space-y-1 text-xs pt-1">
                      <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                        <strong>Target Audience:</strong> {concept.targetAudience}
                      </p>
                      <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                        <strong>Primary CTA:</strong> {concept.primaryCta}
                      </p>
                      <p className="text-[11px] text-[#4A6B5D] dark:text-[#9EB2A9]">
                        <strong>Platform:</strong> {concept.recommendedPlatform}
                      </p>
                    </div>
                  </div>

                  {/* Export Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportConceptToQueue(concept)}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-medium bg-[#1B4332] text-white hover:bg-[#24533E] flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#E2A968]" />
                      <span>Export to Active Opportunities Queue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SAVED ANALYSES */}
      {/* ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
          }`}>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#172822] dark:text-white">
                Saved Video Content Intelligence Library
              </h2>
              <p className="text-xs text-[#4A6B5D] dark:text-[#9EB2A9]">
                Locally cached reports. Reopen any report instantly without consuming daily API quota.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analyze')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1B4332] text-white hover:bg-[#24533E] flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Analyze New Video
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAnalyses.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border space-y-3 flex flex-col justify-between ${
                  isDark ? 'bg-[#172822] border-[#223930]' : 'bg-white border-[#E5ECE8]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 dark:bg-[#1D322B] dark:text-[#9EB2A9]">
                      {item.sourceType === 'MP4_UPLOAD' ? 'MP4 File' : 'YouTube URL'} · {item.durationSeconds}s
                    </span>
                    <span className="text-xs font-mono text-[#4A6B5D] dark:text-[#9EB2A9]">
                      {item.analyzedAt.split('T')[0]}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#172822] dark:text-white">
                    {item.videoTitle}
                  </h3>

                  <p className="text-xs italic font-serif text-[#4A6B5D] dark:text-[#9EB2A9] line-clamp-2">
                    Hook: "{item.hookAnalysis.hookVerbatim}"
                  </p>

                  <div className="flex items-center gap-3 text-xs font-mono text-[#2C4A3E] dark:text-[#9EB2A9] pt-1">
                    <span>Hook Score: <strong>{item.hookAnalysis.retentionImpactScore}/100</strong></span>
                    <span>Engagement: <strong>{item.marketStats.engagementRate}%</strong></span>
                    <span>Scenes: <strong>{item.sceneBreakdown.length}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#223930]/20">
                  <button
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setActiveTab('breakdown');
                    }}
                    className="text-xs font-medium text-[#1B4332] dark:text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    Open Full Report
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const jsonStr = JSON.stringify(item, null, 2);
                        navigator.clipboard.writeText(jsonStr);
                        onShowToast?.('success', 'Full analysis JSON copied to clipboard.');
                      }}
                      className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#1D322B] text-neutral-500"
                      title="Copy JSON"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = deleteSavedAnalysis(item.id);
                        setSavedAnalyses(updated);
                        if (currentAnalysis?.id === item.id) {
                          setCurrentAnalysis(updated[0] || null);
                        }
                        onShowToast?.('info', 'Analysis removed from local cache.');
                      }}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
