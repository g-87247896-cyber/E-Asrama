import React from 'react';
import { useAsrama } from '../context/AsramaContext';
import { Sun, Moon, ShieldCheck, UserCheck, FileText, LogIn, KeyRound } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrintModal: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenPrintModal, onOpenLoginModal }) => {
  const { userRole, setUserRole, theme, toggleTheme, currentPpa, ppas, setCurrentPpa, authSession } = useAsrama();

  const isPkHem = userRole === 'PK_HEM';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <button 
            onClick={() => setActiveTab(isPkHem ? 'dashboard' : 'kehadiran')} 
            className="text-left font-bold text-slate-900 dark:text-white tracking-tight text-lg sm:text-xl whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-extrabold shadow-sm">
              eA
            </div>
            <span>e-Asrama SMK Banggi</span>
          </button>

          {/* Zone 2: Role-based navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            
            {/* Dashboard PK HEM only visible for PK HEM */}
            {isPkHem && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Dashboard PK HEM
              </button>
            )}

            <button
              onClick={() => setActiveTab('kehadiran')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'kehadiran'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kehadiran PPA
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'laporan'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Laporan Bergambar
            </button>

            <button
              onClick={() => setActiveTab('rollcall')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'rollcall'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Roll Call Asrama
            </button>

            <button
              onClick={() => setActiveTab('aset')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'aset'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isPkHem ? 'Pengurusan Aset' : 'Aset & Kerosakan'}
            </button>

            {/* Eksport Data only visible for PK HEM */}
            {isPkHem && (
              <button
                onClick={() => setActiveTab('eksport')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'eksport'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 py-4 -mb-[17px]'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Eksport Data
              </button>
            )}

          </nav>

          {/* Zone 3: Actions & Role status */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Tukar Tema (Cerah/Gelap)"
              aria-label="Tukar Tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Quick Print Official Report Button (for PK HEM or overall summary) */}
            {isPkHem && (
              <button
                onClick={onOpenPrintModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Cetak Laporan Rasmi PDF"
              >
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Cetak Laporan</span>
              </button>
            )}

            {/* Role Switcher Pill Container */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setUserRole('PK_HEM');
                  setActiveTab('dashboard');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  userRole === 'PK_HEM'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PK HEM</span>
              </button>
              
              <button
                onClick={() => {
                  setUserRole('PPA');
                  setActiveTab('kehadiran');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  userRole === 'PPA'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>PPA / Penyelia</span>
              </button>
            </div>

            {/* PPA Profile Selector when in PPA mode */}
            {userRole === 'PPA' && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="font-medium truncate max-w-[130px]">{currentPpa.name}</span>
                <select
                  value={currentPpa.id}
                  onChange={e => {
                    const found = ppas.find(p => p.id === e.target.value);
                    if (found) setCurrentPpa(found);
                  }}
                  className="bg-transparent text-emerald-900 dark:text-emerald-200 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  {ppas.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {p.name.split(' ')[1] || p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Log Masuk / Log Keluar Trigger Button */}
            {authSession.isAuthenticated ? (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                title="Log Masuk / Pengesahan Pengguna"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{userRole === 'PK_HEM' ? 'Log: PK HEM' : `Log: ${currentPpa.name.split(' ')[1] || 'PPA'}`}</span>
                <span className="sm:hidden">Log</span>
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log Masuk</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
