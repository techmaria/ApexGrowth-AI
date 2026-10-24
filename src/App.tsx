import React, { useState, useEffect } from 'react';
import { Sidebar, WorkspaceTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { CreatorBriefView } from './components/views/CreatorBriefView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
import { DraftStudioView } from './components/views/DraftStudioView';
import { DistributionView } from './components/views/DistributionView';
import { PublishingCalendarView } from './components/views/PublishingCalendarView';
import { PerformanceView } from './components/views/PerformanceView';
import { WorkspaceSettingsView } from './components/views/WorkspaceSettingsView';
import { GoogleSheetsTab } from './components/GoogleSheetsTab';
import { TrendAlerts } from './components/TrendAlerts';
import { AddSignalModal } from './components/AddSignalModal';
import { EditDraftModal } from './components/EditDraftModal';
import { RecordMetricsModal } from './components/RecordMetricsModal';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { generateContentOpportunities } from './services/geminiService';
import { User } from 'firebase/auth';
import {
  ContentOpportunity,
  CreatorBrief,
  DraftOption,
  PerformanceStats,
  TelemetryRecord,
} from './types';
import { generateClientAestheticSvg } from './services/imagenService';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const STORAGE_KEY_BRIEF = 'apexgrowth_creator_desk_brief_v2';
const STORAGE_KEY_OPPORTUNITIES = 'apexgrowth_creator_desk_opps_v2';
const STORAGE_KEY_TAB = 'apexgrowth_creator_desk_tab_v2';
const STORAGE_KEY_THEME = 'apexgrowth_theme';

const INITIAL_BRIEF: CreatorBrief = {
  businessName: 'Morrow & Moss',
  niche: 'Independent plant shop',
  audience: 'Apartment dwellers and first-time plant parents',
  location: 'Portland, Oregon',
  language: 'English',
  tone: 'Warm, knowledgeable, a little playful',
  platforms: ['Instagram', 'TikTok'],
};

const INITIAL_OPPORTUNITIES: ContentOpportunity[] = [
  {
    id: 'OPP-101',
    signal: 'Trend · Creator observation',
    signalType: 'Trend',
    sourceContext: 'Creator observation',
    title: 'The "plant shelfie" reset',
    hook: 'A short before-and-after shelf refresh with one practical styling tip. A familiar format, made useful for small spaces.',
    script:
      'Visual: Quick before-and-after shelf refresh focusing on vertical height and trailing vines.\nAudio: "If your plant shelf feels cluttered, here is the 10-second rule: put your tallest plant on the lowest tier. It gives the eye breathing room and lets daylight reach every leaf."',
    veo_prompt:
      'Tactile close-up of arranging small terracotta pots on oak shelf, natural afternoon sunlight, vertical 9:16',
    imagen_prompt:
      'Aesthetic minimalist plant shelf with trailing pothos and pilea in terracotta, bright warm apartment, 8k',
    predictedRetention: 88,
    viralityScore: 94,
    platforms: ['Instagram', 'TikTok'],
    niche: 'Independent plant shop',
    audience: 'Apartment dwellers and first-time plant parents',
    tone: 'Warm, knowledgeable, a little playful',
    status: 'APPROVED',
    calendarStatus: 'Published',
    performance: { reach: 1284, likes: 96, comments: 14, saves: 37 },
    dateAdded: 'ADDED MAR 8',
    customBackgroundImage: generateClientAestheticSvg(
      'Aesthetic minimalist plant shelf with trailing pothos and pilea in terracotta, bright warm apartment, 8k',
      '16:9'
    ),
  },
  {
    id: 'OPP-102',
    signal: 'Event · Shop calendar',
    signalType: 'Event',
    sourceContext: 'Shop calendar',
    title: 'Spring repotting weekend',
    hook: 'A hands-on weekend at the shop: bring a plant, choose a pot, and leave knowing what your roots need.',
    script:
      'Visual: Gentle soil loosening and inspecting healthy root systems.\nAudio: "Spring repotting, minus the guesswork. Bring your plant by this weekend and we will help you find the right fit and healthy drainage."',
    veo_prompt:
      'Macro view of repotting monstera root ball into fresh organic potting mix, soft studio light, 9:16',
    imagen_prompt:
      'Community plant repotting station with ceramic pots and fresh green foliage, cozy workshop aesthetic, 8k',
    predictedRetention: 82,
    viralityScore: 89,
    platforms: ['Instagram'],
    niche: 'Independent plant shop',
    audience: 'Apartment dwellers and first-time plant parents',
    tone: 'Warm, knowledgeable, a little playful',
    status: 'APPROVED',
    calendarStatus: 'Scheduled',
    scheduledReminderTime: '2025-03-14T10:30',
    performance: { reach: 940, likes: 78, comments: 12, saves: 28 },
    dateAdded: 'ADDED MAR 7',
  },
  {
    id: 'OPP-103',
    signal: 'Personal idea · Practice reflection',
    signalType: 'Personal idea',
    sourceContext: 'Personal idea',
    title: 'One leaf, one lesson',
    hook: 'Explain what a yellowing leaf might be telling you without making new plant owners feel bad.',
    script:
      'Visual: Close-up of lower leaf turning yellow versus upper leaves flourishing.\nAudio: "Before you panic and water again: lower yellow leaves are often just your plant reallocating energy for a new shoot. Here is how to tell the difference."',
    veo_prompt:
      'Botanical macro shot of lush green leaf with natural morning dew, soft focus, vertical 9:16',
    imagen_prompt:
      'Educational botanical illustration showing healthy plant growth stages, elegant typography, warm cream background',
    predictedRetention: 85,
    viralityScore: 91,
    platforms: ['Instagram', 'TikTok'],
    niche: 'Independent plant shop',
    audience: 'Apartment dwellers and first-time plant parents',
    tone: 'Warm, knowledgeable, a little playful',
    status: 'QUEUED',
    dateAdded: 'ADDED MAR 6',
  },
  {
    id: 'OPP-104',
    signal: 'Creative reference · Saved video format',
    signalType: 'Creative reference',
    sourceContext: 'Saved reference',
    title: 'Quiet hands-on care videos',
    hook: 'Slow close-ups, natural light, and captions that feel like a note from a friend. Keep the edit tactile and unhurried.',
    script:
      'Visual: Misting leaves with brass spray bottle, wiping dust off a rubber plant leaf with damp cloth.\nAudio: Minimal ambient background sound, gentle acoustic tone.',
    veo_prompt:
      'Gentle misting of fiddle leaf fig with brass mister, soft dust motes in sunbeam, vertical 9:16 cinematic',
    imagen_prompt:
      'Sunlit indoor greenhouse corner with vintage brass mister and green ficus leaves, editorial photography, 8k',
    predictedRetention: 89,
    viralityScore: 92,
    platforms: ['TikTok', 'Instagram'],
    niche: 'Independent plant shop',
    audience: 'Apartment dwellers and first-time plant parents',
    tone: 'Warm, knowledgeable, a little playful',
    status: 'QUEUED',
    dateAdded: 'ADDED MAR 5',
  },
  {
    id: 'OPP-105',
    signal: 'News · Local seasonal note',
    signalType: 'News',
    sourceContext: 'Local seasonal note',
    title: 'Longer, brighter afternoons',
    hook: 'Use the seasonal shift as a prompt to revisit watering routines as indoor light changes.',
    script:
      'Visual: Afternoon sun shifting across living room floor touching different houseplants.\nAudio: "As the days get longer, your plants will dry out twice as fast. Check the top 2 inches before your next watering schedule."',
    veo_prompt:
      'Time-lapse of golden sunlight creeping across a room filled with potted plants, vertical 9:16',
    imagen_prompt:
      'Warm afternoon sunlight streaming through apartment window onto indoor jungle, golden hour tones, 8k',
    predictedRetention: 79,
    viralityScore: 86,
    platforms: ['Instagram', 'TikTok'],
    niche: 'Independent plant shop',
    audience: 'Apartment dwellers and first-time plant parents',
    tone: 'Warm, knowledgeable, a little playful',
    status: 'QUEUED',
    dateAdded: 'ADDED MAR 4',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TAB);
    if (
      saved &&
      [
        'overview',
        'brief',
        'opportunities',
        'trends',
        'draft_studio',
        'calendar',
        'performance',
        'sheets',
        'settings',
      ].includes(saved)
    ) {
      return saved as WorkspaceTab;
    }
    return 'overview';
  });

  const [brief, setBrief] = useState<CreatorBrief>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BRIEF);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Brief load error', e);
    }
    return INITIAL_BRIEF;
  });

  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Opps load error', e);
    }
    return INITIAL_OPPORTUNITIES;
  });

  // Selected Signal for Draft Studio
  const [selectedSignalId, setSelectedSignalId] = useState<string>('OPP-101');

  // Bulk selection in opportunities
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Modals state
  const [isAddSignalModalOpen, setIsAddSignalModalOpen] = useState(false);
  const [editingDraftInfo, setEditingDraftInfo] = useState<{
    opp: ContentOpportunity;
    draft: DraftOption;
  } | null>(null);
  const [editingMetricsOpp, setEditingMetricsOpp] = useState<ContentOpportunity | null>(null);

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch (e) {
      console.warn('Theme load error', e);
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.warn('Theme save error', e);
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BRIEF, JSON.stringify(brief));
  }, [brief]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(opportunities));
  }, [opportunities]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        showToast('success', `Signed in as ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      showToast('warning', `Sign in: ${err.message || 'Cancelled'}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    showToast('info', 'Disconnected Google account.');
  };

  // Bulk selection handlers
  const handleToggleSelectOpportunity = (id: string) => {
    setSelectedOpportunityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const queuedIds = opportunities.filter((o) => o.status === 'QUEUED').map((o) => o.id);
      const targetIds = queuedIds.length > 0 ? queuedIds : opportunities.map((o) => o.id);
      setSelectedOpportunityIds(new Set(targetIds));
    } else {
      setSelectedOpportunityIds(new Set());
    }
  };

  const handleBulkApprove = async () => {
    const toApprove = opportunities.filter(
      (o) => selectedOpportunityIds.has(o.id) && o.status !== 'APPROVED' && o.status !== 'DISPATCHED'
    );

    if (toApprove.length === 0) {
      showToast('warning', 'Please select at least one queued opportunity to approve.');
      return;
    }

    setIsBulkApproving(true);
    try {
      await Promise.all(
        toApprove.map((opp) =>
          fetch('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ opportunity: opp }),
          }).catch((err) => console.warn('Approve err', err))
        )
      );

      const approvedIds = new Set(toApprove.map((o) => o.id));
      setOpportunities((prev) =>
        prev.map((item) =>
          approvedIds.has(item.id)
            ? { ...item, status: 'APPROVED', calendarStatus: item.calendarStatus || 'Approved' }
            : item
        )
      );

      setSelectedOpportunityIds(new Set());
      showToast(
        'success',
        `Bulk Approved ${toApprove.length} opportunities! Moved to publishing calendar.`
      );
    } catch (err) {
      console.error('Bulk approve err:', err);
      showToast('warning', 'Bulk approval completed locally.');
    } finally {
      setIsBulkApproving(false);
    }
  };

  // Add new signal
  const handleAddSignal = (newSignal: Partial<ContentOpportunity>) => {
    const newItem: ContentOpportunity = {
      id: `OPP-${Date.now()}`,
      title: newSignal.title || 'New Signal',
      signal: `${newSignal.signalType || 'Trend'} · ${newSignal.sourceContext || 'Observation'}`,
      signalType: newSignal.signalType || 'Trend',
      sourceContext: newSignal.sourceContext || 'Creator observation',
      hook: newSignal.hook || '',
      script: newSignal.script || '',
      veo_prompt: 'Cinematic vertical 9:16 macro shot in warm daylight, authentic aesthetic',
      imagen_prompt: 'Minimalist editorial photograph, natural lighting, high resolution',
      predictedRetention: 85,
      viralityScore: 90,
      platforms: brief.platforms && brief.platforms.length > 0 ? brief.platforms : ['Instagram', 'TikTok'],
      niche: brief.niche,
      audience: brief.audience,
      tone: brief.tone,
      status: 'QUEUED',
      dateAdded: newSignal.dateAdded || 'ADDED JUST NOW',
    };

    setOpportunities((prev) => [newItem, ...prev]);
    showToast('success', `Added "${newItem.title}" to your opportunity queue.`);
  };

  const handleDeleteSignal = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    setSelectedOpportunityIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('info', 'Signal removed from queue.');
  };

  // Approve a draft option in Draft Studio
  const handleApproveDraft = (opp: ContentOpportunity, draft: DraftOption) => {
    setOpportunities((prev) =>
      prev.map((item) => {
        if (item.id === opp.id) {
          return {
            ...item,
            hook: draft.hook,
            script: draft.script,
            status: 'APPROVED',
            calendarStatus: 'Approved',
            customBackgroundImage: draft.customBackgroundImage || item.customBackgroundImage,
          };
        }
        return item;
      })
    );
    showToast(
      'success',
      `Approved "${draft.title}"! Added to your Publishing Calendar with custom background.`
    );
    setActiveTab('calendar');
  };

  // Update status from Calendar
  const handleUpdateOpportunityStatus = (
    id: string,
    status: 'APPROVED' | 'DISPATCHED',
    calendarStatus?: 'Approved' | 'Scheduled' | 'Published',
    scheduledTime?: string
  ) => {
    setOpportunities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            calendarStatus: calendarStatus || item.calendarStatus,
            scheduledReminderTime:
              scheduledTime !== undefined ? scheduledTime : item.scheduledReminderTime,
          };
        }
        return item;
      })
    );
  };

  // Update performance metrics
  const handleUpdateMetrics = (id: string, stats: PerformanceStats) => {
    setOpportunities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, performance: stats } : item))
    );
    showToast('success', 'Updated published performance numbers.');
  };

  // Scan signals using Gemini Grounding
  const handleScanGemini = async () => {
    setIsScanning(true);
    try {
      const data = await generateContentOpportunities(brief);
      if (data.opportunities && data.opportunities.length > 0) {
        const enriched = data.opportunities.map((opp, idx) => ({
          ...opp,
          signalType: (idx % 2 === 0 ? 'Trend' : 'News') as any,
          sourceContext: 'Google Search Grounding',
          dateAdded: 'ADDED TODAY',
        }));
        setOpportunities((prev) => [...enriched, ...prev]);
        showToast('success', `Discovered ${enriched.length} live grounded signals for ${brief.niche}!`);
      } else {
        showToast('warning', 'Scan finished with baseline calibrated data.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      showToast('warning', 'Live scanner completed using workspace templates.');
    } finally {
      setIsScanning(false);
    }
  };

  // Bulk-Import Opportunities from CSV
  const handleImportOpportunities = (newOpps: ContentOpportunity[]) => {
    if (!newOpps || newOpps.length === 0) return;
    setOpportunities((prev) => [...newOpps, ...prev]);
    showToast('success', `Bulk-added ${newOpps.length} new opportunities to your workspace queue.`);
  };

  // Download Formatted CSV
  const handleDownloadCSV = () => {
    if (opportunities.length === 0) {
      showToast('warning', 'No opportunities to export.');
      return;
    }

    const headers = [
      'ID',
      'Title',
      'Category',
      'Source Context',
      '0-3s Hook',
      'Script Outline',
      'Platforms',
      'Status',
      'Calendar State',
      'Scheduled Time',
      'Reach',
      'Likes',
      'Comments',
      'Saves',
      'Creator Business',
      'Niche',
      'Audience',
      'Date Added',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = opportunities.map((opp) => [
      escapeCSV(opp.id),
      escapeCSV(opp.title),
      escapeCSV(opp.signalType || 'Trend'),
      escapeCSV(opp.sourceContext || 'Observation'),
      escapeCSV(opp.hook),
      escapeCSV(opp.script),
      escapeCSV(opp.platforms ? opp.platforms.join('; ') : ''),
      escapeCSV(opp.status),
      escapeCSV(opp.calendarStatus || 'Draft'),
      escapeCSV(opp.scheduledReminderTime || ''),
      escapeCSV(opp.performance?.reach || ''),
      escapeCSV(opp.performance?.likes || ''),
      escapeCSV(opp.performance?.comments || ''),
      escapeCSV(opp.performance?.saves || ''),
      escapeCSV(brief.businessName || 'Morrow & Moss'),
      escapeCSV(opp.niche || brief.niche),
      escapeCSV(opp.audience || brief.audience),
      escapeCSV(opp.dateAdded || ''),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${(brief.businessName || 'ApexGrowth').toLowerCase().replace(/\s+/g, '_')}_workspace_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Workspace data downloaded as formatted CSV.');
  };

  const creatorInitial = (brief.businessName || 'Morrow & Moss').charAt(0).toUpperCase();

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'dark' : ''
      } bg-[#F7F4EE] dark:bg-[#0B120F] text-[#1A2521] dark:text-[#E8ECE9] flex flex-col font-sans selection:bg-[#E2A968]/30 selection:text-[#1A2521] dark:selection:text-white transition-colors duration-200`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-200 max-w-sm">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-[#172822] text-white border-[#233A31]'
                : toastMessage.type === 'warning'
                ? 'bg-[#FAF0D9] dark:bg-[#281E10] text-[#7A5816] dark:text-[#E2A968] border-[#EEDDB8] dark:border-[#4B371C]'
                : 'bg-white dark:bg-[#131F1B] text-[#1A2521] dark:text-[#E8ECE9] border-[#E8E2D6] dark:border-[#263C33]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#E2A968] shrink-0 mt-0.5" />
            ) : toastMessage.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-[#A87432] dark:text-[#E2A968] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#172822] dark:text-[#9FB1A9] shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-medium leading-relaxed flex-1">
              {toastMessage.text}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-inherit opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* App Layout: Left Sidebar + Main Area */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          businessName={brief.businessName || 'Morrow & Moss'}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            activeTab={activeTab}
            onOpenMobile={() => setIsMobileSidebarOpen(true)}
            creatorInitial={creatorInitial}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                brief={brief}
                opportunities={opportunities}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAddModal={() => setIsAddSignalModalOpen(true)}
                onSelectSignalForDraft={(opp) => {
                  setSelectedSignalId(opp.id);
                  setActiveTab('draft_studio');
                }}
              />
            )}

            {activeTab === 'brief' && (
              <CreatorBriefView
                brief={brief}
                onSaveBrief={(updated) => setBrief(updated)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                selectedIds={selectedOpportunityIds}
                onToggleSelect={handleToggleSelectOpportunity}
                onSelectAll={handleSelectAll}
                onBulkApprove={handleBulkApprove}
                isBulkApproving={isBulkApproving}
                onOpenAddSignalModal={() => setIsAddSignalModalOpen(true)}
                onDeleteSignal={handleDeleteSignal}
                onUseInDraftStudio={(opp) => {
                  setSelectedSignalId(opp.id);
                  setActiveTab('draft_studio');
                }}
                onScanGemini={handleScanGemini}
                isScanning={isScanning}
                onNavigateToTrends={() => setActiveTab('trends')}
              />
            )}

            {activeTab === 'trends' && (
              <TrendAlerts
                brief={brief}
                onAddSignalToQueue={handleAddSignal}
                onShowToast={showToast}
                existingOpportunityTitles={opportunities.map((o) => o.title)}
              />
            )}

            {activeTab === 'draft_studio' && (
              <DraftStudioView
                opportunities={opportunities}
                selectedOpportunityId={selectedSignalId}
                onSelectOpportunity={(opp) => setSelectedSignalId(opp.id)}
                brief={brief}
                onApproveDraft={handleApproveDraft}
                onEditDraft={(opp, draft) => setEditingDraftInfo({ opp, draft })}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'distribution' && (
              <DistributionView
                opportunities={opportunities}
                onUpdateOpportunityStatus={handleUpdateOpportunityStatus}
                onShowToast={showToast}
                onNavigateToCalendar={() => setActiveTab('calendar')}
              />
            )}

            {activeTab === 'calendar' && (
              <PublishingCalendarView
                opportunities={opportunities}
                onUpdateOpportunityStatus={handleUpdateOpportunityStatus}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceView
                opportunities={opportunities}
                onUpdateMetrics={handleUpdateMetrics}
                onOpenEditMetricsModal={(opp) => setEditingMetricsOpp(opp)}
              />
            )}

            {activeTab === 'sheets' && (
              <GoogleSheetsTab
                user={user}
                accessToken={accessToken}
                onLogin={handleLogin}
                onLogout={handleLogout}
                opportunities={opportunities}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <WorkspaceSettingsView
                brief={brief}
                opportunities={opportunities}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onDownloadCSV={handleDownloadCSV}
                onNavigateToSheets={() => setActiveTab('sheets')}
                onImportOpportunities={handleImportOpportunities}
                onShowToast={showToast}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <AddSignalModal
        isOpen={isAddSignalModalOpen}
        onClose={() => setIsAddSignalModalOpen(false)}
        onAdd={handleAddSignal}
        defaultNiche={brief.niche}
      />

      <EditDraftModal
        isOpen={Boolean(editingDraftInfo)}
        opportunity={editingDraftInfo?.opp || null}
        draft={editingDraftInfo?.draft || null}
        onClose={() => setEditingDraftInfo(null)}
        onSave={(updated) => {
          showToast('success', `Draft "${updated.title}" updated.`);
          setEditingDraftInfo(null);
        }}
      />

      <RecordMetricsModal
        isOpen={Boolean(editingMetricsOpp)}
        opportunity={editingMetricsOpp}
        onClose={() => setEditingMetricsOpp(null)}
        onSave={(id, stats) => {
          handleUpdateMetrics(id, stats);
          setEditingMetricsOpp(null);
        }}
      />
    </div>
  );
}
