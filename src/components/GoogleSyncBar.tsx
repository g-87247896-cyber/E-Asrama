import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { 
  requestGoogleAccessToken, createOrGetDriveFolder, createGoogleSheetBackend, 
  syncAllDataToGoogleSheets, GoogleSyncStatus 
} from '../services/googleWorkspace';
import { Database, Folder, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const GoogleSyncBar: React.FC = () => {
  const { attendances, reports, assets, damageReports, rollCalls, userRole } = useAsrama();

  // Hide Google Workspace sync bar completely for PPA supervisors to keep interface clean
  if (userRole === 'PPA') return null;

  const [syncStatus, setSyncStatus] = useState<GoogleSyncStatus>(() => {
    const saved = localStorage.getItem('e_asrama_google_sync_v1');
    return saved ? JSON.parse(saved) : { isConnected: false };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeAccessToken, setActiveAccessToken] = useState<string | null>(null);

  const handleConnectGoogle = async () => {
    setIsSyncing(true);
    try {
      await requestGoogleAccessToken(async (token, email) => {
        setActiveAccessToken(token);

        // 1. Create or get Google Drive Folder
        const driveFolder = await createOrGetDriveFolder(token);

        // 2. Create or get Google Sheet
        const sheetBackend = await createGoogleSheetBackend(token);

        // 3. Perform initial data sync
        await syncAllDataToGoogleSheets(token, sheetBackend.spreadsheetId, {
          attendances,
          reports,
          assets,
          damageReports,
          rollCalls,
        });

        const newStatus: GoogleSyncStatus = {
          isConnected: true,
          userEmail: email || 'Akaun Google KPM',
          spreadsheetId: sheetBackend.spreadsheetId,
          spreadsheetUrl: sheetBackend.spreadsheetUrl,
          driveFolderId: driveFolder.id,
          driveFolderUrl: driveFolder.webViewLink,
          lastSyncTime: new Date().toLocaleTimeString('ms-MY'),
        };

        setSyncStatus(newStatus);
        localStorage.setItem('e_asrama_google_sync_v1', JSON.stringify(newStatus));
      });
    } catch (err) {
      console.error('Failed to connect Google Workspace:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSyncClick = () => {
    if (!syncStatus.isConnected) {
      handleConnectGoogle();
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmSyncExecution = async () => {
    setShowConfirmModal(false);
    setIsSyncing(true);
    try {
      if (activeAccessToken && syncStatus.spreadsheetId) {
        await syncAllDataToGoogleSheets(activeAccessToken, syncStatus.spreadsheetId, {
          attendances,
          reports,
          assets,
          damageReports,
          rollCalls,
        });

        const updated: GoogleSyncStatus = {
          ...syncStatus,
          lastSyncTime: new Date().toLocaleTimeString('ms-MY'),
        };
        setSyncStatus(updated);
        localStorage.setItem('e_asrama_google_sync_v1', JSON.stringify(updated));
      } else {
        await handleConnectGoogle();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Integrasi Google Sheets & Google Drive Backend
              </h3>
              {syncStatus.isConnected ? (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Terhubung
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Belum Diaktifkan
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {syncStatus.isConnected
                ? `Pangkalan data dikemas kini ke Google Sheet (${syncStatus.userEmail}) · Penyelarasan terakhir: ${syncStatus.lastSyncTime || 'Terkini'}`
                : 'Simpan rekod kehadiran PPA, laporan bergambar & inventori terus ke Google Sheets dan Google Drive anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncStatus.isConnected && syncStatus.spreadsheetUrl && (
            <a
              href={syncStatus.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Buka Google Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {syncStatus.isConnected && syncStatus.driveFolderUrl && (
            <a
              href={syncStatus.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Folder Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={handleManualSyncClick}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Penyelarasan...' : syncStatus.isConnected ? 'Kemaskini Google Sheets' : 'Sambung Google Drive/Sheets'}</span>
          </button>
        </div>

      </div>

      {/* Confirmation Modal for Google Sheets Sync */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>Pengesahan Penyelarasan Google Sheets</span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Adakah anda pasti mahu mengemaskini pangkalan data Google Sheets anda dengan rekod terkini daripada aplikasi e-Asrama SMK Banggi? Operasi ini akan menulis {reports.length} laporan, {attendances.length} log kehadiran & {assets.length} rekod aset ke spreadsheet anda.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={confirmSyncExecution}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Teruskan Penyelarasan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
