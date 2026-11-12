import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { ShiftType } from '../types/asrama';
import { Clock, MapPin, Camera, CheckCircle2, AlertCircle, Calendar, UserCheck, ShieldCheck, Search, Filter } from 'lucide-react';

export const AttendanceSystem: React.FC = () => {
  const { attendances, clockInPpa, currentPpa, userRole, ppas } = useAsrama();
  
  const [selectedShift, setSelectedShift] = useState<ShiftType>('Pagi');
  const [locationName, setLocationName] = useState('Pejabat Penyelia Asrama & Dewan Makan');
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState('/src/assets/images/facility_maintenance_check_1794457276249.jpg');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [filterShift, setFilterShift] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    clockInPpa({
      shift: selectedShift,
      photoUrl: photoPreview,
      locationName,
      notes: notes || `Tugas ${selectedShift} disempurnakan mengikut jadual rondaan.`,
    });
    setIsSuccessMessage(true);
    setNotes('');
    setTimeout(() => setIsSuccessMessage(false), 4000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAttendances = attendances.filter(att => {
    const matchesShift = filterShift === 'semua' || att.shift.toLowerCase() === filterShift.toLowerCase();
    const matchesSearch = att.ppaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          att.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShift && matchesSearch;
  });

  // Calculate today's stats
  const todayAttendances = attendances.filter(a => a.date === todayStr);
  const pagiCount = todayAttendances.filter(a => a.shift === 'Pagi').length;
  const petangCount = todayAttendances.filter(a => a.shift === 'Petang').length;
  const malamCount = todayAttendances.filter(a => a.shift === 'Malam').length;

  return (
    <div className="space-y-6">
      
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sistem Kehadiran & Shift PPA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rakaman log masuk tugas harian Pembantu Penyelia Asrama SMK Banggi berserta foto bukti lokasi & masa
          </p>
        </div>

        {/* Quick Shift Summary Cards */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Pagi: <strong className="text-slate-900 dark:text-white font-mono">{pagiCount}</strong> bertugas</span>
          </div>
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Petang: <strong className="text-slate-900 dark:text-white font-mono">{petangCount}</strong> bertugas</span>
          </div>
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Malam: <strong className="text-slate-900 dark:text-white font-mono">{malamCount}</strong> bertugas</span>
          </div>
        </div>
      </div>

      {/* Clock-In Form for PPA */}
      {userRole === 'PPA' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Borang Imbasan Kehadiran Duty</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Penyelia: <strong className="text-slate-800 dark:text-slate-200">{currentPpa.name}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPpa.role}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Masa Sekarang</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {new Date().toLocaleTimeString('ms-MY')}
              </div>
            </div>
          </div>

          {isSuccessMessage && (
            <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Kehadiran Berjaya Direkodkan!</strong>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Log tugas anda bagi syif {selectedShift} telah dikemaskini dalam pangkalan data e-Asrama SMK Banggi.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleClockIn} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Shift Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Syif Tugas Harian
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['Pagi', 'Petang', 'Malam'] as ShiftType[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedShift(s)}
                      className={`py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        selectedShift === s
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Pagi (06:00-14:00) · Petang (14:00-22:00) · Malam (22:00-06:00)
                </p>
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Lokasi Stesen / Point Tugas
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    required
                    placeholder="Contoh: Pejabat Asrama & Dewan Makan"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                  GPS: 7.2514° N, 117.1601° E (Pulau Banggi, Kudat)
                </p>
              </div>

              {/* Photo Bukti Clock-In */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Foto Bukti Diri & Lokasi Tugas
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shrink-0">
                    <img src={photoPreview} alt="Bukti Kehadiran" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Ambil / Muat Naik Foto</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Kamera bersedia untuk imbasan cepat
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Note / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Ringkas Pertukaran Shift / Status (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Selesai semakan dewan makan & persediaan bilik sickbay."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Clock In Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hantar Rekod Kehadiran Shift</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* History & Log Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Log Rekod Kehadiran PPA Harian</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Jumlah Rekod: <strong className="text-slate-900 dark:text-white font-mono">{filteredAttendances.length}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Kemas kini terkini: {todayStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              {['semua', 'pagi', 'petang', 'malam'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterShift(s)}
                  className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                    filterShift === s
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama PPA..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Attendance Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredAttendances.map(rec => (
            <div
              key={rec.id}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.photoUrl}
                      alt={rec.ppaName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{rec.ppaName}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Syif {rec.shift}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{rec.date}</span>
                      </div>
                    </div>
                  </div>

                  {rec.verifiedByPkHem ? (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Disahkan PK HEM
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      Belum Semak
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Masa Masuk: <strong className="font-mono text-slate-900 dark:text-white">{rec.checkInTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{rec.locationName}</span>
                  </div>
                  {rec.notes && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1 bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{rec.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>GPS: {rec.gpsCoords.lat.toFixed(4)}°, {rec.gpsCoords.lng.toFixed(4)}°</span>
                <span className="font-mono">ID: {rec.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
