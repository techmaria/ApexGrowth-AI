import { ContentOpportunity, CreatorBrief, SignalCategory, PerformanceStats } from '../types';
import { generateClientAestheticSvg } from './imagenService';

export interface CSVParseResult {
  opportunities: ContentOpportunity[];
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  warnings: string[];
  errors: string[];
}

/**
 * Robust RFC 4180 CSV tokenizer supporting quoted cells with commas,
 * escaped quotes (""), and multiline content.
 */
export function parseCSVTokens(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, ''); // strip UTF-8 BOM if present
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  // Filter out completely blank lines
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'id') return 'id';
  if (clean === 'title' || clean === 'topic') return 'title';
  if (clean === 'category' || clean === 'signaltype' || clean === 'signal') return 'signalType';
  if (clean === 'sourcecontext' || clean === 'source' || clean === 'context') return 'sourceContext';
  if (clean === '03shook' || clean === 'hook' || clean === 'first3shook') return 'hook';
  if (clean === 'scriptoutline' || clean === 'script' || clean === 'scriptsummary') return 'script';
  if (clean === 'platforms' || clean === 'platform' || clean === 'channels') return 'platforms';
  if (clean === 'status') return 'status';
  if (clean === 'calendarstate' || clean === 'calendarstatus' || clean === 'calendar') return 'calendarStatus';
  if (clean === 'scheduledtime' || clean === 'scheduled' || clean === 'remindertime') return 'scheduledReminderTime';
  if (clean === 'reach' || clean === 'impressions') return 'reach';
  if (clean === 'likes' || clean === 'reactions') return 'likes';
  if (clean === 'comments' || clean === 'replies') return 'comments';
  if (clean === 'saves' || clean === 'bookmarks') return 'saves';
  if (clean === 'creatorbusiness' || clean === 'business' || clean === 'brand') return 'businessName';
  if (clean === 'niche') return 'niche';
  if (clean === 'audience') return 'audience';
  if (clean === 'tone') return 'tone';
  if (clean === 'dateadded' || clean === 'date') return 'dateAdded';
  if (clean === 'veoprompt' || clean === 'veo') return 'veo_prompt';
  if (clean === 'imagenprompt' || clean === 'imagen') return 'imagen_prompt';
  if (clean === 'viralityscore' || clean === 'virality') return 'viralityScore';
  if (clean === 'predictedretention' || clean === 'retention') return 'predictedRetention';
  return clean;
}

const VALID_SIGNAL_CATEGORIES: SignalCategory[] = [
  'Trend',
  'News',
  'Personal idea',
  'Event',
  'Creative reference',
];

/**
 * Parses raw CSV text into ContentOpportunity objects matching workspace schema.
 */
