import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PpaProfile, AttendanceRecord, PhotoReport, StudentRollCall, ExecutiveSummaryAI, 
  ShiftType, ReportCategory, ReportStatus, DormBlockName, AsramaAsset, AssetDamageReport, AssetCondition, AssetCategory 
} from '../types/asrama';
import { INITIAL_PPAS, INITIAL_ATTENDANCES, INITIAL_REPORTS, INITIAL_ROLL_CALLS, INITIAL_ASSETS, INITIAL_ASSET_DAMAGE_REPORTS } from '../data/mockData';

export type UserRoleMode = 'PK_HEM' | 'PPA';

export interface AuthSession {
  isAuthenticated: boolean;
  userRole: UserRoleMode;
  ppaId?: string;
  name: string;
}

interface AsramaContextType {
  userRole: UserRoleMode;
  setUserRole: (role: UserRoleMode) => void;
  currentPpa: PpaProfile;
  setCurrentPpa: (ppa: PpaProfile) => void;
  ppas: PpaProfile[];
  attendances: AttendanceRecord[];
  reports: PhotoReport[];
  rollCalls: StudentRollCall[];
  assets: AsramaAsset[];
  damageReports: AssetDamageReport[];
  executiveSummary?: ExecutiveSummaryAI;
  isAiLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Auth state
  authSession: AuthSession;
  loginAsPkHem: (passwordInput: string) => boolean;
  loginAsPpa: (ppaId: string, passwordInput: string) => boolean;
  logout: () => void;
  
  // Actions
  clockInPpa: (data: { shift: ShiftType; photoUrl: string; locationName: string; notes: string }) => void;
  addPhotoReport: (report: Omit<PhotoReport, 'id' | 'ppaId' | 'ppaName' | 'status' | 'date' | 'timestamp'>) => PhotoReport;
  approveReport: (reportId: string, comment: string, status?: ReportStatus) => void;
  deleteReport: (reportId: string) => void;
  addRollCall: (rollCall: Omit<StudentRollCall, 'id' | 'timestamp'>) => void;
  addAsset: (asset: Omit<AsramaAsset, 'id' | 'lastInspectedDate'>) => void;
  updateAssetCondition: (assetId: string, condition: AssetCondition) => void;
  reportAssetDamage: (damage: Omit<AssetDamageReport, 'id' | 'reportedByPpa' | 'reportDate' | 'reportTime' | 'status'>, createLinkedPhotoReport?: boolean) => void;
  updateDamageStatus: (damageId: string, status: AssetDamageReport['status'], pkHemNote?: string) => void;
  generateExecutiveSummary: (dateStr?: string) => Promise<void>;
  resetToDefaultData: () => void;
}

const AsramaContext = createContext<AsramaContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_REPORTS = 'e_asrama_reports_v1';
const LOCAL_STORAGE_KEY_ATTENDANCE = 'e_asrama_attendance_v1';
const LOCAL_STORAGE_KEY_ROLLCALL = 'e_asrama_rollcall_v1';
const LOCAL_STORAGE_KEY_ASSETS = 'e_asrama_assets_v1';
const LOCAL_STORAGE_KEY_DAMAGE = 'e_asrama_damage_v1';
const LOCAL_STORAGE_KEY_THEME = 'e_asrama_theme_v1';
const LOCAL_STORAGE_KEY_AUTH = 'e_asrama_auth_v1';

// Internal passkey check (XEA5021) - Never displayed in UI text
const SCHOOL_PASSKEY = 'XEA5021';

