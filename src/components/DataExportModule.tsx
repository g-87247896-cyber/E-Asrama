import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { Download, FileSpreadsheet, FileText, Calendar, Filter, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface DataExportModuleProps {
  onOpenPrintModal: () => void;
}

export const DataExportModule: React.FC<DataExportModuleProps> = ({ onOpenPrintModal }) => {
  const { attendances, reports, rollCalls, assets, damageReports } = useAsrama();

  // Date Range State
  const [rangePreset, setRangePreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Selected Modules to Export
  const [exportAttendance, setExportAttendance] = useState(true);
  const [exportReports, setExportReports] = useState(true);
  const [exportAssets, setExportAssets] = useState(true);
  const [exportRollCall, setExportRollCall] = useState(true);

  // Preset Handler
  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setRangePreset(preset);
    const todayStr = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  // Helper to filter data by date range
  const filterByDate = <T extends { date?: string; reportDate?: string }>(list: T[]): T[] => {
    return list.filter(item => {
      const itemDate = item.date || item.reportDate;
      if (!itemDate) return true;
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // CSV Generator Utility
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // 1. Export Attendance CSV
    if (exportAttendance) {
      const filteredAtt = filterByDate(attendances);
      const attHeaders = ['ID', 'Penyelia', 'Tarikh', 'Syif', 'Masa Masuk', 'Lokasi Stesen', 'Catatan', 'Pengesahan PK HEM'];
      const attRows = filteredAtt.map(a => [
        a.id,
        a.ppaName,
        a.date,
        a.shift,
        a.checkInTime,
        a.locationName,
        a.notes,
        a.verifiedByPkHem ? 'Ya' : 'Belum',
      ]);
      downloadCSV(`Kehadiran_PPA_${startDate}_ke_${endDate}.csv`, attHeaders, attRows);
    }

    // 2. Export Photo Reports CSV
    if (exportReports) {
      const filteredRep = filterByDate(reports);
      const repHeaders = ['ID Laporan', 'Penyelia', 'Tarikh', 'Masa', 'Kategori', 'Tajuk', 'Status', 'Skor Kebersihan', 'Keutamaan', 'Ulasan PK HEM'];
      const repRows = filteredRep.map(r => [
        r.id,
        r.ppaName,
        r.date,
        r.timestamp,
        r.category,
        r.title,
        r.status,
        r.ratingScore || '-',
        r.priority,
        r.pkHemComments || '-',
      ]);
      downloadCSV(`Laporan_Bergambar_${startDate}_ke_${endDate}.csv`, repHeaders, repRows);
    }

    // 3. Export Assets CSV
    if (exportAssets) {
      const astHeaders = ['Kod Aset', 'Nama Aset', 'Kategori', 'Blok Asrama', 'Lokasi', 'Keadaan', 'Kuantiti', 'Tarikh Semakan'];
      const astRows = assets.map(a => [
        a.assetCode,
        a.name,
        a.category,
        a.dormBlock || 'Umum',
        a.locationDetails,
        a.condition,
        a.quantity,
        a.lastInspectedDate,
      ]);
      downloadCSV(`Inventori_Aset_Asrama_${startDate}.csv`, astHeaders, astRows);
    }

    // 4. Export Roll Call CSV
    if (exportRollCall) {
      const filteredRC = filterByDate(rollCalls);
      const rcHeaders = ['ID', 'Tarikh', 'Waktu', 'Blok', 'Enrolmen', 'Hadir', 'Sickbay', 'Outing', 'Ponteng', 'Penyelia'];
      const rcRows = filteredRC.map(rc => [
        rc.id,
        rc.date,
        rc.shift,
        rc.block,
        rc.totalEnrolled,
        rc.presentCount,
        rc.sickbayCount,
        rc.outingCount,
        rc.absentUnexplained,
        rc.reportedByPpa,
      ]);
      downloadCSV(`Roll_Call_Asrama_${startDate}_ke_${endDate}.csv`, rcHeaders, rcRows);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Pusat Eksport Data & Laporan Rekod Asrama</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Eksport laporan harian kehadiran PPA, laporan bergambar, inventori aset & roll call ke format CSV dan PDF
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Option Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Date Range Selector */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>1. Pilih Tempoh Masa Laporan</span>
            </h2>

            <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => handlePresetChange('today')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'today' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => handlePresetChange('week')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'week' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => handlePresetChange('month')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'month' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                30 Hari (Bulan Ini)
              </button>
              <button
                onClick={() => handlePresetChange('custom')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'custom' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pilihan Tarikh (Custom)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tarikh Mula (From)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setRangePreset('custom');
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tarikh Akhir (To)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setRangePreset('custom');
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Module Selector Checkboxes */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>2. Pilih Modul Data Untuk Dieksport</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportAttendance}
                  onChange={e => setExportAttendance(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Kehadiran Harian PPA</div>
                  <div className="text-[11px] text-slate-500">{filterByDate(attendances).length} rekod dalam julat tarikh</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportReports}
                  onChange={e => setExportReports(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Laporan Bergambar PPA</div>
                  <div className="text-[11px] text-slate-500">{filterByDate(reports).length} laporan ditemui</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportAssets}
                  onChange={e => setExportAssets(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Inventori Aset & Kerosakan</div>
                  <div className="text-[11px] text-slate-500">{assets.length} aset & {damageReports.length} isu kerosakan</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportRollCall}
                  onChange={e => setExportRollCall(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Kehadiran Roll Call Murid</div>
                  <div className="text-[11px] text-slate-500">{filterByDate(rollCalls).length} rekod perhimpunan</div>
                </div>
              </label>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Muat Naik Fail CSV (Excel Format)</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Rasmi PDF</span>
            </button>
          </div>

        </div>

        {/* Right Info Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Pematuhan Format Laporan PPD & JPN</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Format laporan yang dieksport telah diselaraskan mengikut Standard Operating Procedure (SOP) Pengurusan Asrama Sekolah Menengah Kementerian Pendidikan Malaysia.
          </p>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fail CSV membolehkan analisis lanjut dalam Microsoft Excel / Google Sheets.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Laporan PDF memuatkan kepala surat rasmi SMK Banggi dan ruangan pengesahan PK HEM.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
