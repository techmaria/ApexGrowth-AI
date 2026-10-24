import { ContentOpportunity, GMCFeedItem } from '../types';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
  createdTime?: string;
}

export interface SpreadsheetData {
  spreadsheetId: string;
  title: string;
  sheetName: string;
  values: string[][];
  webViewLink: string;
}

// 1. List Spreadsheets from Google Drive
export const listDriveSpreadsheets = async (
  accessToken: string
): Promise<DriveSpreadsheetFile[]> => {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const fields = encodeURIComponent("files(id,name,webViewLink,createdTime,modifiedTime)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=15`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list spreadsheets from Drive: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
};

// 2. Create a New Content Calendar Spreadsheet
export const createApexGrowthSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const title = customTitle || `ApexGrowth Content Calendar — ${new Date().toLocaleDateString()}`;

  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Content Pipeline',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 12,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${createRes.status} ${errorText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row
  const headers = [
    [
      'ID',
      'Date Added',
      'Signal Origin',
      'Content Title',
      '0-3s Retention Hook',
      'Script Outline',
      'Veo 3.1 Prompt (9:16)',
      'Imagen 3 Prompt',
      'Target Platforms',
      'Status',
      'Projected Retention',
      'Virality Score',
    ],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Content Pipeline'!A1:L1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: headers }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
};

// 3. Read Rows from Spreadsheet
export const readSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName?: string
): Promise<SpreadsheetData> => {
  // First fetch metadata to get sheet title if not provided
  let actualSheet = sheetName;
  let title = 'Spreadsheet';
  let webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (metaRes.ok) {
    const meta = await metaRes.json();
    title = meta.properties?.title || 'Spreadsheet';
    if (!actualSheet && meta.sheets && meta.sheets.length > 0) {
      actualSheet = meta.sheets[0].properties?.title || 'Sheet1';
    }
  }

  actualSheet = actualSheet || 'Sheet1';
  const range = encodeURIComponent(`'${actualSheet}'!A1:Z100`);

  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!valuesRes.ok) {
    const errorText = await valuesRes.text();
    throw new Error(`Failed to read spreadsheet values: ${valuesRes.status} ${errorText}`);
  }

  const valuesData = await valuesRes.json();

  return {
    spreadsheetId,
    title,
    sheetName: actualSheet,
    values: valuesData.values || [],
    webViewLink,
  };
};

// 4. Append Opportunities to Spreadsheet (Batch)
export const appendOpportunitiesToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  opportunities: ContentOpportunity[]
): Promise<number> => {
  if (opportunities.length === 0) return 0;

  const rows = opportunities.map((opp) => [
    opp.id,
    new Date().toISOString().split('T')[0],
    opp.signal,
    opp.title,
    opp.hook,
    opp.script,
    opp.veo_prompt,
    opp.imagen_prompt,
    Array.isArray(opp.platforms) ? opp.platforms.join(', ') : String(opp.platforms || ''),
    opp.status,
    `${opp.predictedRetention}%`,
    `${opp.viralityScore}/100`,
  ]);

  const targetRange = encodeURIComponent(`'${sheetName}'!A:L`);
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append rows to sheet: ${res.status} ${errorText}`);
  }

  return rows.length;
};

// 5. Append a Single Selected ContentOpportunity to Spreadsheet using Google Sheets API
export const appendSingleOpportunityToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  opportunity: ContentOpportunity
): Promise<{ updatedRows: number; updatedRange: string }> => {
  const row = [
    opportunity.id,
    new Date().toISOString().split('T')[0],
    opportunity.signal,
    opportunity.title,
    opportunity.hook,
    opportunity.script,
    opportunity.veo_prompt,
    opportunity.imagen_prompt,
    Array.isArray(opportunity.platforms) ? opportunity.platforms.join(', ') : String(opportunity.platforms || ''),
    opportunity.status,
    `${opportunity.predictedRetention}%`,
    `${opportunity.viralityScore}/100`,
  ];

  const targetRange = encodeURIComponent(`'${sheetName}'!A:L`);
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append opportunity to sheet: ${res.status} ${errorText}`);
  }

  const result = await res.json();
  return {
    updatedRows: result.updates?.updatedRows || 1,
    updatedRange: result.updates?.updatedRange || '',
  };
};

// 6. Ensure Google Merchant Center (GMC) tab exists or write GMC standard headers
export const ensureGMCSheetTab = async (
  accessToken: string,
  spreadsheetId: string,
  gmcSheetName: string = 'GMC Product Feed'
): Promise<void> => {
  // Check if sheet exists
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let sheetExists = false;
  if (metaRes.ok) {
    const meta = await metaRes.json();
    sheetExists = (meta.sheets || []).some(
      (s: any) => s.properties?.title?.toLowerCase() === gmcSheetName.toLowerCase()
    );
  }

  // If not exist, add a new tab
  if (!sheetExists) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: gmcSheetName,
                gridProperties: {
                  frozenRowCount: 1,
                  columnCount: 15,
                },
              },
            },
          },
        ],
      }),
    });
  }

  // Write GMC standard attribute header row if row 1 is empty or new
  const gmcHeaders = [
    [
      'id',
      'title',
      'description',
      'link',
      'image_link',
      'availability',
      'price',
      'google_product_category',
      'brand',
      'gtin',
      'mpn',
      'condition',
      'custom_label_0',
      'custom_label_1',
      'custom_label_2',
    ],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${gmcSheetName}'!A1:O1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: gmcHeaders }),
    }
  );
};

// 7. Append GMC Feed Items to Google Sheet for GMC Fetching
export const appendGMCFeedToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  gmcSheetName: string,
  items: GMCFeedItem[]
): Promise<number> => {
  if (items.length === 0) return 0;

  // Make sure header exists first
  try {
    await ensureGMCSheetTab(accessToken, spreadsheetId, gmcSheetName);
  } catch (err) {
    console.warn('Tab verification notice:', err);
  }

  const rows = items.map((item) => [
    item.id,
    item.title,
    item.description,
    item.link,
    item.image_link,
    item.availability,
    item.price,
    item.google_product_category,
    item.brand,
    item.gtin,
    item.mpn,
    item.condition,
    item.custom_label_0,
    item.custom_label_1,
    item.custom_label_2,
  ]);

  const targetRange = encodeURIComponent(`'${gmcSheetName}'!A:O`);
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append GMC rows to sheet: ${res.status} ${errorText}`);
  }

  return rows.length;
};

// 8. Generate TSV string for direct Google Merchant Center feed file upload
export const exportGMCTSVDelivery = (items: GMCFeedItem[]): string => {
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'availability',
    'price',
    'google_product_category',
    'brand',
    'gtin',
    'mpn',
    'condition',
    'custom_label_0',
    'custom_label_1',
    'custom_label_2',
  ];

  const escapeTSV = (val: string) => {
    if (!val) return '';
    return String(val).replace(/[\t\r\n]/g, ' ');
  };

  const lines = [
    headers.join('\t'),
    ...items.map((item) =>
      [
        escapeTSV(item.id),
        escapeTSV(item.title),
        escapeTSV(item.description),
        escapeTSV(item.link),
        escapeTSV(item.image_link),
        escapeTSV(item.availability),
        escapeTSV(item.price),
        escapeTSV(item.google_product_category),
        escapeTSV(item.brand),
        escapeTSV(item.gtin),
        escapeTSV(item.mpn),
        escapeTSV(item.condition),
        escapeTSV(item.custom_label_0),
        escapeTSV(item.custom_label_1),
        escapeTSV(item.custom_label_2),
      ].join('\t')
    ),
  ];

  return lines.join('\n');
};
