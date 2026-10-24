import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  FileSpreadsheet,
  Zap,
  Upload,
  FileUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  HelpCircle,
  FileDown,
  Sun,
  Moon,
  Shield,
  Clock,
  Lock,
  RefreshCw,
  Activity,
  Check,
} from 'lucide-react';
import { CreatorBrief, ContentOpportunity } from '../../types';
import { User } from 'firebase/auth';
import {
  parseCSVToOpportunities,
  generateSampleCSVTemplate,
  CSVParseResult,
} from '../../services/csvService';
import {
  getCostControlStatus,
  resetCountersForTesting,
} from '../../services/costControlService';

interface WorkspaceSettingsViewProps {
  brief: CreatorBrief;
  opportunities: ContentOpportunity[];
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onDownloadCSV: () => void;
  onNavigateToSheets?: () => void;
  onImportOpportunities?: (newOpps: ContentOpportunity[]) => void;
  onShowToast?: (type: 'success' | 'warning' | 'info', text: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const WorkspaceSettingsView: React.FC<WorkspaceSettingsViewProps> = ({
  brief,
  opportunities,
  user,
  onLogin,
  onLogout,
  onDownloadCSV,
  onNavigateToSheets,
  onImportOpportunities,
  onShowToast,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [forceQueuedStatus, setForceQueuedStatus] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [costStatus, setCostStatus] = useState(() => getCostControlStatus());

  const handleResetCounters = () => {
    resetCountersForTesting();
    setCostStatus(getCostControlStatus());
    onShowToast?.('info', 'Local prototype daily counters reset for testing.');
  };

  // Trigger download of pre-formatted CSV template
  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCSVTemplate(brief);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'content_opportunities_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast?.('success', 'Sample CSV template downloaded with correct column headers.');
  };

  // Process uploaded CSV file
  const processCSVFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      onShowToast?.('warning', 'Please select a valid .csv file.');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        onShowToast?.('warning', 'Selected file is empty.');
        return;
      }

      const existingIds = new Set(opportunities.map((o) => o.id));
      const result = parseCSVToOpportunities(text, brief, existingIds);

      if (result.errors.length > 0) {
        onShowToast?.('warning', result.errors[0]);
        return;
      }

      if (result.opportunities.length === 0) {
        onShowToast?.('warning', 'No valid opportunity rows found in CSV.');
        return;
      }

      setParseResult(result);
      setIsImportModalOpen(true);
    };

    reader.onerror = () => {
      onShowToast?.('warning', 'Failed to read the uploaded CSV file.');
    };

