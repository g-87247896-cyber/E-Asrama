import React from 'react';
import { useAsrama } from '../context/AsramaContext';
import { LayoutDashboard, Clock, Camera, Package, Download, Users } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrintModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onOpenPrintModal }) => {
  const { userRole } = useAsrama();
  const isPkHem = userRole === 'PK_HEM';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden no-print">
      <div className={`grid ${isPkHem ? 'grid-cols-5' : 'grid-cols-4'} items-center h-16 px-1`}>
        
        {/* Dashboard PK HEM only for PK HEM */}
        {isPkHem && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Dashboard</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('kehadiran')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'kehadiran'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Kehadiran</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'laporan'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">Laporan</span>
        </button>

        <button
          onClick={() => setActiveTab('rollcall')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'rollcall'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Roll Call</span>
        </button>

        {isPkHem ? (
          <button
            onClick={() => setActiveTab('eksport')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'eksport'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Eksport</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('aset')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'aset'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Aset</span>
          </button>
        )}

      </div>
    </div>
  );
};
