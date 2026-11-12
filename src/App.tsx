import React, { useState, useEffect } from 'react';
import { AsramaProvider, useAsrama } from './context/AsramaContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { GoogleSyncBar } from './components/GoogleSyncBar';
import { PkHemDashboard } from './components/PkHemDashboard';
import { AttendanceSystem } from './components/AttendanceSystem';
import { PhotoReportModule } from './components/PhotoReportModule';
import { RollCallModule } from './components/RollCallModule';
import { AssetManagementModule } from './components/AssetManagementModule';
import { DataExportModule } from './components/DataExportModule';
import { OfficialReportPrint } from './components/OfficialReportPrint';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';

const MainAppContent: React.FC = () => {
  const { userRole, authSession } = useAsrama();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Auto-redirect PPA from admin-only tabs
  useEffect(() => {
    if (userRole === 'PPA' && (activeTab === 'dashboard' || activeTab === 'eksport')) {
      setActiveTab('kehadiran');
    }
  }, [userRole, activeTab]);

  // Standalone Full-Screen Login Page when not authenticated
  if (!authSession.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
        
        {/* Google Workspace Backend Live Sync Status Bar (Admin PK HEM Only) */}
        <GoogleSyncBar />

        {activeTab === 'dashboard' && userRole === 'PK_HEM' && (
          <PkHemDashboard
            setActiveTab={setActiveTab}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'kehadiran' && (
          <AttendanceSystem />
        )}

        {activeTab === 'laporan' && (
          <PhotoReportModule />
        )}

        {activeTab === 'rollcall' && (
          <RollCallModule />
        )}

        {activeTab === 'aset' && (
          <AssetManagementModule />
        )}

        {activeTab === 'eksport' && userRole === 'PK_HEM' && (
          <DataExportModule
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {/* Official Printable Report Modal */}
      <OfficialReportPrint
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Authentication / Login Portal Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AsramaProvider>
      <MainAppContent />
    </AsramaProvider>
  );
}