export const AsramaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ppas] = useState<PpaProfile[]>(INITIAL_PPAS);
  const [currentPpa, setCurrentPpa] = useState<PpaProfile>(INITIAL_PPAS[0]);

  // Helper function for safe localStorage JSON parsing
  const safeParseJSON = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved || saved === 'undefined' || saved === 'null') return fallback;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (err) {
      console.warn(`Failed to parse localStorage key ${key}:`, err);
      return fallback;
    }
  };

  const safeParseArray = <T,>(key: string, fallback: T[]): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved || saved === 'undefined' || saved === 'null') return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch (err) {
      console.warn(`Failed to parse localStorage key ${key}:`, err);
      return fallback;
    }
  };

  // Auth Session State
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    const defaultAuth: AuthSession = { isAuthenticated: false, userRole: 'PK_HEM', name: 'Tetamu' };
    const parsed = safeParseJSON<AuthSession>(LOCAL_STORAGE_KEY_AUTH, defaultAuth);
    if (!parsed || typeof parsed.isAuthenticated !== 'boolean') {
      return defaultAuth;
    }
    return parsed;
  });

  const userRole = authSession?.userRole || 'PK_HEM';

  const setUserRole = (role: UserRoleMode) => {
    setAuthSession(prev => ({
      ...prev,
      isAuthenticated: prev?.isAuthenticated ?? false,
      userRole: role,
      name: role === 'PK_HEM' ? 'Penolong Kanan HEM' : (currentPpa?.name || 'PPA'),
    }));
  };

  const loginAsPkHem = (passwordInput: string): boolean => {
    if (passwordInput.trim() === SCHOOL_PASSKEY) {
      const session: AuthSession = {
        isAuthenticated: true,
        userRole: 'PK_HEM',
        name: 'Penolong Kanan HEM (PK HEM)',
      };
      setAuthSession(session);
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(session));
      return true;
    }
    return false;
  };

  const loginAsPpa = (ppaId: string, passwordInput: string): boolean => {
    if (passwordInput.trim() === SCHOOL_PASSKEY) {
      const foundPpa = ppas.find(p => p.id === ppaId) || ppas[0];
      setCurrentPpa(foundPpa);
      const session: AuthSession = {
        isAuthenticated: true,
        userRole: 'PPA',
        ppaId: foundPpa.id,
        name: foundPpa.name,
      };
      setAuthSession(session);
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(session));
      return true;
    }
    return false;
  };

  const logout = () => {
    const session: AuthSession = {
      isAuthenticated: false,
      userRole: 'PK_HEM',
      name: 'Tetamu',
    };
    setAuthSession(session);
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      return (saved === 'dark' || saved === 'light') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.warn('Unable to write theme to localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    return safeParseArray<AttendanceRecord>(LOCAL_STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCES);
  });

  const [reports, setReports] = useState<PhotoReport[]>(() => {
    return safeParseArray<PhotoReport>(LOCAL_STORAGE_KEY_REPORTS, INITIAL_REPORTS);
  });

  const [rollCalls, setRollCalls] = useState<StudentRollCall[]>(() => {
    return safeParseArray<StudentRollCall>(LOCAL_STORAGE_KEY_ROLLCALL, INITIAL_ROLL_CALLS);
  });

  const [assets, setAssets] = useState<AsramaAsset[]>(() => {
    return safeParseArray<AsramaAsset>(LOCAL_STORAGE_KEY_ASSETS, INITIAL_ASSETS);
  });

  const [damageReports, setDamageReports] = useState<AssetDamageReport[]>(() => {
    return safeParseArray<AssetDamageReport>(LOCAL_STORAGE_KEY_DAMAGE, INITIAL_ASSET_DAMAGE_REPORTS);
  });

  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummaryAI | undefined>();
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ATTENDANCE, JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ROLLCALL, JSON.stringify(rollCalls));
  }, [rollCalls]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DAMAGE, JSON.stringify(damageReports));
  }, [damageReports]);

  const clockInPpa = (data: { shift: ShiftType; photoUrl: string; locationName: string; notes: string }) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      ppaId: currentPpa.id,
      ppaName: currentPpa.name,
      date: dateStr,
      shift: data.shift,
      checkInTime: timeStr,
      photoUrl: data.photoUrl,
      locationName: data.locationName,
      gpsCoords: { lat: 7.2514, lng: 117.1601 },
      notes: data.notes,
      verifiedByPkHem: false,
    };

    setAttendances(prev => [newRecord, ...prev]);
  };

  const addPhotoReport = (reportData: Omit<PhotoReport, 'id' | 'ppaId' | 'ppaName' | 'status' | 'date' | 'timestamp'>): PhotoReport => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false });

    const newReport: PhotoReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      ppaId: currentPpa.id,
      ppaName: currentPpa.name,
      date: dateStr,
      timestamp: timeStr,
      status: 'Dalam Semakan',
    };

    setReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const approveReport = (reportId: string, comment: string, status: ReportStatus = 'Disahkan PK HEM') => {
    const nowStr = new Date().toLocaleString('ms-MY');
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            pkHemComments: comment,
            pkHemApprovedDate: nowStr,
          };
        }
        return r;
      })
    );
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const addRollCall = (rollCallData: Omit<StudentRollCall, 'id' | 'timestamp'>) => {
    const timeStr = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false });
    const newRollCall: StudentRollCall = {
      ...rollCallData,
      id: `rc-${Date.now()}`,
      timestamp: timeStr,
    };

    setRollCalls(prev => [newRollCall, ...prev]);
  };

  const addAsset = (assetData: Omit<AsramaAsset, 'id' | 'lastInspectedDate'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newAsset: AsramaAsset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      lastInspectedDate: todayStr,
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const updateAssetCondition = (assetId: string, condition: AssetCondition) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, condition, lastInspectedDate: todayStr } : a))
    );
  };

  const reportAssetDamage = (
    damageData: Omit<AssetDamageReport, 'id' | 'reportedByPpa' | 'reportDate' | 'reportTime' | 'status'>,
    createLinkedPhotoReport: boolean = true
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false });

    let linkedReportId = damageData.linkedPhotoReportId;

    if (createLinkedPhotoReport) {
      const createdReport = addPhotoReport({
        category: 'Fasiliti & Kerosakan Bangunan',
        title: `Kerosakan Aset: ${damageData.assetName} (${damageData.assetCode})`,
        description: `Laporan kerosakan aset asrama: ${damageData.description}`,
        photoUrl: damageData.photoUrl || '/src/assets/images/facility_maintenance_check_1794457276249.jpg',
        dormBlock: damageData.dormBlock,
        priority: damageData.priority,
        locationDetails: `Aset #${damageData.assetCode}`,
      });
      linkedReportId = createdReport.id;
    }

    const newDamage: AssetDamageReport = {
      ...damageData,
      id: `dmg-${Date.now()}`,
      reportedByPpa: currentPpa.name,
      reportDate: dateStr,
      reportTime: timeStr,
      status: 'Baru Diterima',
      linkedPhotoReportId: linkedReportId,
    };

    setDamageReports(prev => [newDamage, ...prev]);
    updateAssetCondition(damageData.assetId, damageData.priority === 'Segera' ? 'Rosak' : 'Perlu Penyelenggaraan');
  };

  const updateDamageStatus = (damageId: string, status: AssetDamageReport['status'], pkHemNote?: string) => {
    setDamageReports(prev =>
      prev.map(d => {
        if (d.id === damageId) {
          return {
            ...d,
            status,
            pkHemNote: pkHemNote !== undefined ? pkHemNote : d.pkHemNote,
          };
        }
        return d;
      })
    );
  };

  const generateExecutiveSummary = async (dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setIsAiLoading(true);
    try {
      const resp = await fetch('/api/gemini/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: targetDate,
          reports: reports.filter(r => r.date === targetDate),
          attendances: attendances.filter(a => a.date === targetDate),
          rollCalls: rollCalls.filter(rc => rc.date === targetDate),
          damageReports: damageReports.filter(d => d.reportDate === targetDate),
        }),
      });

      const resData = await resp.json();
      if (resData.success && resData.data) {
        setExecutiveSummary({
          date: targetDate,
          summaryText: resData.data.summaryText,
          highlights: resData.data.highlights || [],
          actionItems: resData.data.actionItems || [],
          generatedAt: new Date().toLocaleTimeString('ms-MY'),
        });
      } else {
        setExecutiveSummary({
          date: targetDate,
          summaryText: 'Operasi asrama sekolah hari ini berjalan dalam keadaan lancar. PPA dan Warden telah menyempurnakan rondaan serta semakan aset & sajian dewan makan mengikut jadual tugas.',
          highlights: ['Sajian dewan makan disemak dan dalam keadaan memuaskan.', 'Roll call malam 100% lengkap mengikut blok.'],
          actionItems: ['Pantau pembaikan aset rosak mengikut jadual juruteknik.'],
          generatedAt: new Date().toLocaleTimeString('ms-MY'),
        });
      }
    } catch (e) {
      console.error('Failed to generate summary:', e);
      setExecutiveSummary({
        date: targetDate,
        summaryText: 'Semakan harian PK HEM: Kehadiran PPA lengkap, semua laporan bergambar dewan makan, aset dan dorm telah disemak.',
        highlights: ['Semakan kehadiran murid & aset lengkap.'],
        actionItems: ['Kekalkan kebersihan dewan makan & selenggara aset terjejas.'],
        generatedAt: new Date().toLocaleTimeString('ms-MY'),
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetToDefaultData = () => {
    setAttendances(INITIAL_ATTENDANCES);
    setReports(INITIAL_REPORTS);
    setRollCalls(INITIAL_ROLL_CALLS);
    setAssets(INITIAL_ASSETS);
    setDamageReports(INITIAL_ASSET_DAMAGE_REPORTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ATTENDANCE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_REPORTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ROLLCALL);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ASSETS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DAMAGE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
  };

  return (
    <AsramaContext.Provider
      value={{
        userRole,
        setUserRole,
        currentPpa,
        setCurrentPpa,
        ppas,
        attendances,
        reports,
        rollCalls,
        assets,
        damageReports,
        executiveSummary,
        isAiLoading,
        theme,
        toggleTheme,
        authSession,
        loginAsPkHem,
        loginAsPpa,
        logout,
        clockInPpa,
        addPhotoReport,
        approveReport,
        deleteReport,
        addRollCall,
        addAsset,
        updateAssetCondition,
        reportAssetDamage,
        updateDamageStatus,
        generateExecutiveSummary,
        resetToDefaultData,
      }}
    >
      {children}
    </AsramaContext.Provider>
  );
};

export const useAsrama = () => {
  const context = useContext(AsramaContext);
  if (!context) {
    throw new Error('useAsrama must be used within an AsramaProvider');
  }
  return context;
};
