/**
 * Google Workspace Service (Google Sheets & Google Drive Integration)
 * e-Asrama SMK Banggi
 */

const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const GOOGLE_DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3/files';

export interface GoogleSyncStatus {
  isConnected: boolean;
  userEmail?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  lastSyncTime?: string;
}

let cachedAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCachedAccessToken = () => cachedAccessToken;

/**
 * Initialize Google OAuth 2.0 Token Client via Google Identity Services SDK
 */
export const requestGoogleAccessToken = (callback: (accessToken: string, email?: string) => void) => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!(window as any).google?.accounts?.oauth2) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          initTokenClient(callback, resolve, reject);
        };
        script.onerror = () => reject(new Error('Gagal memuatkan SDK Google Identity Services.'));
        document.body.appendChild(script);
      } else {
        initTokenClient(callback, resolve, reject);
      }
    } catch (err) {
      reject(err);
    }
  });
};

const initTokenClient = (
  callback: (token: string, email?: string) => void,
  resolve: () => void,
  reject: (err: any) => void
) => {
  const client = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: '7bca843b-d2b9-469b-98a7-d5c4d8a1ccec.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
    callback: (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      if (response.access_token) {
        setCachedAccessToken(response.access_token);
        
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        })
          .then(res => res.json())
          .then(userInfo => {
            callback(response.access_token, userInfo.email);
            resolve();
          })
          .catch(() => {
            callback(response.access_token);
            resolve();
          });
      }
    },
  });

  client.requestAccessToken({ prompt: 'consent' });
};

/**
 * Create or locate Google Drive Folder for SMK Banggi Hostel Reports
 */
export const createOrGetDriveFolder = async (accessToken: string): Promise<{ id: string; webViewLink: string }> => {
  const folderName = 'e-Asrama SMK Banggi - Lampiran Gambar';
  
  const searchUrl = `${GOOGLE_DRIVE_API_BASE}/files?q=name='${encodeURIComponent(folderName)}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,webViewLink)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  const createRes = await fetch(`${GOOGLE_DRIVE_API_BASE}/files?fields=id,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  return await createRes.json();
};

/**
 * Upload Photo File / Base64 to Google Drive
 */
export const uploadPhotoToGoogleDrive = async (
  accessToken: string,
  folderId: string,
  fileName: string,
  base64Data: string
): Promise<{ id: string; webViewLink: string }> => {
  try {
    const fetchRes = await fetch(base64Data);
    const blob = await fetchRes.blob();

    const metadata = {
      name: `${fileName}_${Date.now()}.jpg`,
      parents: [folderId],
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    const uploadRes = await fetch(`${GOOGLE_DRIVE_UPLOAD_BASE}?uploadType=multipart&fields=id,webViewLink`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    return await uploadRes.json();
  } catch {
    return { id: 'drive-fallback', webViewLink: '#' };
  }
};

/**
 * Create Google Sheet Spreadsheet for SMK Banggi
 */
export const createGoogleSheetBackend = async (accessToken: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const title = `e-Asrama SMK Banggi - Pangkalan Data (${new Date().getFullYear()})`;

  const res = await fetch(GOOGLE_SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Kehadiran_PPA' } },
        { properties: { title: 'Laporan_Bergambar' } },
        { properties: { title: 'Inventori_Aset' } },
        { properties: { title: 'Laporan_Kerosakan' } },
        { properties: { title: 'Roll_Call_Murid' } },
      ],
    }),
  });

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl;

  await populateSheetHeaders(accessToken, spreadsheetId);

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Populate Sheet Headers
 */
export const populateSheetHeaders = async (accessToken: string, spreadsheetId: string) => {
  const valueRanges = [
    {
      range: 'Kehadiran_PPA!A1:H1',
      values: [['ID Rekod', 'Nama Penyelia', 'Tarikh', 'Syif', 'Masa Masuk', 'Lokasi Stesen', 'Catatan Tugas', 'Pengesahan PK HEM']],
    },
    {
      range: 'Laporan_Bergambar!A1:J1',
      values: [['ID Laporan', 'Penyelia', 'Tarikh', 'Masa', 'Kategori', 'Tajuk', 'Status', 'Skor', 'Keutamaan', 'Ulasan PK HEM']],
    },
    {
      range: 'Inventori_Aset!A1:H1',
      values: [['Kod Aset', 'Nama Aset', 'Kategori', 'Blok Asrama', 'Lokasi', 'Keadaan', 'Kuantiti', 'Tarikh Semakan']],
    },
    {
      range: 'Laporan_Kerosakan!A1:I1',
      values: [['ID Kerosakan', 'Kod Aset', 'Nama Aset', 'Kategori', 'Deskripsi Kerosakan', 'Pelapor', 'Tarikh', 'Keutamaan', 'Status']],
    },
    {
      range: 'Roll_Call_Murid!A1:J1',
      values: [['ID Roll Call', 'Tarikh', 'Waktu', 'Blok', 'Enrolmen', 'Hadir', 'Sickbay', 'Outing', 'Ponteng', 'Penyelia']],
    },
  ];

  await fetch(`${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    }),
  });
};

/**
 * Append Full Sync Data to Google Sheets
 */
export const syncAllDataToGoogleSheets = async (
  accessToken: string,
  spreadsheetId: string,
  data: {
    attendances: any[];
    reports: any[];
    assets: any[];
    damageReports: any[];
    rollCalls: any[];
  }
) => {
  const valueRanges = [
    {
      range: 'Kehadiran_PPA!A2:H',
      values: data.attendances.map(a => [
        a.id, a.ppaName, a.date, a.shift, a.checkInTime, a.locationName, a.notes, a.verifiedByPkHem ? 'Ya' : 'Belum'
      ]),
    },
    {
      range: 'Laporan_Bergambar!A2:J',
      values: data.reports.map(r => [
        r.id, r.ppaName, r.date, r.timestamp, r.category, r.title, r.status, r.ratingScore || '-', r.priority, r.pkHemComments || '-'
      ]),
    },
    {
      range: 'Inventori_Aset!A2:H',
      values: data.assets.map(ast => [
        ast.assetCode, ast.name, ast.category, ast.dormBlock || 'Umum', ast.locationDetails, ast.condition, ast.quantity, ast.lastInspectedDate
      ]),
    },
    {
      range: 'Laporan_Kerosakan!A2:I',
      values: data.damageReports.map(d => [
        d.id, d.assetCode, d.assetName, d.category, d.description, d.reportedByPpa, d.reportDate, d.priority, d.status
      ]),
    },
    {
      range: 'Roll_Call_Murid!A2:J',
      values: data.rollCalls.map(rc => [
        rc.id, rc.date, rc.shift, rc.block, rc.totalEnrolled, rc.presentCount, rc.sickbayCount, rc.outingCount, rc.absentUnexplained, rc.reportedByPpa
      ]),
    },
  ];

  await fetch(`${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    }),
  });
};