    reader.readAsText(file, 'UTF-8');
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
    // Reset input so same file can be re-selected if edited
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  // Confirm import into active opportunities list
  const handleConfirmImport = () => {
    if (!parseResult || parseResult.opportunities.length === 0) return;

    const finalOpportunities = parseResult.opportunities.map((opp) => ({
      ...opp,
      status: forceQueuedStatus ? ('QUEUED' as const) : opp.status,
    }));

    if (onImportOpportunities) {
      onImportOpportunities(finalOpportunities);
    }

    setIsImportModalOpen(false);
    setParseResult(null);
    setUploadedFileName('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* Header */}
      <div className="space-y-2 pt-2">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
          SETTINGS
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] leading-tight tracking-tight">
          Desk settings.
        </h1>
        <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed max-w-lg">
          Workspace state, appearance theme, writing engines, bulk CSV import, and data export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Usage & Billing Control Center Card */}
          <div className="bg-white dark:bg-[#121D19] rounded-2xl border border-[#E8E2D6] dark:border-[#22352E] p-6 space-y-6 shadow-2xs transition-colors">
            {/* Header & Mode Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-[#F0EBE0] dark:border-[#20322B]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    USAGE & BILLING CONTROL CENTER
                  </div>
                </div>
                <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9]">
                  Cost Control & Zero-Billing Engine
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                  <Lock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  MODE: ZERO_BILLING (LOCKED)
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed">
              ApexGrowth is strictly configured in <strong>ZERO_BILLING</strong> mode. All paid cloud resources, external billable API tiers, and automated credit card prepayments are blocked by application-level safety circuit breakers.
            </p>

            {/* Daily Usage Meters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A2521] dark:text-[#E8ECE9] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#A87432] dark:text-[#E2A968]" />
                  Conservative Prototype Daily Limits
                </span>
                <span className="text-[11px] font-mono text-[#7A8C84] dark:text-[#8E9F97] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Resets in {costStatus.timeUntilResetUtc} (00:00 UTC)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gemini Text Generations */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                      Gemini Text Generations
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#2C5E48] dark:text-[#7BC3A2]">
                      {costStatus.dailyCounters.geminiTextGenerations} / {costStatus.dailyCounters.geminiTextGenerationsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8E2D6] dark:bg-[#20352C] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (costStatus.dailyCounters.geminiTextGenerations /
                            costStatus.dailyCounters.geminiTextGenerationsLimit) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A8C84] dark:text-[#8E9F97]">
                    Free tier eligible (Google AI Studio Key). Max 10 calls/day.
                  </p>
                </div>

                {/* Opportunity Discovery */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                      Opportunity Discovery Scans
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#2C5E48] dark:text-[#7BC3A2]">
                      {costStatus.dailyCounters.opportunityDiscoveries} / {costStatus.dailyCounters.opportunityDiscoveriesLimit}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8E2D6] dark:bg-[#20352C] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (costStatus.dailyCounters.opportunityDiscoveries /
                            costStatus.dailyCounters.opportunityDiscoveriesLimit) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A8C84] dark:text-[#8E9F97]">
                    Multi-signal search grounding. Max 5 refreshes/day.
                  </p>
                </div>

                {/* Video Intelligence Analyses */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                      Video Intelligence Analyses
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#2C5E48] dark:text-[#7BC3A2]">
                      {costStatus.dailyCounters.videoIntelAnalyses} / {costStatus.dailyCounters.videoIntelAnalysesLimit}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8E2D6] dark:bg-[#20352C] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (costStatus.dailyCounters.videoIntelAnalyses /
                            costStatus.dailyCounters.videoIntelAnalysesLimit) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A8C84] dark:text-[#8E9F97]">
                    Multimodal 60s hook & scene breakdowns. Max 5/day.
                  </p>
                </div>

                {/* Video Render Attempts */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                      Video Render Attempts
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#2C5E48] dark:text-[#7BC3A2]">
                      {costStatus.dailyCounters.videoRenderAttempts} / {costStatus.dailyCounters.videoRenderAttemptsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8E2D6] dark:bg-[#20352C] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (costStatus.dailyCounters.videoRenderAttempts /
                            costStatus.dailyCounters.videoRenderAttemptsLimit) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A8C84] dark:text-[#8E9F97]">
                    Browser Canvas engine. Max 2 client exports/day.
                  </p>
                </div>
              </div>
            </div>

            {/* Active System Safeguards Table */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] space-y-2.5">
              <span className="text-xs font-semibold text-[#1A2521] dark:text-[#E8ECE9] block">
                Active System Safeguards & Concurrency Limits
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Paid APIs: Blocked</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Auto Purchases: Disabled</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Service Upgrades: Disabled</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Background AI Jobs: Disabled</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Max Concurrent Jobs: 1</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Social Publishing: Manual</span>
                </div>
              </div>
            </div>

            {/* Modular API Provider System Status */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#1A2521] dark:text-[#E8ECE9] block">
                Modular API Provider System Status
              </span>
              <div className="space-y-1.5">
                {costStatus.providers.map((prov) => {
                  const isBlocked = prov.status === 'DISABLED' || prov.costClassification === 'BLOCKED_PAID';
                  return (
                    <div
                      key={prov.id}
                      className="p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 bg-white dark:bg-[#1B2B25] border-[#E8E2D6] dark:border-[#2D453B]"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                            {prov.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#7A8C84] dark:text-[#8E9F97]">
                            ({prov.category})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5E6E67] dark:text-[#9FB1A9] truncate">
                          {prov.notes}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            isBlocked
                              ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {prov.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spend Cap Transparency Disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-[11px] space-y-1 text-amber-900 dark:text-amber-200">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Spending Protection Disclaimer
              </div>
              <p className="leading-relaxed opacity-90">
                These application-defined counters enforce strict safety limits to prevent accidental external billing. External cloud providers without hard spend caps will not be triggered while in ZERO_BILLING mode.
              </p>
            </div>

            {/* Reset Testing Action */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97]">
                UTC Day: {costStatus.utcResetDate}
              </span>
              <button
                type="button"
                onClick={handleResetCounters}
                className="px-3 py-1 rounded-md border border-[#E0D9CD] dark:border-[#2B4037] text-[11px] font-medium text-[#5E6E67] dark:text-[#BAC7C1] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Daily Counters (Testing)</span>
              </button>
            </div>
          </div>

          {/* CSV Import & Export Hub Card */}
          <div className="bg-white dark:bg-[#121D19] rounded-2xl border border-[#E8E2D6] dark:border-[#22352E] p-6 space-y-5 shadow-2xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] dark:text-[#7A8E85] font-semibold">
                  BULK DATA OPS
                </div>
                <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
                  Import & export opportunities
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#5E6E67] dark:text-[#BAC7C1] bg-[#FAF8F5] dark:bg-[#172520] border border-[#E2DDD3] dark:border-[#263C33] px-2.5 py-1 rounded-md">
                {opportunities.length} Active in Queue
              </span>
            </div>

            <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed">
              Seamlessly bulk-add content ideas from spreadsheets, research databases, or client campaign briefs using standardized CSV.
            </p>

            {/* Drag & Drop Import Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#172822] dark:border-[#E2A968] bg-[#EAEFEA]/40 dark:bg-[#1E2E27] scale-[0.99]'
                  : 'border-[#E0D9CD] dark:border-[#2B4037] bg-[#FAF8F5] dark:bg-[#16231E]/60 hover:bg-[#F5F0E6] dark:hover:bg-[#192822] hover:border-[#C8BFB0] dark:hover:border-[#385549]'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1B2B25] border border-[#E8E2D6] dark:border-[#2D453B] flex items-center justify-center text-[#172822] dark:text-[#E2A968] shadow-2xs">
                  <FileUp className="w-5 h-5 text-[#A87432] dark:text-[#E2A968]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9]">
                    Click to select a CSV file or drag & drop here
                  </div>
                  <div className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97] mt-0.5">
                    Supports Title, 0-3s Hook, Category, Platforms, Script Outline, Status, and Metrics
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#172822] dark:text-[#E8ECE9] bg-white dark:bg-[#16231E] border border-[#E2DDD3] dark:border-[#2A3E36] px-3 py-1 rounded-md shadow-2xs">
                  <Upload className="w-3 h-3 text-[#A87432] dark:text-[#E2A968]" />
                  <span>Choose .csv file</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Template Download */}
            <div className="pt-2 border-t border-[#F0EBE0] dark:border-[#20322B] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg border border-[#E2DDD3] dark:border-[#2B4037] bg-white dark:bg-[#172520] hover:bg-[#FAF8F5] dark:hover:bg-[#1E3029] text-[#1A2521] dark:text-[#E8ECE9] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#A87432] dark:text-[#E2A968]" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDownloadCSV}
                  className="px-3.5 py-1.5 rounded-lg bg-[#172822] hover:bg-[#0E1A16] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All as CSV</span>
                </button>
              </div>
            </div>

            {/* Supported Columns Guide Pill-strip */}
            <div className="bg-[#FAF8F5] dark:bg-[#15221D] rounded-xl p-3 border border-[#E8E2D6] dark:border-[#22352E] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#7A8C84] dark:text-[#8E9F97] font-semibold flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#A87432] dark:text-[#E2A968]" />
                Standard CSV Header Format
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[#55655E] dark:text-[#9FB1A9]">
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Title (Required)</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">0-3s Hook</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Category (Trend, News, Event, etc.)</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Platforms (e.g. Instagram; TikTok)</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Script Outline</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Status</span>
                <span className="bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded border border-[#E2DDD3] dark:border-[#283D33]">Reach / Saves</span>
              </div>
            </div>
          </div>

          {/* Engines Card */}
          <div className="bg-white dark:bg-[#121D19] rounded-2xl border border-[#E8E2D6] dark:border-[#22352E] p-6 space-y-4 shadow-2xs transition-colors">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] dark:text-[#7A8E85] font-semibold">
                ENGINES
              </div>
              <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
                Draft providers
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] dark:bg-[#1E3029] text-[#2C5E48] dark:text-[#7BC3A2] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9]">Local templates</div>
                    <div className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97]">Browser generator</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#2C5E48] dark:text-[#7BC3A2]">Active</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0D9] dark:bg-[#2A2012] text-[#7A5816] dark:text-[#E2A968] flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9]">Gemini Flash</div>
                    <div className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97]">Server-side proxy</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#2C5E48] dark:text-[#7BC3A2]">Active</span>
              </div>
            </div>
          </div>

          {/* Cloud Sync Card */}
          <div className="bg-white dark:bg-[#121D19] rounded-2xl border border-[#E8E2D6] dark:border-[#22352E] p-6 space-y-3 shadow-2xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#889790] dark:text-[#7A8E85] font-semibold">
                  INTEGRATIONS
                </div>
                <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
                  Google Sheets
                </h3>
              </div>
              <FileSpreadsheet className="w-4 h-4 text-[#7A8C84] dark:text-[#8E9F97]" />
            </div>

            <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed">
              Sync opportunities to Google Sheets or view in-browser table.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              {onNavigateToSheets && (
                <button
                  type="button"
                  onClick={onNavigateToSheets}
                  className="px-3 py-1.5 rounded-lg bg-[#172822] hover:bg-[#0E1A16] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-medium transition-colors cursor-pointer"
                >
                  Open Sheets tab
                </button>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg border border-[#E0D9CD] dark:border-[#2B4037] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] text-xs font-medium text-[#7A8C84] dark:text-[#9FB1A9] transition-colors cursor-pointer"
                >
                  Disconnect Google
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="px-3 py-1.5 rounded-lg border border-[#E0D9CD] dark:border-[#2B4037] hover:bg-[#FAF8F5] dark:hover:bg-[#172520] text-xs font-medium text-[#1A2521] dark:text-[#E8ECE9] transition-colors cursor-pointer"
                >
                  Connect Google (Optional)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Theme Toggle & Storage Note */}
        <div className="lg:col-span-4 space-y-4">
          {/* Appearance & Theme Toggle Card */}
          <div className="bg-white dark:bg-[#121D19] border border-[#E8E2D6] dark:border-[#22352E] rounded-2xl p-6 space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
                  APPEARANCE
                </div>
                <h3 className="text-lg font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-0.5">
                  Workspace theme
                </h3>
              </div>
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#E2A968]" />
              ) : (
                <Sun className="w-4 h-4 text-[#A87432]" />
              )}
            </div>

            <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed">
              Switch between the light botanical cream palette and the high-contrast dark obsidian forest theme.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (theme === 'dark' && onToggleTheme) onToggleTheme();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  theme === 'light'
                    ? 'border-[#172822] bg-[#F7F4EE] shadow-xs ring-1 ring-[#172822]'
                    : 'border-[#263C33] bg-[#0E1714] hover:border-[#385549] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-[#172822]' : 'text-[#82978D]'}`} />
                  {theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-[#2C5E48]" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-medium ${theme === 'light' ? 'text-[#1A2521]' : 'text-[#BAC7C1]'}`}>
                    Botanical Cream
                  </div>
                  <div className="text-[10px] font-mono text-[#7A8C84]">Light mode</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme === 'light' && onToggleTheme) onToggleTheme();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  theme === 'dark'
                    ? 'border-[#E2A968] bg-[#16231E] shadow-xs ring-1 ring-[#E2A968]'
                    : 'border-[#E0D9CD] bg-[#FAF8F5] hover:border-[#C8BFB0] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-[#E2A968]' : 'text-[#82978D]'}`} />
                  {theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-[#E2A968]" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-[#1A2521]'}`}>
                    Obsidian Forest
                  </div>
                  <div className="text-[10px] font-mono text-[#DFA058]">Dark mode</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#EAEFEA]/70 dark:bg-[#162520]/70 border border-[#D5E1D9] dark:border-[#243A30] rounded-2xl p-6 space-y-3 transition-colors">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#698579] dark:text-[#8AA396] font-semibold">
              PRIVACY & STORAGE
            </div>
            <h3 className="text-lg font-serif font-normal text-[#172822] dark:text-[#E8ECE9]">
              Local storage.
            </h3>
            <p className="text-xs text-[#576B62] dark:text-[#9FB1A9] leading-relaxed">
              All workspace opportunities, imported CSV rows, and custom visual prompts reside directly in your browser's local storage.
            </p>
          </div>

          {/* Import Tips Card */}
          <div className="bg-white dark:bg-[#121D19] border border-[#E8E2D6] dark:border-[#22352E] rounded-2xl p-6 space-y-3 shadow-2xs transition-colors">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
              CSV TIP
            </div>
            <h4 className="text-sm font-serif text-[#1A2521] dark:text-[#E8ECE9]">
              Bulk curation workflow
            </h4>
            <p className="text-xs text-[#5E6E67] dark:text-[#9FB1A9] leading-relaxed">
              Upload spreadsheets with your team's weekly ideas. Every imported entry automatically receives estimated retention scores and visual prompts for instant drafting.
            </p>
          </div>
        </div>
      </div>

      {/* CSV IMPORT PREVIEW & CONFIRMATION MODAL */}
      {isImportModalOpen && parseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121D19] border border-[#E6DFD3] dark:border-[#263C33] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#F0EBE0] dark:border-[#20322B] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A87432] dark:text-[#E2A968] font-semibold">
                    CSV IMPORT REVIEW
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF8F5] dark:bg-[#172520] border border-[#E2DDD3] dark:border-[#263C33] px-2 py-0.5 rounded text-[#55655E] dark:text-[#BAC7C1]">
                    {uploadedFileName}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-normal text-[#1A2521] dark:text-[#E8ECE9] mt-1">
                  Ready to add {parseResult.opportunities.length} opportunities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-[#889790] hover:text-[#1A2521] dark:hover:text-white rounded-lg hover:bg-[#FAF8F5] dark:hover:bg-[#192722] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Table */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Warnings alert if any rows were skipped */}
              {parseResult.warnings.length > 0 && (
                <div className="bg-[#FEF7EE] dark:bg-[#251B10] border border-[#F4E1C6] dark:border-[#4B371C] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#A87432] dark:text-[#E2A968] font-semibold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Notice regarding uploaded rows:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-[#7A5816] dark:text-[#E2A968] space-y-0.5">
                    {parseResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Mode Option */}
              <div className="bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#243A30] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-[#1A2521] dark:text-[#E8ECE9]">Target initial status</div>
                  <div className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97] mt-0.5">
                    Choose whether all items should start in QUEUED or preserve their CSV status
                  </div>
                </div>
                <div className="inline-flex items-center bg-white dark:bg-[#111A16] border border-[#E2DDD3] dark:border-[#283E34] rounded-lg p-0.5 text-[11px] font-mono self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setForceQueuedStatus(true)}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      forceQueuedStatus
                        ? 'bg-[#172822] dark:bg-[#E2A968] text-white dark:text-[#14231E] font-medium shadow-2xs'
                        : 'text-[#5E6E67] dark:text-[#9FB1A9] hover:text-[#1A2521] dark:hover:text-white'
                    }`}
                  >
                    Add to Queue (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForceQueuedStatus(false)}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      !forceQueuedStatus
                        ? 'bg-[#172822] dark:bg-[#E2A968] text-white dark:text-[#14231E] font-medium shadow-2xs'
                        : 'text-[#5E6E67] dark:text-[#9FB1A9] hover:text-[#1A2521] dark:hover:text-white'
                    }`}
                  >
                    Preserve CSV Status
                  </button>
                </div>
              </div>

              {/* Opportunities Table Preview */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#7A8C84] dark:text-[#8E9F97] font-semibold">
                  Detected Items Preview ({parseResult.opportunities.length})
                </div>

                <div className="border border-[#E8E2D6] dark:border-[#243A30] rounded-xl overflow-hidden bg-white dark:bg-[#121D19] shadow-2xs">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] dark:bg-[#172520] border-b border-[#E8E2D6] dark:border-[#243A30] text-[10px] font-mono uppercase text-[#889790] dark:text-[#7A8E85] sticky top-0">
                        <tr>
                          <th className="py-2 px-3 font-semibold">ID</th>
                          <th className="py-2 px-4 font-semibold">TITLE & HOOK</th>
                          <th className="py-2 px-3 font-semibold">CATEGORY</th>
                          <th className="py-2 px-3 font-semibold">PLATFORMS</th>
                          <th className="py-2 px-3 font-semibold">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE2] dark:divide-[#20322B] text-[#1A2521] dark:text-[#E8ECE9]">
                        {parseResult.opportunities.map((opp, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF8F5] dark:hover:bg-[#182621] transition-colors">
                            <td className="py-2.5 px-3 font-mono text-[10px] text-[#7A8C84] dark:text-[#8E9F97]">
                              {opp.id}
                            </td>
                            <td className="py-2.5 px-4 max-w-xs">
                              <div className="font-medium text-[#1A2521] dark:text-[#E8ECE9] truncate">
                                {opp.title}
                              </div>
                              <div className="text-[11px] text-[#7A8C84] dark:text-[#8E9F97] truncate mt-0.5">
                                {opp.hook}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#172520] border border-[#E8E2D6] dark:border-[#263C33] text-[#55655E] dark:text-[#BAC7C1]">
                                {opp.signalType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5E6E67] dark:text-[#9FB1A9]">
                              {opp.platforms.join(', ')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded-full border ${
                                  (forceQueuedStatus ? 'QUEUED' : opp.status) === 'APPROVED'
                                    ? 'bg-[#EAF4EF] dark:bg-[#1B3327] text-[#2C5E48] dark:text-[#7BC3A2] border-[#CFE4D7] dark:border-[#274B39]'
                                    : 'bg-[#FAF8F5] dark:bg-[#172520] text-[#55655E] dark:text-[#BAC7C1] border-[#E8E2D6] dark:border-[#263C33]'
                                }`}
                              >
                                {forceQueuedStatus ? 'QUEUED' : opp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#F0EBE0] dark:border-[#20322B] bg-[#FAF8F5] dark:bg-[#14201B] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E2DDD3] dark:border-[#2B4037] text-xs font-medium text-[#5E6E67] dark:text-[#BAC7C1] hover:bg-white dark:hover:bg-[#1B2B25] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-lg bg-[#172822] hover:bg-[#0E1A16] dark:bg-[#E2A968] dark:hover:bg-[#DFA058] text-white dark:text-[#14231E] text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E2A968] dark:text-[#14231E]" />
                <span>
                  Confirm & Bulk-Add {parseResult.opportunities.length} to Queue
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
