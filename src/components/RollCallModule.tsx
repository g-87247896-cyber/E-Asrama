import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { DormBlockName, ShiftType } from '../types/asrama';
import { Users, CheckCircle2, AlertCircle, HeartPulse, LogOut, Clock, PlusCircle } from 'lucide-react';

export const RollCallModule: React.FC = () => {
  const { rollCalls, addRollCall, userRole, currentPpa } = useAsrama();

  const [block, setBlock] = useState<DormBlockName>('Blok A - Mat Salleh (Lelaki)');
  const [shift, setShift] = useState<ShiftType>('Malam');
  const [totalEnrolled, setTotalEnrolled] = useState<number>(65);
  const [presentCount, setPresentCount] = useState<number>(63);
  const [sickbayCount, setSickbayCount] = useState<number>(1);
  const [outingCount, setOutingCount] = useState<number>(1);
  const [absentUnexplained, setAbsentUnexplained] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    addRollCall({
      date: todayStr,
      shift,
      block,
      totalEnrolled,
      presentCount,
      sickbayCount,
      outingCount,
      absentUnexplained,
      reportedByPpa: currentPpa.name,
      notes: notes || 'Semakan roll call disempurnakan mengikut panduan asrama.',
    });
    setIsFormOpen(false);
    setNotes('');
  };

  // Overall statistics calculation
  const totalAllEnrolled = rollCalls.reduce((acc, r) => acc + r.totalEnrolled, 0);
  const totalAllPresent = rollCalls.reduce((acc, r) => acc + r.presentCount, 0);
  const overallPercentage = totalAllEnrolled > 0 ? ((totalAllPresent / totalAllEnrolled) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      
      {/* Header & Main Roll Call Metric Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Roll Call & Kehadiran Penghuni Asrama</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rekod bilangan murid hadir, di bilik sakit (sickbay), outing/balik kampung & senarai dorm Blok A-D
          </p>
        </div>

        {userRole === 'PPA' && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Rekod Roll Call Baru</span>
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jumlah Penghuni</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {totalAllEnrolled}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SMK Banggi Dorm A, B, C, D</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Peratus Kehadiran</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
            {overallPercentage}%
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Hadir dalam asrama</p>
        </div>

        <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-purple-600" />
            <span>Kuarantin / Sickbay</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-700 dark:text-purple-400 mt-1">
            {rollCalls.reduce((acc, r) => acc + r.sickbayCount, 0)}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Murid dirawat/pantau</p>
        </div>

        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5 text-blue-600" />
            <span>Kebenaran Outing</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-700 dark:text-blue-400 mt-1">
            {rollCalls.reduce((acc, r) => acc + r.outingCount, 0)}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Balik kampung / kebenaran</p>
        </div>

      </div>

      {/* Form Input Roll Call */}
      {isFormOpen && userRole === 'PPA' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            Borang Catatan Roll Call Asrama
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blok Asrama
                </label>
                <select
                  value={block}
                  onChange={e => setBlock(e.target.value as DormBlockName)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Blok A - Mat Salleh (Lelaki)">Blok A - Mat Salleh (Lelaki)</option>
                  <option value="Blok B - Rentap (Lelaki)">Blok B - Rentap (Lelaki)</option>
                  <option value="Blok C - Mahsuri (Perempuan)">Blok C - Mahsuri (Perempuan)</option>
                  <option value="Blok D - Tun Teja (Perempuan)">Blok D - Tun Teja (Perempuan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Roll Call
                </label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Pagi">Pagi (Perhimpunan Subuh/Prep)</option>
                  <option value="Petang">Petang (Riadah/Makan Malam)</option>
                  <option value="Malam">Malam (Lights Out 21:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Enrolmen Blok
                </label>
                <input
                  type="number"
                  value={totalEnrolled}
                  onChange={e => setTotalEnrolled(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

            </div>

            {/* Counts Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Bil. Hadir Ditempat
                </label>
                <input
                  type="number"
                  value={presentCount}
                  onChange={e => setPresentCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl font-mono text-emerald-900 dark:text-emerald-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-purple-700 dark:text-purple-400 mb-1">
                  Bil. Di Sickbay
                </label>
                <input
                  type="number"
                  value={sickbayCount}
                  onChange={e => setSickbayCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl font-mono text-purple-900 dark:text-purple-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Bil. Outing / Balik
                </label>
                <input
                  type="number"
                  value={outingCount}
                  onChange={e => setOutingCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl font-mono text-blue-900 dark:text-blue-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-red-700 dark:text-red-400 mb-1">
                  Tanpa Sebab (Ponteng)
                </label>
                <input
                  type="number"
                  value={absentUnexplained}
                  onChange={e => setAbsentUnexplained(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl font-mono text-red-900 dark:text-red-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Nama Murid Sakit atau Kelepasan
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Mohd Firdaus di Sickbay kerana demam ringan. Warden telah beri paracetamol."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Simpan Rekod Roll Call
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Roll Call Block Logs Table & Cards */}
      <div className="space-y-4">
        {rollCalls.map(rc => {
          const pct = Math.round((rc.presentCount / rc.totalEnrolled) * 100);
          return (
            <div
              key={rc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{rc.block}</h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Syif {rc.shift} · {rc.timestamp}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Kehadiran: <strong className="font-mono">{rc.presentCount} / {rc.totalEnrolled}</strong> murid</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {rc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    {rc.notes}
                  </p>
                )}
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Penyelia: <strong className="text-slate-800 dark:text-slate-200">{rc.reportedByPpa}</strong>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {rc.sickbayCount > 0 && (
                    <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg font-mono">
                      Sickbay: {rc.sickbayCount}
                    </span>
                  )}
                  {rc.outingCount > 0 && (
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-mono">
                      Outing: {rc.outingCount}
                    </span>
                  )}
                  {rc.absentUnexplained > 0 ? (
                    <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg font-mono font-bold animate-pulse">
                      Tanpa Sebab: {rc.absentUnexplained}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      Tiada Kes Ponteng
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
