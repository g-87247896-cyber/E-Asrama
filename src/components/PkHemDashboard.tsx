import React from 'react';
import { useAsrama } from '../context/AsramaContext';
import { ShieldCheck, Sparkles, CheckCircle2, Clock, AlertTriangle, FileText, TrendingUp, Users, Camera, Package, Wrench } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

interface PkHemDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenPrintModal: () => void;
}

export const PkHemDashboard: React.FC<PkHemDashboardProps> = ({ setActiveTab, onOpenPrintModal }) => {
  const { reports, attendances, rollCalls, assets, damageReports, executiveSummary, generateExecutiveSummary, isAiLoading, ppas } = useAsrama();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingReports = reports.filter(r => r.status === 'Dalam Semakan');
  const urgentReports = reports.filter(r => r.priority === 'Segera');
  const approvedReports = reports.filter(r => r.status === 'Disahkan PK HEM');

  const activePpaCount = attendances.filter(a => a.date === todayStr).length;

  // Recharts Data 1: Pie chart for photo report categories
  const categoryCounts: Record<string, number> = {};
  reports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name: name.split('&')[0].trim(), value }));
  const COLORS = ['#2563eb', '#059669', '#d97706', '#9333ea', '#dc2626', '#0891b2'];

  // Recharts Data 2: Bar chart for roll call per block
  const barData = rollCalls.map(rc => ({
    block: rc.block.split('-')[0].trim(),
    present: rc.presentCount,
    sick: rc.sickbayCount,
    outing: rc.outingCount,
  }));

  // Recharts Data 3: Asset Status Overview (Baik / Selenggara / Rosak)
  const baikCount = assets.filter(a => a.condition === 'Baik').length;
  const selenggaraCount = assets.filter(a => a.condition === 'Perlu Penyelenggaraan').length;
  const rosakCount = assets.filter(a => a.condition === 'Rosak').length;

  const assetStatusData = [
    { name: 'Baik', count: baikCount, fill: '#059669' },
    { name: 'Selenggara', count: selenggaraCount, fill: '#d97706' },
    { name: 'Rosak', count: rosakCount, fill: '#dc2626' },
  ];

  // Recharts Data 4: Damage Reports Count by Category
  const damageCategoryCounts: Record<string, number> = {};
  damageReports.forEach(d => {
    const catShort = d.category.split('&')[0].trim();
    damageCategoryCounts[catShort] = (damageCategoryCounts[catShort] || 0) + 1;
  });

  // Ensure default categories exist for visual complete look
  ['Perabot', 'Elektrik', 'Sanitari', 'Dapur', 'Bomba'].forEach(c => {
    if (damageCategoryCounts[c] === undefined) {
      damageCategoryCounts[c] = 0;
    }
  });

  const damageCategoryData = Object.entries(damageCategoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="space-y-6">
      
      {/* Banner Title Section */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal Pengurusan PK HEM · SMK Banggi, Sabah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sistem Kawalan, Aset & Laporan Pembantu Penyelia Asrama
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selamat datang, PK HEM. Pantau kehadiran PPA, status aset & kerosakan fasiliti, serta sahkan laporan bergambar berasaskan AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => generateExecutiveSummary(todayStr)}
              disabled={isAiLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAiLoading ? 'Menjana Rumusan...' : 'Jana Rumusan Eksekutif AI'}</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Eksport / Cetak PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>PPA Bertugas Hari Ini</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
            {activePpaCount} <span className="text-xs font-normal text-slate-400">/ {ppas.length} PPA</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Shift Pagi, Petang & Malam</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Perlu Pengesahan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {pendingReports.length} <span className="text-xs font-normal text-slate-400">laporan</span>
          </div>
          <button
            onClick={() => setActiveTab('laporan')}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-1 block font-medium"
          >
            Semak laporan pending →
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Inventori Aset</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
            {assets.length} <span className="text-xs font-normal text-slate-400">jenis</span>
          </div>
          <button
            onClick={() => setActiveTab('aset')}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline mt-1 block font-medium"
          >
            Pantau aset & kerosakan →
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Kerosakan Aset Aktif</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400 mt-2">
            {damageReports.length} <span className="text-xs font-normal text-slate-400">laporan</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Termasuk isu elektrik & paip
          </div>
        </div>

      </div>

      {/* NEW RECHARTS VISUALIZATION: ASSET STATUS & DAMAGE BY CATEGORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Chart 1: Overview of Current Asset Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Status Semasa Aset Asrama (Recharts Overview)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pecahan keadaan fizikal aset: Baik vs Perlu Selenggara vs Rosak
              </p>
            </div>
            <button
              onClick={() => setActiveTab('aset')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Pengurusan Aset →
            </button>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetStatusData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Bilangan Aset" radius={[0, 6, 6, 0]}>
                  {assetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Baik: </span>
              <strong className="font-mono">{baikCount}</strong>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
              <span className="text-amber-800 dark:text-amber-300 font-semibold">Selenggara: </span>
              <strong className="font-mono">{selenggaraCount}</strong>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-xl">
              <span className="text-red-800 dark:text-red-300 font-semibold">Rosak: </span>
              <strong className="font-mono">{rosakCount}</strong>
            </div>
          </div>
        </div>

        {/* Visual Chart 2: Damage Reports Count by Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-500" />
                <span>Laporan Kerosakan Aset Mengikut Kategori</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilangan kes kerosakan terkumpul berasaskan kategori peralatan
              </p>
            </div>
            <button
              onClick={() => setActiveTab('aset')}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              Log Kerosakan →
            </button>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damageCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Bilangan Laporan Kerosakan" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            Pemantauan kerosakan membantu perancangan peruntukan baikpulih PK HEM & PPD
          </div>
        </div>

      </div>

      {/* AI Executive Summary Card */}
      {executiveSummary && (
        <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200/60 dark:border-purple-800">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Rumusan Eksekutif Harian PK HEM (Penjana AI Gemini)</span>
            </div>
            <span className="text-xs font-mono text-purple-700 dark:text-purple-300">
              Dijana jam {executiveSummary.generatedAt}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-100 leading-relaxed font-medium">
            "{executiveSummary.summaryText}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-purple-100 dark:border-purple-900 space-y-2">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Highlight Pencapaian Operasi
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {executiveSummary.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-purple-100 dark:border-purple-900 space-y-2">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Cadangan Tindakan Susulan PK HEM
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {executiveSummary.actionItems.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Roll Call Attendance & Photo Category Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roll Call Attendance Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Analisis Roll Call Kehadiran Murid Mengikut Blok
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilangan murid hadir di dorm vs sickbay & outing
              </p>
            </div>
            <button
              onClick={() => setActiveTab('rollcall')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat Detail
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="block" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="present" name="Hadir" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sick" name="Sickbay" fill="#9333ea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outing" name="Outing" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pecahan Kategori Laporan Bergambar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agihan bidang pemantauan harian PPA
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <strong className="font-mono">{item.value} laporan</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Pending Reports Verification Action Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Senarai Laporan Bergambar Menunggu Pengesahan PK HEM</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laporan yang dihantar oleh PPA dan memerlukan semakan rasmi
            </p>
          </div>

          <button
            onClick={() => setActiveTab('laporan')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Buka Semua Laporan ({reports.length})
          </button>
        </div>

        {pendingReports.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            Tiada laporan pending. Semua laporan harian telah disahkan oleh PK HEM!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map(rep => (
              <div
                key={rep.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3"
              >
                <img
                  src={rep.photoUrl}
                  alt={rep.title}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {rep.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{rep.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{rep.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{rep.description}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('laporan')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg transition-colors"
                    >
                      Semak & Sahkan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