export function parseCSVToOpportunities(
  csvText: string,
  defaultBrief?: CreatorBrief,
  existingIds: Set<string> = new Set()
): CSVParseResult {
  const rows = parseCSVTokens(csvText);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (rows.length < 2) {
    return {
      opportunities: [],
      totalRows: 0,
      importedCount: 0,
      skippedCount: 0,
      warnings: [],
      errors: ['The CSV file is empty or missing data rows below the header.'],
    };
  }

  const rawHeaders = rows[0];
  const headerMap = new Map<string, number>();

  rawHeaders.forEach((h, idx) => {
    const norm = normalizeHeaderKey(h);
    headerMap.set(norm, idx);
  });

  // Verify critical fields
  if (!headerMap.has('title') && !headerMap.has('hook')) {
    errors.push('CSV must contain at least a "Title" or "Hook" column header.');
    return {
      opportunities: [],
      totalRows: rows.length - 1,
      importedCount: 0,
      skippedCount: rows.length - 1,
      warnings,
      errors,
    };
  }

  const opportunities: ContentOpportunity[] = [];
  const dataRows = rows.slice(1);
  let skippedCount = 0;

  dataRows.forEach((row, rowIndex) => {
    const lineNum = rowIndex + 2;

    const getVal = (key: string): string => {
      const idx = headerMap.get(key);
      if (idx !== undefined && idx < row.length) {
        return row[idx].trim();
      }
      return '';
    };

    const title = getVal('title') || getVal('hook');
    const hook = getVal('hook') || getVal('title');

    if (!title && !hook) {
      warnings.push(`Row ${lineNum}: Skipped because both Title and Hook are empty.`);
      skippedCount++;
      return;
    }

    // Determine ID
    let rawId = getVal('id');
    if (!rawId || existingIds.has(rawId)) {
      const timestampSuffix = Date.now().toString().slice(-4);
      rawId = `OPP-${timestampSuffix}${opportunities.length + 1}`;
    }
    existingIds.add(rawId);

    // Determine category
    const catVal = getVal('signalType');
    let signalType: SignalCategory = 'Trend';
    const matchedCategory = VALID_SIGNAL_CATEGORIES.find(
      (c) => c.toLowerCase() === catVal.toLowerCase()
    );
    if (matchedCategory) {
      signalType = matchedCategory;
    } else if (catVal) {
      signalType = 'Personal idea';
    }

    // Determine platforms
    const platStr = getVal('platforms');
    let platforms: string[] = [];
    if (platStr) {
      platforms = platStr
        .split(/[;,|]/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
    if (platforms.length === 0) {
      platforms = defaultBrief?.platforms?.length ? [...defaultBrief.platforms] : ['Instagram', 'TikTok'];
    }

    // Determine status
    let status: ContentOpportunity['status'] = 'QUEUED';
    const statusVal = getVal('status').toUpperCase();
    if (['QUEUED', 'APPROVED', 'RENDERING', 'DISPATCHED', 'REJECTED'].includes(statusVal)) {
      status = statusVal as ContentOpportunity['status'];
    }

    // Determine calendar status
    let calendarStatus: ContentOpportunity['calendarStatus'] | undefined = undefined;
    const calVal = getVal('calendarStatus');
    if (['Approved', 'Scheduled', 'Published'].includes(calVal)) {
      calendarStatus = calVal as any;
    }

    // Scores
    const viralityVal = parseInt(getVal('viralityScore'), 10);
    const retentionVal = parseInt(getVal('predictedRetention'), 10);
    const viralityScore = !isNaN(viralityVal) && viralityVal > 0 && viralityVal <= 100 ? viralityVal : 88;
    const predictedRetention = !isNaN(retentionVal) && retentionVal > 0 && retentionVal <= 100 ? retentionVal : 84;

    // Performance numbers
    const reachVal = parseInt(getVal('reach'), 10);
    const likesVal = parseInt(getVal('likes'), 10);
    const commentsVal = parseInt(getVal('comments'), 10);
    const savesVal = parseInt(getVal('saves'), 10);

    let performance: PerformanceStats | undefined = undefined;
    if (!isNaN(reachVal) || !isNaN(likesVal) || !isNaN(commentsVal) || !isNaN(savesVal)) {
      performance = {
        reach: !isNaN(reachVal) ? reachVal : 0,
        likes: !isNaN(likesVal) ? likesVal : 0,
        comments: !isNaN(commentsVal) ? commentsVal : 0,
        saves: !isNaN(savesVal) ? savesVal : 0,
        edited: true,
      };
    }

    const script =
      getVal('script') ||
      `Visual: Close-up presentation demonstrating ${title}.\nAudio: "Here is what makes this work, step-by-step."`;

    const imagen_prompt =
      getVal('imagen_prompt') ||
      `Aesthetic minimalist editorial photo representing ${title}, soft warm daylight, clean studio atmosphere, 8k`;

    const veo_prompt =
      getVal('veo_prompt') ||
      `Tactile 9:16 vertical video showing ${title}, unhurried pace, natural ambient light`;

    const sourceContext = getVal('sourceContext') || 'Bulk CSV Import';

    const opp: ContentOpportunity = {
      id: rawId,
      title: title || 'Untitled Opportunity',
      hook: hook || title,
      signal: `${signalType} · ${sourceContext}`,
      signalType,
      sourceContext,
      script,
      platforms,
      niche: getVal('niche') || defaultBrief?.niche || 'General Creator',
      audience: getVal('audience') || defaultBrief?.audience || 'Target Community',
      tone: getVal('tone') || defaultBrief?.tone || 'Knowledgeable, authentic, warm',
      status,
      calendarStatus,
      scheduledReminderTime: getVal('scheduledReminderTime') || undefined,
      viralityScore,
      predictedRetention,
      performance,
      dateAdded: getVal('dateAdded') || 'IMPORTED TODAY',
      veo_prompt,
      imagen_prompt,
      customBackgroundImage: generateClientAestheticSvg(imagen_prompt, '16:9'),
    };

    opportunities.push(opp);
  });

  return {
    opportunities,
    totalRows: dataRows.length,
    importedCount: opportunities.length,
    skippedCount,
    warnings,
    errors,
  };
}

/**
 * Generates a clean, ready-to-use CSV template matching the exact workspace structure.
 */
export function generateSampleCSVTemplate(brief?: CreatorBrief): string {
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

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const sampleRows = [
    [
      escapeCSV('OPP-CSV-01'),
      escapeCSV('The 10-second morning care reset'),
      escapeCSV('Trend'),
      escapeCSV('Creator Community observation'),
      escapeCSV('Stop over-complicating your routine: 2 quick habits to do before heading out.'),
      escapeCSV('Visual: Quick 3-point walkthrough showing effortless maintenance.\nAudio: "If you only have 2 minutes, check these two spots first."'),
      escapeCSV('Instagram; TikTok'),
      escapeCSV('QUEUED'),
      escapeCSV('Draft'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(brief?.businessName || 'Morrow & Moss'),
      escapeCSV(brief?.niche || 'Independent Plant Shop'),
      escapeCSV(brief?.audience || 'Apartment dwellers and first-time plant parents'),
      escapeCSV('ADDED MAR 9'),
    ],
    [
      escapeCSV('OPP-CSV-02'),
      escapeCSV('Weekend workshop spotlight: Healthy root systems'),
      escapeCSV('Event'),
      escapeCSV('Shop Calendar'),
      escapeCSV('Bring your oldest plant this Saturday: how to identify pot-bound roots in under 30 seconds.'),
      escapeCSV('Visual: Hands-on demonstration of loosening soil and assessing root color.\nAudio: "Before you repot into a container that is too big, check this test."'),
      escapeCSV('Instagram; YouTube'),
      escapeCSV('APPROVED'),
      escapeCSV('Scheduled'),
      escapeCSV('2025-03-22T11:00'),
      escapeCSV(1420),
      escapeCSV(115),
      escapeCSV(18),
      escapeCSV(42),
      escapeCSV(brief?.businessName || 'Morrow & Moss'),
      escapeCSV(brief?.niche || 'Independent Plant Shop'),
      escapeCSV(brief?.audience || 'Apartment dwellers and first-time plant parents'),
      escapeCSV('ADDED MAR 9'),
    ],
  ];

  return '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
}
