import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { Printer, Download, X, ShieldCheck, Building, CheckCircle2 } from 'lucide-react';

interface OfficialReportPrintProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialReportPrint: React.FC<OfficialReportPrintProps> = ({ isOpen, onClose }) => {
  const { reports, attendances, rollCalls, executiveSummary } = useAsrama();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const dateReports = reports.filter(r => r.date === selectedDate || reports.length > 0);
  const dateAttendances = attendances.filter(a => a.date === selectedDate || attendances.length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Control Bar (Non-Printable) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pratonton & Eksport Laporan Rasmi Asrama SMK Banggi
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 bg-white">
          
          {/* Official School Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-xl">
                SB
              </div>
              <div>
                <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
                  SEKOLAH MENENGAH KEBANGSAAN BANGGI
                </h1>
                <p className="text-xs text-slate-700 font-medium">
                  Peti Surat 10, 89057 Kudat, Pulau Banggi, Sabah | Tel: 088-XXXXXX
                </p>
                <p className="text-[11px] font-bold text-blue-900 mt-0.5">
                  UNIT HAL EHWAL MURID (HEM) — SEKTOR PENGURUSAN ASRAMA
                </p>
              </div>
            </div>
          </div>

          {/* Document Title Header */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              LAPORAN HARIAN PEMBANTU PENYELIA ASRAMA (PPA) & ROLL CALL
            </h2>
            <div className="text-xs font-mono text-slate-600 mt-0.5">
              Tarikh Laporan: <strong>{selectedDate}</strong> | Masa Cetakan: {new Date().toLocaleString('ms-MY')}
            </div>
          </div>

          {/* AI Executive Summary Block */}
          {executiveSummary && (
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                Rumusan Eksekutif Operasi Asrama (Penetapan PK HEM)
              </h3>
              <p className="text-slate-800 leading-relaxed italic">
                "{executiveSummary.summaryText}"
              </p>
            </div>
          )}

          {/* Section 1: Ringkasan Kehadiran Duty PPA */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              1. REKOD KEHADIRAN PEMBANTU PENYELIA ASRAMA (PPA)
            </h3>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-300 px-3 py-2 text-left">Nama Penyelia</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Syif</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Masa Masuk</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Lokasi Stesen</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Status PK HEM</th>
                </tr>
              </thead>
              <tbody>
                {dateAttendances.map(a => (
                  <tr key={a.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">{a.ppaName}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">{a.shift}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{a.checkInTime}</td>
                    <td className="border border-slate-300 px-3 py-1.5">{a.locationName}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-emerald-800">
                      Disahkan
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Roll Call Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              2. LAPORAN KEHADIRAN PENGHUNI ASRAMA (ROLL CALL)
            </h3>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-300 px-3 py-2 text-left">Blok Asrama</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Enrolmen</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Hadir</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Sickbay</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Outing</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rollCalls.map(rc => (
                  <tr key={rc.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">{rc.block}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{rc.totalEnrolled}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono font-bold text-emerald-800">{rc.presentCount}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono text-purple-800">{rc.sickbayCount}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono text-blue-800">{rc.outingCount}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-700">{rc.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Lampiran Laporan Bergambar Harian */}
          <div className="space-y-3 page-break">
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              3. LAMPIRAN LAPORAN BERGAMBAR (PEMERIKSAAN SAJIAN & DORM)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {dateReports.map(rep => (
                <div key={rep.id} className="border border-slate-300 rounded-lg p-3 space-y-2 text-xs">
                  <div className="h-40 w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
                    <img src={rep.photoUrl} alt={rep.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono font-semibold">
                    <span>{rep.category}</span>
                    <span>{rep.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-slate-900">{rep.title}</h4>
                  <p className="text-slate-700 text-[11px] line-clamp-3">{rep.description}</p>
                  
                  {rep.pkHemComments && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-medium">
                      Ulasan PK HEM: "{rep.pkHemComments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Official Signature Block */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-12">
              <div>
                <p className="font-medium">Disediakan Oleh:</p>
                <div className="h-14"></div>
                <p className="font-bold border-b border-slate-400 w-48 pb-0.5">
                  ( ROSLI BIN AHMAD )
                </p>
                <p className="text-slate-600">Ketua Pembantu Penyelia Asrama</p>
                <p className="text-slate-500 text-[11px]">SMK Banggi, Kudat</p>
              </div>
            </div>

            <div className="space-y-12 text-right">
              <div>
                <p className="font-medium">Disahkan & Diluluskan Oleh:</p>
                <div className="h-14"></div>
                <p className="font-bold border-b border-slate-400 w-48 ml-auto pb-0.5">
                  ( PK HEM SMK BANGGI )
                </p>
                <p className="text-slate-600">Penolong Kanan Hal Ehwal Murid</p>
                <p className="text-slate-500 text-[11px]">SMK Banggi, Kudat</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
