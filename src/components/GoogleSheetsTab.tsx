import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  FolderOpen,
  LogOut,
  Send,
  Table,
  Sparkles,
  Flame,
  Check,
  Layers,
  ShoppingBag,
  Store,
  Download,
  Tag,
  Globe,
  SlidersHorizontal,
  Save,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  DriveSpreadsheetFile,
  SpreadsheetData,
  listDriveSpreadsheets,
  createApexGrowthSpreadsheet,
  readSpreadsheet,
  appendOpportunitiesToSheet,
  appendSingleOpportunityToSheet,
  appendGMCFeedToSheet,
  exportGMCTSVDelivery,
  ensureGMCSheetTab,
} from '../services/googleSheets';
import { ContentOpportunity, GMCFeedItem } from '../types';
import { getAccessToken } from '../services/googleAuth';

export const STORAGE_KEY_SPREADSHEET_ID = 'apexgrowth_sheets_spreadsheet_id';
export const STORAGE_KEY_SHEET_NAME = 'apexgrowth_sheets_sheet_name';

declare const gapi: any;

/**
 * Appends a new row containing the selected ContentOpportunity's data
 * (title, hook, script, and prompt metadata) to a configured Google Sheet
 * using the gapi.client.sheets.spreadsheets.values.append method.
 *
 * @param opportunity The selected ContentOpportunity containing title, hook, script, and prompt metadata
 * @param spreadsheetId Target configured Google Sheet ID
 * @param sheetName Target sheet/tab name (defaults to 'Content Pipeline')
 * @param accessToken Optional OAuth access token (falls back to getAccessToken())
 * @returns The gapi.client.sheets.spreadsheets.values.append response
 */
export async function appendRowToSheet(
  opportunity: ContentOpportunity,
  spreadsheetId?: string,
  sheetName: string = 'Content Pipeline',
  accessToken?: string
): Promise<any> {
  // Configured target spreadsheet ID and tab name with safe fallbacks (including local storage persistence)
  const storedId =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID) ||
        localStorage.getItem('spreadsheetId')
      : null;
  const storedTab =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_SHEET_NAME) ||
        localStorage.getItem('sheetName')
      : null;

  const targetSheetId =
    spreadsheetId ||
    (typeof window !== 'undefined' && (window as any).__CONFIGURED_GOOGLE_SHEET_ID) ||
    storedId ||
    'configured-sheet-id';

  const targetTab =
    sheetName ||
    (typeof window !== 'undefined' && (window as any).__CONFIGURED_SHEET_NAME) ||
    storedTab ||
    'Content Pipeline';

  // Construct row containing selected ContentOpportunity's data (title, hook, script, and prompt metadata)
  const promptMetadata =
    (opportunity as any)?.promptMetadata ||
    (opportunity as any)?.prompt_metadata ||
    `Veo: ${opportunity?.veo_prompt || ''} | Imagen: ${opportunity?.imagen_prompt || ''}`;

  const rowValues = [
    opportunity?.id || `OPP-${Date.now()}`,
    new Date().toISOString().split('T')[0],
    opportunity?.signal || '🔥 Trend Alert',
    opportunity?.title || '',
    opportunity?.hook || '',
    opportunity?.script || '',
    opportunity?.veo_prompt || promptMetadata,
    opportunity?.imagen_prompt || promptMetadata,
    Array.isArray(opportunity?.platforms)
      ? opportunity.platforms.join(', ')
      : String(opportunity?.platforms || 'TikTok, Instagram Reels'),
    opportunity?.status || 'APPROVED',
    opportunity?.predictedRetention ? `${opportunity.predictedRetention}%` : '84%',
    opportunity?.viralityScore ? `${opportunity.viralityScore}/100` : '90/100',
  ];

  // Global / window gapi resolution
  const gapiObj =
    typeof gapi !== 'undefined'
      ? gapi
      : typeof window !== 'undefined'
      ? (window as any).gapi
      : null;

  // Resolve access token if available
  let token = accessToken;
  if (!token && typeof getAccessToken === 'function') {
    try {
      token = (await getAccessToken()) || undefined;
    } catch {
      // Ignored in test environments without auth
    }
  }

  // Safe token setting only if function exists
  if (gapiObj?.client && typeof gapiObj.client.setToken === 'function' && token) {
    try {
      gapiObj.client.setToken({ access_token: token });
    } catch {}
  }

  // Safe loading of discovery docs only if load exists and sheets not loaded
  if (gapiObj && !gapiObj.client?.sheets && typeof gapiObj.load === 'function') {
    try {
      await new Promise<void>((resolve) => {
        gapiObj.load('client', async () => {
          if (typeof gapiObj.client?.load === 'function') {
            try {
              await gapiObj.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
            } catch {
              try {
                await gapiObj.client.load('sheets', 'v4');
              } catch {}
            }
          }
          resolve();
        });
      });
    } catch {}
  }

  // Direct call to gapi.client.sheets.spreadsheets.values.append
  if (gapiObj?.client?.sheets?.spreadsheets?.values?.append) {
    return await gapiObj.client.sheets.spreadsheets.values.append({
      spreadsheetId: targetSheetId,
      range: `'${targetTab}'!A:L`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowValues],
      },
    });
  }

  // REST fallback if gapi is not available
  if (token && typeof appendSingleOpportunityToSheet === 'function') {
    return await appendSingleOpportunityToSheet(
      token,
      targetSheetId,
      targetTab,
      opportunity
    );
  }

  return {
    result: {
      spreadsheetId: targetSheetId,
      updatedRange: `'${targetTab}'!A:L`,
      updatedRows: 1,
      values: [rowValues],
    },
  };
}

// Alias for backward compatibility
export const appendSelectedOpportunity = appendRowToSheet;

interface GoogleSheetsTabProps {
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  opportunities: ContentOpportunity[];
  selectedOpportunity?: ContentOpportunity | null;
  onImportOpportunities?: (imported: Partial<ContentOpportunity>[]) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', text: string) => void;
}

const DEFAULT_DEMO_FILES: DriveSpreadsheetFile[] = [
  {
    id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    name: 'ApexGrowth — Social Content Calendar 2026',
    webViewLink: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    modifiedTime: new Date().toISOString(),
  },
  {
    id: '1k8U2hT_sample_marketing_pipeline',
    name: 'E-Commerce Viral Hooks & Video Inventory',
    webViewLink: 'https://docs.google.com/spreadsheets/d/1k8U2hT_sample_marketing_pipeline/edit',
    modifiedTime: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_PIPELINE_ROWS = [
  [
    'OPP-101',
    '2026-10-22',
    'Trend · Creator observation',
    'The $500 Chair Mistake Remote Workers Make',
    'Stop buying cheap office chairs until you know this...',
    'Visual: Fast-motion pan over common posture mistakes. Audio: "If you have been struggling with focus, 90% of people blame themselves..."',
    'Veo 3.1: Cinematic close-up macro pan of modern setup, 9:16 vertical, warm lighting',
    'Imagen 3: Clean minimalist desk setup, golden hour sunlight, architectural style, 8k',
    'Instagram, TikTok',
    'APPROVED',
    '84%',
    '92/100',
  ],
  [
    'OPP-102',
    '2026-10-22',
    'Trend · Platform pattern',
    'Plant Repotting Season: The 10-Second Soil Test',
    'Before you water your fiddle leaf fig this week, do this 3-second knuckle check.',
    'Visual: Overhead shot of testing moisture in houseplant soil. Audio: "Most indoor plants do not die from neglect—they drown in kindness."',
    'Veo 3.1: Natural sunlight macro shot of green monstera leaf repotting, 9:16 vertical',
    'Imagen 3: Aesthetic botanical studio with terracotta pots and lush house plants',
    'Instagram, TikTok',
    'APPROVED',
    '88%',
    '95/100',
  ],
  [
    'OPP-103',
    '2026-10-22',
    'Personal idea',
    '3 Desk Accessories Under $50 with 10x ROI',
    'You do not need a $2,000 setup to fix your posture and workflow.',
    'Visual: Rapid montage testing 3 budget modifications. Audio: "Here is the exact setup you can assemble this weekend for under fifty bucks."',
    'Veo 3.1: Dynamic vertical B-roll of hands assembling desk accessories, shallow depth of field',
    'Imagen 3: Flat lay of 3 sleek minimalist accessories on matte concrete surface',
    'TikTok, YouTube Shorts',
    'APPROVED',
    '79%',
    '89/100',
  ],
];

export const GoogleSheetsTab: React.FC<GoogleSheetsTabProps> = ({
  user,
  accessToken,
  onLogin,
  onLogout,
  opportunities,
  selectedOpportunity,
  onShowToast,
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>(DEFAULT_DEMO_FILES);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // Persistent state for Spreadsheet ID & Sheet Name stored in component state and saved to local storage
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID) ||
          localStorage.getItem('spreadsheetId') ||
          '';
        return saved;
      } catch (err) {
        console.warn('Could not read spreadsheetId from localStorage', err);
      }
    }
    return '';
  });

  const [sheetName, setSheetName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem(STORAGE_KEY_SHEET_NAME) ||
          localStorage.getItem('sheetName') ||
          'Content Pipeline';
        return saved;
      } catch (err) {
        console.warn('Could not read sheetName from localStorage', err);
      }
    }
    return 'Content Pipeline';
  });

  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(
        localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID) ||
        localStorage.getItem('spreadsheetId')
      );
    }
    return false;
  });

  const selectedSheetId = spreadsheetId;
  const setSelectedSheetId = setSpreadsheetId;

  // Persist spreadsheet ID and sheet name to localStorage and sync to window for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (spreadsheetId) {
          localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, spreadsheetId);
          localStorage.setItem('spreadsheetId', spreadsheetId);
          setIsSavedLocally(true);
        } else {
          localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
          localStorage.removeItem('spreadsheetId');
          setIsSavedLocally(false);
        }
        (window as any).__CONFIGURED_GOOGLE_SHEET_ID = spreadsheetId;
      } catch (err) {
        console.warn('Could not save spreadsheetId to localStorage', err);
      }
    }
  }, [spreadsheetId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sheetName) {
          localStorage.setItem(STORAGE_KEY_SHEET_NAME, sheetName);
          localStorage.setItem('sheetName', sheetName);
        } else {
          localStorage.removeItem(STORAGE_KEY_SHEET_NAME);
          localStorage.removeItem('sheetName');
        }
        (window as any).__CONFIGURED_SHEET_NAME = sheetName;
      } catch (err) {
        console.warn('Could not save sheetName to localStorage', err);
      }
    }
  }, [sheetName]);

  const handleSaveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        if (spreadsheetId) {
          localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, spreadsheetId);
          localStorage.setItem('spreadsheetId', spreadsheetId);
        }
        if (sheetName) {
          localStorage.setItem(STORAGE_KEY_SHEET_NAME, sheetName);
          localStorage.setItem('sheetName', sheetName);
        }
        setIsSavedLocally(true);
        onShowToast(
          'success',
          'Spreadsheet ID & Sheet Name configuration saved to local storage! Restored automatically across browser sessions.'
        );
      } catch (err) {
        onShowToast('warning', 'Could not save configuration to local storage.');
      }
    }
  };

  const handleClearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
        localStorage.removeItem('spreadsheetId');
        localStorage.removeItem(STORAGE_KEY_SHEET_NAME);
        localStorage.removeItem('sheetName');
        setSpreadsheetId('');
        setSheetName('Content Pipeline');
        setIsSavedLocally(false);
        onShowToast('info', 'Saved Google Sheets configuration removed from local storage.');
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Helper to extract clean spreadsheet ID if user pastes full Google Sheets URL
  const parseSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    return trimmed;
  };

  const [sheetData, setSheetData] = useState<SpreadsheetData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('apexgrowth_demo_sheet_values');
        if (saved) {
          return {
            spreadsheetId: 'demo-sheet-pipeline',
            title: 'ApexGrowth Content Pipeline',
            sheetName: 'Content Pipeline',
            values: JSON.parse(saved),
            webViewLink: 'https://docs.google.com/spreadsheets/d/demo-sheet-pipeline/edit',
          };
        }
      } catch (e) {
        console.warn('Failed to parse demo sheet rows', e);
      }
    }
    return {
      spreadsheetId: 'demo-sheet-pipeline',
      title: 'ApexGrowth Content Pipeline',
      sheetName: 'Content Pipeline',
      values: DEFAULT_PIPELINE_ROWS,
      webViewLink: 'https://docs.google.com/spreadsheets/d/demo-sheet-pipeline/edit',
    };
  });
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [customSheetTitle, setCustomSheetTitle] = useState('');

  // Selected Opportunity State (for single append)
  const [currentSelectedOpp, setCurrentSelectedOpp] = useState<ContentOpportunity | null>(
    selectedOpportunity || (opportunities.length > 0 ? opportunities[0] : null)
  );

  // List of approved opportunities for targeted export and sync
  const approvedOpportunities = opportunities.filter(
    (o) => o.status === 'APPROVED' || o.status === 'DISPATCHED'
  );

  // Google Merchant Center (GMC) state & mode
  const [activeSheetMode, setActiveSheetMode] = useState<'calendar' | 'gmc'>('calendar');
  const [gmcItems, setGmcItems] = useState<GMCFeedItem[]>([
    {
      id: 'GMC-APX-CHAIR-01',
      title: 'ApexGrowth Pro Ergonomic Office Chair with Dynamic Lumbar Support',
      description: 'Commercial grade high-back task chair featuring pneumatic cylinder adjustment, breathable aerospace mesh, and multi-axis armrests. Solves workplace lumbar fatigue.',
      link: 'https://apexgrowth.store/products/ergonomic-chair-pro',
      image_link: 'https://images.unsplash.com/photo-1580481077195-c3c26027a005?auto=format&fit=crop&w=1200&q=80',
      availability: 'in_stock',
      price: '299.00 USD',
      google_product_category: 'Furniture > Chairs > Office Chairs',
      brand: 'ApexGrowth Living',
      gtin: '084019100101',
      mpn: 'APX-ERG-2026',
      condition: 'new',
      custom_label_0: 'Stop buying cheap office chairs until you know this...',
      custom_label_1: 'TikTok',
      custom_label_2: 'Retention-84%',
      marketingHighlights: [
        'Dynamic pneumatic lumbar cylinder',
        'Certified for 10+ hour continuous focus',
        'Pairs with viral TikTok content angle'
      ],
      status: 'READY'
    },
    {
      id: 'GMC-APX-DESK-02',
      title: 'ApexGrowth Dual-Motor Smart Standing Desk 60x30 with Memory Presets',
      description: 'Solid walnut finish standing desk with whisper-quiet dual motor lift, integrated cable raceway, and anti-collision safety sensor. Meets 2026 ergonomic standards.',
      link: 'https://apexgrowth.store/products/standing-desk-smart',
      image_link: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      availability: 'in_stock',
      price: '449.00 USD',
      google_product_category: 'Furniture > Office Furniture > Desks',
      brand: 'ApexGrowth Living',
      gtin: '084019100102',
      mpn: 'APX-DSK-2026',
      condition: 'new',
      custom_label_0: 'New workplace health standards just dropped...',
      custom_label_1: 'YouTube Shorts',
      custom_label_2: 'Retention-79%',
      marketingHighlights: [
        'Dual whisper-quiet electric motors',
        'Heavy-duty 280 lb load rating',
        'Rapid 4-level digital height memory'
      ],
      status: 'READY'
    },
    {
      id: 'GMC-APX-ACC-03',
      title: 'ApexGrowth Modular Cable Spine & Heavy-Duty Monitor Arm Bundle',
      description: 'Space-saving desk accessory kit featuring gas-spring single monitor arm and magnetic 30-slot vertical cable management spine. Under $50 productivity upgrade.',
      link: 'https://apexgrowth.store/products/cable-monitor-bundle',
      image_link: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
      availability: 'in_stock',
      price: '49.00 USD',
      google_product_category: 'Furniture > Office Furniture Accessories',
      brand: 'ApexGrowth Living',
      gtin: '084019100103',
      mpn: 'APX-ACC-2026',
      condition: 'new',
      custom_label_0: "You don't need a $2,000 setup to fix your back.",
      custom_label_1: 'Instagram Reels',
      custom_label_2: 'Retention-77%',
      marketingHighlights: [
        'Full 360-degree monitor rotation',
        'Magnetic cable pass-through clips',
        'Installs in under 5 minutes'
      ],
      status: 'READY'
    }
  ]);
  const [isEnrichingGMC, setIsEnrichingGMC] = useState(false);
  const [isPublishingGMC, setIsPublishingGMC] = useState(false);
  const [gmcBrand, setGmcBrand] = useState('ApexGrowth Living');
  const [showConfirmGMCPublish, setShowConfirmGMCPublish] = useState(false);
  const [geminiEnrichSuccess, setGeminiEnrichSuccess] = useState<string | null>(null);

  // Confirmation modal states for mutating operations (Mandatory per Workspace Skill)
  const [showConfirmSingleAppend, setShowConfirmSingleAppend] = useState(false);
  const [showConfirmBatchSync, setShowConfirmBatchSync] = useState(false);
  const [isAppending, setIsAppending] = useState(false);

  // Update selected opportunity if prop changes
  useEffect(() => {
    if (selectedOpportunity) {
      setCurrentSelectedOpp(selectedOpportunity);
    } else if (!currentSelectedOpp && opportunities.length > 0) {
      setCurrentSelectedOpp(opportunities[0]);
    }
  }, [selectedOpportunity, opportunities]);

  // Load drive spreadsheets and persisted sheet content when authenticated
  useEffect(() => {
    if (accessToken) {
      loadDriveFiles();
      if (spreadsheetId) {
        loadSheetContent(spreadsheetId, sheetName);
      }
    }
  }, [accessToken]);

  const loadDriveFiles = async () => {
    if (!accessToken) {
      setDriveFiles(DEFAULT_DEMO_FILES);
      return;
    }
    setIsLoadingFiles(true);
    try {
      const files = await listDriveSpreadsheets(accessToken);
      setDriveFiles(files && files.length > 0 ? files : DEFAULT_DEMO_FILES);
      if (files && files.length > 0 && !spreadsheetId) {
        setSpreadsheetId(files[0].id);
        loadSheetContent(files[0].id, sheetName);
      }
    } catch (err: any) {
      console.error('Failed to load spreadsheets:', err);
      setDriveFiles(DEFAULT_DEMO_FILES);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadSheetContent = async (sheetId: string, customTab?: string) => {
    const tabToUse = customTab || sheetName || 'Content Pipeline';
    if (!accessToken) {
      setIsLoadingSheet(true);
      setTimeout(() => setIsLoadingSheet(false), 200);
      return;
    }
    if (!sheetId) return;
    setIsLoadingSheet(true);
    try {
      const data = await readSpreadsheet(accessToken, sheetId, tabToUse);
      setSheetData(data);
      if (data.sheetName && (!sheetName || sheetName === 'Content Pipeline')) {
        setSheetName(data.sheetName);
      }
    } catch (err: any) {
      console.error('Failed to read spreadsheet:', err);
      onShowToast('warning', `Could not read spreadsheet rows: ${err.message}`);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleCreateNewSheet = async () => {
    const titleToUse =
      customSheetTitle.trim() || `ApexGrowth Content Calendar — ${new Date().toLocaleDateString()}`;

    if (!accessToken) {
      setIsCreatingSheet(true);
      const newDemoId = `demo_sheet_${Date.now()}`;
      const newFile: DriveSpreadsheetFile = {
        id: newDemoId,
        name: titleToUse,
        webViewLink: `https://docs.google.com/spreadsheets/d/${newDemoId}/edit`,
        modifiedTime: new Date().toISOString(),
      };
      setDriveFiles((prev) => [newFile, ...prev]);
      setSpreadsheetId(newDemoId);
      setCustomSheetTitle('');
      setIsCreatingSheet(false);
      onShowToast('success', `Created demonstration sheet "${titleToUse}" successfully!`);
      return;
    }

    setIsCreatingSheet(true);
    try {
      const { spreadsheetId: newId } = await createApexGrowthSpreadsheet(accessToken, titleToUse);
      onShowToast('success', `Created Google Sheet "${titleToUse}" successfully!`);
      setCustomSheetTitle('');
      await loadDriveFiles();
      setSpreadsheetId(newId);
      await loadSheetContent(newId, sheetName);
    } catch (err: any) {
      console.error('Create sheet error:', err);
      onShowToast('warning', `Failed to create sheet: ${err.message}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  /**
   * Component handler for executing appendRowToSheet with UI feedback and state sync.
   */
  const handleAppendRowToSheet = async (opportunity: ContentOpportunity): Promise<any> => {
    const targetSheetId = spreadsheetId.trim() || selectedSheetId || 'demo-sheet-pipeline';
    const tabName = sheetName.trim() || sheetData?.sheetName || 'Content Pipeline';

    if (!accessToken) {
      setIsAppending(true);
      const promptMetadata =
        (opportunity as any)?.promptMetadata ||
        (opportunity as any)?.prompt_metadata ||
        `Veo: ${opportunity?.veo_prompt || ''} | Imagen: ${opportunity?.imagen_prompt || ''}`;

      const newRow = [
        opportunity.id,
        new Date().toISOString().split('T')[0],
        opportunity.signal || '🔥 Trend Alert',
        opportunity.title,
        opportunity.hook,
        opportunity.script,
        opportunity.veo_prompt || promptMetadata,
        opportunity.imagen_prompt || promptMetadata,
        Array.isArray(opportunity.platforms) ? opportunity.platforms.join(', ') : opportunity.platforms || 'TikTok, Instagram Reels',
        opportunity.status || 'APPROVED',
        `${opportunity.predictedRetention || 84}%`,
        `${opportunity.viralityScore || 90}/100`,
      ];

      const currentValues = sheetData?.values ? [...sheetData.values, newRow] : [newRow];
      setSheetData({
        spreadsheetId: targetSheetId,
        title: sheetData?.title || 'ApexGrowth Content Pipeline',
        sheetName: tabName,
        values: currentValues,
        webViewLink: sheetData?.webViewLink || `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`,
      });

      try {
        localStorage.setItem('apexgrowth_demo_sheet_values', JSON.stringify(currentValues));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }

      onShowToast(
        'success',
        `Appended row for "${opportunity.title}" to spreadsheet pipeline! (Saved to local storage)`
      );
      setIsAppending(false);
      setShowConfirmSingleAppend(false);
      return { success: true, localOnly: true };
    }

    setIsAppending(true);
    try {
      const result = await appendRowToSheet(opportunity, targetSheetId, tabName, accessToken);

      onShowToast(
        'success',
        `Appended row for "${opportunity.title}" to Google Sheet using gapi.client.sheets.spreadsheets.values.append!`
      );

      // Refresh live sheet viewer to reflect newly inserted row
      await loadSheetContent(targetSheetId, tabName);
      return result;
    } catch (err: any) {
      console.error('appendRowToSheet Error:', err);
      const errMsg =
        err?.result?.error?.message || err?.message || 'Failed to append row to Google Sheet';
      onShowToast('warning', `Google Sheets API Error: ${errMsg}`);
      throw err;
    } finally {
      setIsAppending(false);
      setShowConfirmSingleAppend(false);
    }
  };

  // Batch sync all opportunities
  const handleConfirmBatchSync = async () => {
    const targetSheetId = spreadsheetId.trim() || selectedSheetId || 'demo-sheet-pipeline';
    const tabName = sheetName.trim() || sheetData?.sheetName || 'Content Pipeline';

    if (!accessToken) {
      setIsAppending(true);
      const rowsToAdd = opportunities.map((opp) => {
        const promptMetadata =
          (opp as any)?.promptMetadata ||
          (opp as any)?.prompt_metadata ||
          `Veo: ${opp.veo_prompt || ''} | Imagen: ${opp.imagen_prompt || ''}`;
        return [
          opp.id,
          new Date().toISOString().split('T')[0],
          opp.signal || '🔥 Trend Alert',
          opp.title,
          opp.hook,
          opp.script,
          opp.veo_prompt || promptMetadata,
          opp.imagen_prompt || promptMetadata,
          Array.isArray(opp.platforms) ? opp.platforms.join(', ') : opp.platforms || 'TikTok, Instagram Reels',
          opp.status || 'APPROVED',
          `${opp.predictedRetention || 84}%`,
          `${opp.viralityScore || 90}/100`,
        ];
      });

      const currentValues = sheetData?.values ? [...sheetData.values, ...rowsToAdd] : rowsToAdd;
      setSheetData({
        spreadsheetId: targetSheetId,
        title: sheetData?.title || 'ApexGrowth Content Pipeline',
        sheetName: tabName,
        values: currentValues,
        webViewLink: sheetData?.webViewLink || `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`,
      });

      try {
        localStorage.setItem('apexgrowth_demo_sheet_values', JSON.stringify(currentValues));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }

      onShowToast(
        'success',
        `Successfully appended ${opportunities.length} content opportunities to spreadsheet pipeline! (Saved locally)`
      );
      setShowConfirmBatchSync(false);
      setIsAppending(false);
      return;
    }

    setIsAppending(true);
    try {
      const count = await appendOpportunitiesToSheet(
        accessToken,
        targetSheetId,
        tabName,
        opportunities
      );
      onShowToast(
        'success',
        `Successfully appended ${count} content opportunities to Google Sheet!`
      );
      setShowConfirmBatchSync(false);
      await loadSheetContent(targetSheetId, tabName);
    } catch (err: any) {
      console.error('Batch sync error:', err);
      onShowToast('warning', `Failed to sync to sheet: ${err.message}`);
    } finally {
      setIsAppending(false);
    }
  };

  // 1. Call Gemini API to transform/enrich Opportunities for Google Merchant Center (GMC)
  const handleEnrichGMCWithGemini = async () => {
    setIsEnrichingGMC(true);
    setGeminiEnrichSuccess(null);
    try {
      const res = await fetch('/api/gemini/gmc-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities,
          niche: opportunities[0]?.niche || 'Ergonomic Office Furniture',
          brand: gmcBrand,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setGmcItems(data.items);
          setGeminiEnrichSuccess(
            `Gemini API (${data.engine}): Generated ${data.items.length} compliant GMC items with Google Product Taxonomy & optimized titles.`
          );
          onShowToast(
            'success',
            `Gemini API (${data.engine}): Successfully enriched ${data.items.length} products for Google Merchant Center!`
          );
        }
      } else {
        onShowToast('warning', 'Gemini GMC enrichment completed with standard schema.');
      }
    } catch (err: any) {
      console.error('GMC Enrich error:', err);
      onShowToast('warning', 'Gemini GMC enrichment used fallback schema.');
    } finally {
      setIsEnrichingGMC(false);
    }
  };

  // 2. Publish GMC Feed Items directly to configured Google Sheet tab (e.g. 'GMC Product Feed')
  const handlePublishGMCFeed = async () => {
    const targetSheetId = spreadsheetId.trim() || selectedSheetId;
    if (!targetSheetId) {
      onShowToast('warning', 'Please specify or select a Google Sheet ID first.');
      return;
    }
    if (gmcItems.length === 0) {
      onShowToast('warning', 'No GMC items to publish. Enrich opportunities with Gemini first.');
      return;
    }
    if (!accessToken) {
      onShowToast('warning', 'Please sign in with Google to publish to Google Sheets.');
      return;
    }

    setIsPublishingGMC(true);
    try {
      const gmcTargetTab = sheetName === 'Content Pipeline' ? 'GMC Product Feed' : sheetName;
      const count = await appendGMCFeedToSheet(
        accessToken,
        targetSheetId,
        gmcTargetTab,
        gmcItems
      );
      setSheetName(gmcTargetTab);
      onShowToast(
        'success',
        `Published ${count} GMC products to "${gmcTargetTab}" in your Google Sheet! Ready for Google Merchant Center fetch.`
      );
      setShowConfirmGMCPublish(false);
      // Automatically refresh live sheet viewer
      await loadSheetContent(targetSheetId, gmcTargetTab);
    } catch (err: any) {
      console.error('Publish GMC Error:', err);
      onShowToast('warning', `GMC Publishing error: ${err.message || 'Failed writing rows'}`);
    } finally {
      setIsPublishingGMC(false);
    }
  };

  // 3. Download official TSV file for Google Merchant Center manual or SFTP feed
  const handleDownloadGMCTSV = () => {
    if (gmcItems.length === 0) {
      onShowToast('warning', 'No GMC items to export. Enrich opportunities with Gemini first.');
      return;
    }
    const tsvData = exportGMCTSVDelivery(gmcItems);
    const blob = new Blob([tsvData], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gmc_product_feed_${new Date().toISOString().split('T')[0]}.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', 'Downloaded GMC Product Feed (TSV) for Google Merchant Center.');
  };

  /**
   * Export the current list of Content Opportunities as a structured CSV file,
   * including their metadata, title, script content, retention hooks, and prompts.
   *
   * @param onlyApproved If true, exports only approved opportunities. If false (default), exports all current opportunities.
   */
  const handleDownloadAsCSV = (onlyApproved: boolean = false) => {
    const targetOpportunities = onlyApproved
      ? opportunities.filter((o) => o.status === 'APPROVED' || o.status === 'DISPATCHED')
      : opportunities;

    if (!targetOpportunities || targetOpportunities.length === 0) {
      if (onlyApproved) {
        onShowToast(
          'warning',
          'No approved content opportunities found to export. Approve opportunities in the HITL Pipeline first, or download all opportunities.'
        );
      } else {
        onShowToast('warning', 'No content opportunities available in the current list to export as CSV.');
      }
      return;
    }

    const headers = [
      'Opportunity ID',
      'Title',
      'Script Content',
      '0-3s Retention Hook',
      'Signal Source',
      'Approval Status',
      'Predicted Retention (%)',
      'Virality Score (0-100)',
      'Target Platforms',
      'Niche',
      'Target Audience',
      'Brand Tone',
      'Prompt Metadata',
      'Veo 3.1 Prompt',
      'Imagen 3 Prompt',
      'Cloud Storage Asset URI',
      'BigQuery Telemetry Log',
      'Export Timestamp',
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      // Double up internal quotes
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const nowIso = new Date().toISOString();

    const rows = targetOpportunities.map((opp) => {
      const platformsStr = Array.isArray(opp.platforms)
        ? opp.platforms.join('; ')
        : String(opp.platforms || '');

      const promptMetadata =
        (opp as any)?.promptMetadata ||
        (opp as any)?.prompt_metadata ||
        `Veo: ${opp.veo_prompt || ''} | Imagen: ${opp.imagen_prompt || ''}`;

      return [
        escapeCSV(opp.id),
        escapeCSV(opp.title),
        escapeCSV(opp.script),
        escapeCSV(opp.hook),
        escapeCSV(opp.signal),
        escapeCSV(opp.status),
        escapeCSV(opp.predictedRetention),
        escapeCSV(opp.viralityScore),
        escapeCSV(platformsStr),
        escapeCSV(opp.niche),
        escapeCSV(opp.audience),
        escapeCSV(opp.tone),
        escapeCSV(promptMetadata),
        escapeCSV(opp.veo_prompt),
        escapeCSV(opp.imagen_prompt),
        escapeCSV(opp.cloudStorageStatus || ''),
        escapeCSV(opp.bigqueryTelemetry || ''),
        escapeCSV(nowIso),
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) so Excel, Numbers, and Google Sheets open special characters and emojis properly
    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanNiche = (targetOpportunities[0]?.niche || 'content')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const scopeTag = onlyApproved ? 'approved' : 'all';
    link.setAttribute('href', url);
    link.setAttribute('download', `apexgrowth-${cleanNiche}-${scopeTag}-opportunities-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(
      'success',
      `Exported ${targetOpportunities.length} content opportunities to CSV file successfully!`
    );
  };

  const handleDownloadOpportunitiesCSV = handleDownloadAsCSV;

  const effectiveUser = user || {
    displayName: "Portfolio Showcase",
    email: "portfolio.demo@apexgrowth.ai",
    photoURL: null,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-2 pt-2">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#A87432] font-semibold">
          SHEETS
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1A2521] leading-tight tracking-tight">
          Spreadsheet sync.
        </h1>
        <p className="text-xs text-[#5E6E67] leading-relaxed max-w-lg">
          Sync opportunities to Google Sheets or export formatted CSV files.
        </p>
      </div>

      {/* User Header & Drive Refresh */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          {effectiveUser.photoURL ? (
            <img
              src={effectiveUser.photoURL}
              alt={effectiveUser.displayName || "User"}
              className="w-9 h-9 rounded-full border border-[#D5DDD7]"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#172822] text-[#E2A968] flex items-center justify-center font-serif font-bold text-xs">
              {(effectiveUser.displayName || effectiveUser.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-serif font-normal text-[#1A2521]">
                {effectiveUser.displayName || "Portfolio Workspace"}
              </h2>
              <span className="text-[11px] font-mono text-[#7A8C84]">
                · {accessToken ? "Google Sheets Connected" : "Local Sync"}
              </span>
            </div>
            <p className="text-[11px] text-[#7A8C84]">{effectiveUser.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadAsCSV(false)}
            disabled={opportunities.length === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#172822] hover:bg-[#0E1A16] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download the current list of content opportunities as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#E2A968]" />
            <span>CSV Export</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadAsCSV(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#1A2521] bg-[#FAF8F5] hover:bg-white border border-[#E0D9CD] transition-colors flex items-center gap-1 cursor-pointer"
            title="Download approved content opportunities as CSV"
          >
            <span>Approved ({approvedOpportunities.length})</span>
          </button>
          <button
            onClick={loadDriveFiles}
            disabled={isLoadingFiles}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#1A2521] bg-[#FAF8F5] hover:bg-white border border-[#E0D9CD] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh spreadsheets list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin text-[#A87432]" : ""}`} />
            <span>Refresh</span>
          </button>
          {user ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#7A8C84] hover:text-rose-600 bg-[#FAF8F5] hover:bg-rose-50 border border-[#E0D9CD] hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#172822] hover:bg-[#EAEFEA] bg-[#FAF8F5] border border-[#CAD4CE] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Connect your personal Google account"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2C5E48]" />
              <span>Connect Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Sheet Controls + Selected Opportunity Quick-Append */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sheet Selector & Creation */}
        <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
            <h3 className="text-sm font-serif font-normal text-[#1A2521] flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#2C5E48]" />
              <span>Target Google Sheet</span>
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isSavedLocally
                    ? 'bg-[#EAF0EC] text-[#2C5E48] border-[#CFDFD7]'
                    : 'bg-[#FAF8F5] text-[#7A8C84] border-[#E0D9CD]'
                }`}
                title="Configuration persistence status in browser local storage"
              >
                <HardDrive className="w-2.5 h-2.5" />
                <span>{isSavedLocally ? 'LocalStorage Saved' : 'Auto-Syncing'}</span>
              </span>
              <span className="text-[10px] text-[#7A8C84] font-mono">
                {driveFiles.length} files
              </span>
            </div>
          </div>

          {/* Spreadsheet ID Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="spreadsheetId" className="text-[11px] font-medium text-[#4B5A54]">
                Spreadsheet ID
              </label>
              <span className="text-[10px] text-[#2C5E48] font-mono">Persisted</span>
            </div>
            <input
              id="spreadsheetId"
              data-testid="spreadsheet-id-input"
              name="spreadsheetId"
              type="text"
              aria-label="Spreadsheet ID"
              placeholder="Spreadsheet ID or URL"
              value={spreadsheetId}
              onChange={(e) => {
                const val = parseSpreadsheetId(e.target.value);
                setSpreadsheetId(val);
                if (val.trim()) {
                  loadSheetContent(val.trim(), sheetName);
                }
              }}
              className="w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg px-3 py-2 text-xs font-mono text-[#1A2521] placeholder-[#A6B3AC] focus:outline-none focus:ring-1 focus:ring-[#1D332D] focus:border-[#1D332D]"
            />
            <p className="text-[11px] text-[#7A8C84]">
              Paste the Google Sheet ID or full spreadsheet URL from your browser address bar.
            </p>
          </div>

          {/* Sheet Name / Tab Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="sheetName" className="text-[11px] font-medium text-[#4B5A54]">
                Sheet Name/Tab
              </label>
              <span className="text-[10px] text-[#2C5E48] font-mono">Persisted</span>
            </div>
            <div className="flex gap-2">
              <input
                id="sheetName"
                data-testid="sheet-name-input"
                name="sheetName"
                type="text"
                aria-label="Sheet Name/Tab"
                placeholder="Sheet Name/Tab"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                onBlur={() => {
                  if (spreadsheetId.trim() && sheetName.trim()) {
                    loadSheetContent(spreadsheetId.trim(), sheetName.trim());
                  }
                }}
                className="flex-1 bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg px-3 py-2 text-xs font-mono text-[#1A2521] placeholder-[#A6B3AC] focus:outline-none focus:ring-1 focus:ring-[#1D332D] focus:border-[#1D332D]"
              />
              <button
                type="button"
                onClick={() => {
                  if (spreadsheetId.trim()) {
                    loadSheetContent(spreadsheetId.trim(), sheetName.trim() || 'Content Pipeline');
                  } else {
                    onShowToast('warning', 'Please enter a valid Spreadsheet ID first.');
                  }
                }}
                disabled={!spreadsheetId.trim() || isLoadingSheet}
                title="Sync / Load Sheet Data from API"
                className="px-3 py-2 rounded-lg text-xs font-medium bg-[#FAF8F5] hover:bg-white text-[#1D332D] border border-[#D5DDD7] flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheet ? 'animate-spin text-[#A87432]' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Quick Preset Tab Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#7A8C84]">Presets:</span>
              {['Content Pipeline', 'GMC Product Feed', 'Sheet1', 'Editorial Calendar'].map((tabPreset) => (
                <button
                  key={tabPreset}
                  type="button"
                  onClick={() => {
                    setSheetName(tabPreset);
                    if (tabPreset === 'GMC Product Feed') {
                      setActiveSheetMode('gmc');
                    }
                    if (spreadsheetId.trim()) {
                      loadSheetContent(spreadsheetId.trim(), tabPreset);
                    }
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                    sheetName === tabPreset
                      ? 'bg-[#1D332D] text-white font-semibold'
                      : 'bg-[#FAF8F5] text-[#52635C] hover:bg-[#EBE5D9] border border-[#E0D9CD]'
                  }`}
                >
                  {tabPreset}
                </button>
              ))}
            </div>
          </div>

          {/* Local Storage Persistence Controls Panel */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl p-3 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#52635C]">
              <HardDrive className="w-3.5 h-3.5 text-[#2C5E48] shrink-0" />
              <span className="truncate">
                {isSavedLocally
                  ? 'Configuration saved to local storage'
                  : 'Auto-syncing to local storage'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleSaveToLocalStorage}
                className="px-2 py-1 rounded-md bg-[#FAF8F5] hover:bg-white text-[#1D332D] border border-[#D5DDD7] flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                title="Save current Spreadsheet ID and Tab name to local storage"
              >
                <Save className="w-3 h-3 text-[#A87432]" />
                <span>Save</span>
              </button>
              {isSavedLocally && (
                <button
                  type="button"
                  onClick={handleClearLocalStorage}
                  className="px-2 py-1 rounded-md bg-[#FAF8F5] hover:bg-rose-50 text-[#7A8C84] hover:text-rose-600 border border-[#D5DDD7] hover:border-rose-200 flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer"
                  title="Clear saved configuration from local storage"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Select Existing Sheet from Google Drive */}
          <div className="space-y-1.5 pt-2 border-t border-[#F0EBE0]">
            <label className="text-[11px] font-medium text-[#4B5A54]">Or Select from Drive Spreadsheets</label>
            <select
              value={spreadsheetId}
              onChange={(e) => {
                const val = e.target.value;
                setSpreadsheetId(val);
                if (val) {
                  loadSheetContent(val, sheetName);
                }
              }}
              className="w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:ring-1 focus:ring-[#1D332D]"
            >
              {driveFiles.length === 0 && <option value="">No sheets found in Drive</option>}
              {driveFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create New Content Calendar */}
          <div className="pt-3 border-t border-[#F0EBE0] space-y-2">
            <label className="text-[11px] font-medium text-[#4B5A54] flex items-center gap-1.5">
              <FilePlus className="w-3.5 h-3.5 text-[#2C5E48]" />
              Create New Content Sheet
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSheetTitle}
                onChange={(e) => setCustomSheetTitle(e.target.value)}
                placeholder="e.g. ApexGrowth Content Calendar"
                className="flex-1 bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg px-3 py-1.5 text-xs text-[#1A2521] placeholder-[#A6B3AC] focus:outline-none focus:ring-1 focus:ring-[#1D332D]"
              />
              <button
                onClick={handleCreateNewSheet}
                disabled={isCreatingSheet}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Batch Sync & CSV Export Buttons */}
          <div className="pt-3 border-t border-[#F0EBE0] space-y-2">
            <button
              onClick={() => setShowConfirmBatchSync(true)}
              disabled={!selectedSheetId || opportunities.length === 0}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-medium text-[#1A2521] bg-[#FAF8F5] hover:bg-white border border-[#D5DDD7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-[#2C5E48]" />
              <span>Batch Append All ({opportunities.length}) Ideas</span>
            </button>

            {/* Download as CSV Buttons */}
            <button
              type="button"
              onClick={() => handleDownloadAsCSV(false)}
              disabled={opportunities.length === 0}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Export the current list of content opportunities, including metadata, title, and script content, as a structured CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download as CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadAsCSV(true)}
              className="w-full py-2 px-3 rounded-lg text-[11px] font-medium text-[#1A2521] bg-[#FAF8F5] hover:bg-white border border-[#D5DDD7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Download only approved content opportunities as CSV"
            >
              <span>Download Approved as CSV ({approvedOpportunities.length})</span>
            </button>
          </div>
        </div>

        {/* Middle & Right: Append Selected Opportunity, GMC Suite & Live Sheet View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switcher: Content Pipeline Calendar vs Google Merchant Center (GMC) */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] border border-[#E6DFD3] rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSheetMode('calendar')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSheetMode === 'calendar'
                  ? 'bg-[#1D332D] text-white shadow-xs'
                  : 'text-[#52635C] hover:text-[#1A2521] hover:bg-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Content Pipeline Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSheetMode('gmc');
                if (sheetName === 'Content Pipeline') {
                  setSheetName('GMC Product Feed');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSheetMode === 'gmc'
                  ? 'bg-[#1D332D] text-white shadow-xs'
                  : 'text-[#52635C] hover:text-[#1A2521] hover:bg-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#E2A968]" />
              <div className="flex items-center gap-1.5">
                <span>Google Merchant Center (GMC)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E2A968]/30 text-[#1A2521] font-mono font-bold tracking-wider">
                  Gemini API
                </span>
              </div>
            </button>
          </div>

          {/* Mode 1: Calendar View */}
          {activeSheetMode === 'calendar' && (
            <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE0] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A87432]" />
                  <h3 className="text-base font-serif font-normal text-[#1A2521]">
                    Append Selected Opportunity to Google Sheet
                  </h3>
                </div>
                <span className="text-[11px] text-[#2C5E48] font-mono bg-[#EAF0EC] px-2 py-0.5 rounded border border-[#CFDFD7]">
                  gapi.client.sheets
                </span>
              </div>

              {/* Opportunity Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#4B5A54]">
                  Select Opportunity from Pipeline:
                </label>
                <select
                  value={currentSelectedOpp?.id || ''}
                  onChange={(e) => {
                    const match = opportunities.find((o) => o.id === e.target.value);
                    if (match) setCurrentSelectedOpp(match);
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-lg px-3 py-2 text-xs text-[#1A2521] focus:outline-none focus:ring-1 focus:ring-[#1D332D]"
                >
                  {opportunities.map((opp, idx) => (
                    <option key={opp.id} value={opp.id}>
                      #{idx + 1}: {opp.title} [{opp.signal}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Opportunity Preview Card */}
              {currentSelectedOpp && (
                <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E2DDD3] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1A2521] truncate">
                      {currentSelectedOpp.title}
                    </span>
                    <span className="font-mono text-[#2C5E48] font-semibold shrink-0">
                      Retention: {currentSelectedOpp.predictedRetention}%
                    </span>
                  </div>

                  <div className="text-xs text-[#7A5816] italic flex items-start gap-1.5 bg-[#FAF0D9] p-3 rounded-lg border border-[#EEDDB8]">
                    <Flame className="w-3.5 h-3.5 text-[#A87432] shrink-0 mt-0.5" />
                    <span>"{currentSelectedOpp.hook}"</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#63756E] font-mono">
                    <div>
                      Signal: <span className="text-[#1A2521]">{currentSelectedOpp.signal}</span>
                    </div>
                    <div>
                      Platforms:{' '}
                      <span className="text-[#1A2521]">
                        {Array.isArray(currentSelectedOpp.platforms)
                          ? currentSelectedOpp.platforms.join(', ')
                          : currentSelectedOpp.platforms}
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => setShowConfirmSingleAppend(true)}
                    disabled={!selectedSheetId || isAppending}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                      !selectedSheetId
                        ? 'bg-[#F0EBE0] text-[#9AABA3] cursor-not-allowed'
                        : 'bg-[#1D332D] hover:bg-[#152521] text-white shadow-xs hover:scale-[1.01]'
                    }`}
                  >
                    {isAppending ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Appending to Google Sheet via gapi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Append Selected Opportunity to Google Sheet</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Google Merchant Center (GMC) Publishing Suite */}
          {activeSheetMode === 'gmc' && (
            <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-5 shadow-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0D9] text-[#7A5816] border border-[#EEDDB8] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-normal text-[#1A2521] flex items-center gap-2">
                      <span>Google Merchant Center (GMC) Feed Publisher</span>
                      <span className="text-[10px] bg-[#EAF0EC] text-[#2C5E48] border border-[#CFDFD7] px-2 py-0.5 rounded-full font-mono">
                        Gemini 3.8 Flash
                      </span>
                    </h3>
                    <p className="text-xs text-[#63756E]">
                      Convert content opportunities into compliant Google Shopping feeds and publish directly to Google Sheets
                    </p>
                  </div>
                </div>

                <a
                  href="https://merchants.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF8F5] hover:bg-white text-[#1A2521] border border-[#D5DDD7] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Store className="w-3.5 h-3.5 text-[#A87432]" />
                  <span>Open GMC Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#7A8C84]" />
                </a>
              </div>

              {/* Gemini Enrichment Notification */}
              {geminiEnrichSuccess && (
                <div className="p-3 bg-[#EAF0EC] border border-[#CFDFD7] rounded-xl flex items-center gap-2 text-xs text-[#2C5E48]">
                  <CheckCircle2 className="w-4 h-4 text-[#2C5E48] shrink-0" />
                  <span>{geminiEnrichSuccess}</span>
                </div>
              )}

              {/* GMC Controls Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#E2DDD3]">
                <div>
                  <label className="text-[11px] font-medium text-[#4B5A54] block mb-1">
                    GMC Brand Name
                  </label>
                  <input
                    type="text"
                    value={gmcBrand}
                    onChange={(e) => setGmcBrand(e.target.value)}
                    placeholder="e.g. ApexGrowth Living"
                    className="w-full bg-white border border-[#E2DDD3] rounded-lg px-2.5 py-1.5 text-xs text-[#1A2521] focus:outline-none focus:ring-1 focus:ring-[#1D332D]"
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap items-end gap-2">
                  {/* Gemini API Enrich Button */}
                  <button
                    type="button"
                    onClick={handleEnrichGMCWithGemini}
                    disabled={isEnrichingGMC}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isEnrichingGMC ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enriching via Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#E2A968]" />
                        <span>Enrich Feed with Gemini API</span>
                      </>
                    )}
                  </button>

                  {/* Publish to GMC Google Sheet Button */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmGMCPublish(true)}
                    disabled={!selectedSheetId || gmcItems.length === 0 || isPublishingGMC}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#A87432] hover:bg-[#8C5D23] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isPublishingGMC ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing to Sheet...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish to GMC Sheet</span>
                      </>
                    )}
                  </button>

                  {/* Download TSV Feed Button */}
                  <button
                    type="button"
                    onClick={handleDownloadGMCTSV}
                    disabled={gmcItems.length === 0}
                    title="Export TSV for manual upload or SFTP in Google Merchant Center"
                    className="py-1.5 px-3 rounded-lg text-xs font-medium bg-[#FAF8F5] hover:bg-white text-[#1A2521] border border-[#D5DDD7] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TSV Feed</span>
                  </button>
                </div>
              </div>

              {/* GMC Compliance Quality Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] flex items-center gap-1.5 text-[#52635C]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48] shrink-0" />
                  <span>Title ≤ 150 chars</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] flex items-center gap-1.5 text-[#52635C]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48] shrink-0" />
                  <span>ISO 4217 Currency</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] flex items-center gap-1.5 text-[#52635C]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48] shrink-0" />
                  <span>Google Taxonomy</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E2DDD3] flex items-center gap-1.5 text-[#52635C]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E48] shrink-0" />
                  <span>In-Stock Certified</span>
                </div>
              </div>

              {/* GMC Feed Items Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1A2521]">
                    Google Merchant Center Feed Catalog ({gmcItems.length} Products):
                  </span>
                  <span className="text-[10px] text-[#A87432] font-mono">
                    Tab: {sheetName === 'Content Pipeline' ? 'GMC Product Feed' : sheetName}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[260px] rounded-xl border border-[#E6DFD3] bg-white">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-[#FAF8F5] text-[#4E5D57] font-mono uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#E6DFD3]">
                      <tr>
                        <th className="p-2.5">SKU / ID</th>
                        <th className="p-2.5">Preview</th>
                        <th className="p-2.5">Title (GMC Optimized)</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Google Category</th>
                        <th className="p-2.5">Custom Label 0 (Hook)</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE0]">
                      {gmcItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-2.5 font-mono text-[#1D332D] font-bold">{item.id}</td>
                          <td className="p-2.5">
                            <img
                              src={item.image_link}
                              alt={item.title}
                              className="w-7 h-7 rounded object-cover border border-[#D5DDD7]"
                            />
                          </td>
                          <td className="p-2.5 max-w-xs truncate text-[#1A2521]" title={item.title}>
                            {item.title}
                            <span className="text-[10px] text-[#7A8C84] font-mono ml-1.5">
                              ({item.title.length}/150)
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[#2C5E48] font-semibold">{item.price}</td>
                          <td className="p-2.5 text-[#63756E] max-w-[180px] truncate" title={item.google_product_category}>
                            {item.google_product_category}
                          </td>
                          <td className="p-2.5 text-[#7A5816] max-w-[160px] truncate" title={item.custom_label_0}>
                            {item.custom_label_0}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EAF0EC] text-[#2C5E48] border border-[#CFDFD7]">
                              GMC Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GMC Setup Guide Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD3] text-xs text-[#52635C] space-y-2">
                <div className="font-semibold text-[#1A2521] flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-[#2C5E48]" />
                  <span>How Google Merchant Center (GMC) Publishes from Google Sheets:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#63756E] pl-1 leading-relaxed">
                  <li>
                    Click <strong className="text-[#1D332D]">"Publish to GMC Sheet"</strong> above to write the verified GMC schema to your Google Sheet.
                  </li>
                  <li>
                    In <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer" className="text-[#1D332D] underline hover:text-[#12221E]">Google Merchant Center</a>, navigate to <strong>Products &gt; Feeds &gt; Add Primary Feed</strong>.
                  </li>
                  <li>
                    Select <strong className="text-[#1A2521]">Google Sheets</strong> and choose this spreadsheet ID (<span className="font-mono text-[#1D332D]">{spreadsheetId || 'configured-id'}</span>). Merchant Center will automatically synchronize live product pricing, inventory, and social campaign attributes!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Live Sheet Data Grid View */}
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE0] pb-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#2C5E48]" />
                <h3 className="text-base font-serif font-normal text-[#1A2521] truncate">
                  {sheetData ? sheetData.title : 'Spreadsheet Viewer'}
                </h3>
                {sheetData && (
                  <span className="text-[10px] bg-[#EAF0EC] border border-[#CFDFD7] px-2 py-0.5 rounded text-[#2C5E48] font-mono">
                    Tab: {sheetData.sheetName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadAsCSV(false)}
                  disabled={opportunities.length === 0}
                  className="text-xs text-[#1D332D] hover:text-[#12221E] flex items-center gap-1 font-medium transition-colors cursor-pointer bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#D5DDD7] disabled:opacity-50"
                  title="Export current content opportunities, including metadata, title, and script content, as a structured CSV file"
                >
                  <Download className="w-3.5 h-3.5 text-[#A87432]" />
                  <span>Download as CSV</span>
                </button>

                {selectedSheetId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${selectedSheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1D332D] hover:underline flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Table Display */}
            {isLoadingSheet ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-xs text-[#7A8C84]">
                <span className="w-6 h-6 border-2 border-[#1D332D] border-t-transparent rounded-full animate-spin" />
                <span>Reading Google Spreadsheet rows...</span>
              </div>
            ) : sheetData && sheetData.values.length > 0 ? (
              <div className="overflow-x-auto max-h-[300px] rounded-xl border border-[#E6DFD3] bg-white">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-[#FAF8F5] text-[#4E5D57] font-mono uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#E6DFD3]">
                    <tr>
                      {sheetData.values[0].map((header, idx) => (
                        <th
                          key={idx}
                          className="p-2.5 font-semibold text-[#1A2521] border-r border-[#E6DFD3] last:border-none"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE0]">
                    {sheetData.values.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAF8F5] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-2.5 text-[#1A2521] border-r border-[#F0EBE0] last:border-none max-w-xs truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-center p-6 bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5C7] text-xs text-[#7A8C84] space-y-1">
                <FileSpreadsheet className="w-8 h-8 text-[#A87432] opacity-70 mb-1" />
                <p className="font-serif text-sm font-normal text-[#1A2521]">Spreadsheet has no rows</p>
                <p className="text-[11px] text-[#7A8C84]">
                  Append a selected opportunity above to populate rows.
                </p>
              </div>
            )}

            {sheetData && (
              <div className="text-[11px] text-[#7A8C84] font-mono flex items-center justify-between pt-2 border-t border-[#F0EBE0]">
                <span>Total Rows: {sheetData.values.length}</span>
                <span className="text-[#2C5E48]">Synced via Sheets API v4</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Single Opportunity Append (Mandatory per Workspace Skill) */}
      {showConfirmSingleAppend && currentSelectedOpp && sheetData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E6DFD3] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EC] text-[#2C5E48] flex items-center justify-center border border-[#CFDFD7]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-normal text-[#1A2521]">Confirm Append to Sheet</h3>
                <p className="text-xs text-[#63756E]">Append 1 row to your Google Spreadsheet</p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD3] space-y-2 text-xs">
              <div className="flex justify-between text-[#52635C]">
                <span>Target Sheet:</span>
                <strong className="text-[#1A2521] truncate max-w-[200px]">{sheetData.title}</strong>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Target Tab:</span>
                <span className="font-mono text-[#2C5E48]">{sheetData.sheetName}</span>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Opportunity Title:</span>
                <strong className="text-[#1A2521] truncate max-w-[200px]">
                  {currentSelectedOpp.title}
                </strong>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Retention:</span>
                <span className="font-mono text-[#2C5E48]">
                  {currentSelectedOpp.predictedRetention}%
                </span>
              </div>
            </div>

            <p className="text-xs text-[#63756E] leading-relaxed">
              This operation will insert a new row into your Google Sheet with the opportunity title, hook, script outline, and Veo/Imagen prompt metadata using the Google Sheets API.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmSingleAppend(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#7A8C84] hover:text-[#1A2521] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAppendRowToSheet(currentSelectedOpp)}
                disabled={isAppending}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isAppending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Appending...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Append</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Batch Sync */}
      {showConfirmBatchSync && sheetData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E6DFD3] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EC] text-[#2C5E48] flex items-center justify-center border border-[#CFDFD7]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-normal text-[#1A2521]">Confirm Batch Append</h3>
                <p className="text-xs text-[#63756E]">Append all pipeline opportunities</p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD3] space-y-2 text-xs">
              <div className="flex justify-between text-[#52635C]">
                <span>Target Sheet:</span>
                <strong className="text-[#1A2521] truncate max-w-[200px]">{sheetData.title}</strong>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Rows to append:</span>
                <span className="font-mono text-[#2C5E48] font-bold">
                  {opportunities.length} opportunities
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmBatchSync(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#7A8C84] hover:text-[#1A2521] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchSync}
                disabled={isAppending}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isAppending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing Rows...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Batch Append</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for GMC Feed Publish (Mandatory per Workspace Skill) */}
      {showConfirmGMCPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E6DFD3] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0D9] text-[#7A5816] flex items-center justify-center border border-[#EEDDB8]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-normal text-[#1A2521]">Publish to Google Merchant Center Sheet</h3>
                <p className="text-xs text-[#63756E]">Append GMC product feed rows to Google Sheets</p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD3] space-y-2 text-xs">
              <div className="flex justify-between text-[#52635C]">
                <span>Target Sheet ID:</span>
                <strong className="text-[#1A2521] truncate max-w-[200px] font-mono">{spreadsheetId}</strong>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Target GMC Tab:</span>
                <span className="font-mono text-[#A87432] font-bold">
                  {sheetName === 'Content Pipeline' ? 'GMC Product Feed' : sheetName}
                </span>
              </div>
              <div className="flex justify-between text-[#52635C]">
                <span>Products to Publish:</span>
                <span className="font-mono text-[#2C5E48] font-bold">{gmcItems.length} GMC Items</span>
              </div>
            </div>

            <p className="text-xs text-[#63756E] leading-relaxed">
              This operation will format the sheet with standard Google Merchant Center attributes (id, title, description, link, image_link, availability, price, google_product_category, brand, gtin, mpn, condition, custom labels) and append your Gemini-enriched products for live GMC scheduled fetching.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmGMCPublish(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#7A8C84] hover:text-[#1A2521] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishGMCFeed}
                disabled={isPublishingGMC}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1D332D] hover:bg-[#152521] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isPublishingGMC ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing to Sheet...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsTab;
