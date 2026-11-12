import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { ReportCategory, DormBlockName, ReportStatus } from '../types/asrama';
import { Camera, Sparkles, AlertTriangle, CheckCircle2, Star, Clock, MapPin, Building, Trash2, ShieldCheck, Filter, Search } from 'lucide-react';

export const PhotoReportModule: React.FC = () => {
  const { reports, addPhotoReport, approveReport, deleteReport, userRole, currentPpa } = useAsrama();

  const [category, setCategory] = useState<ReportCategory>('Dewan Makan & Sajian Makanan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('/src/assets/images/dining_hall_meal_check_1794457276354.jpg');
  const [dormBlock, setDormBlock] = useState<DormBlockName | ''>('Blok A - Mat Salleh (Lelaki)');
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [priority, setPriority] = useState<'Biasa' | 'Penting' | 'Segera'>('Biasa');
  const [locationDetails, setLocationDetails] = useState('Dewan Makan Utama');

  // AI Assistant states for drafting comments
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ suggestedComments?: string; recommendedPriority?: 'Biasa' | 'Penting' | 'Segera'; suggestedFollowUp?: string } | null>(null);

  // Approval modal state for PK HEM
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  // Filter states
  const [filterCat, setFilterCat] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSuggest = async () => {
    if (!title || !description) return;
    setIsAiSuggesting(true);
    try {
      const resp = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, description, dormBlock }),
      });
      const data = await resp.json();
      if (data.success && data.data) {
        setAiSuggestion(data.data);
        if (data.data.recommendedPriority) {
          setPriority(data.data.recommendedPriority);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addPhotoReport({
      category,
      title,
      description,
      photoUrl,
      dormBlock: dormBlock || undefined,
      ratingScore,
      priority,
      locationDetails,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setAiSuggestion(null);
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReportId) {
      approveReport(selectedReportId, approvalComment || 'Disahkan oleh PK HEM. Terima kasih atas kawal selia yang baik.');
      setSelectedReportId(null);
      setApprovalComment('');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesCat = filterCat === 'semua' || r.category.toLowerCase().includes(filterCat.toLowerCase());
    const matchesStatus = filterStatus === 'semua' || r.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.ppaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Sistem Laporan Bergambar Harian PPA</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rekod visual kawalan mutu dewan makan, kebersihan dorm, kerosakan fasiliti, dan aktiviti asrama
          </p>
        </div>

        {/* Quick Report Metric Cards */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400">Jumlah Laporan: </span>
            <strong className="text-slate-900 dark:text-white font-mono">{reports.length}</strong>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl">
            <span>Dalam Semakan: </span>
            <strong className="font-mono">{reports.filter(r => r.status === 'Dalam Semakan').length}</strong>
          </div>
        </div>
      </div>

      {/* Form Tambah Laporan Bergambar (untuk PPA) */}
      {userRole === 'PPA' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Daftar Laporan Bergambar Baru</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dihantar oleh Penyelia Bertugas: <strong className="text-slate-800 dark:text-slate-200">{currentPpa.name}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isAiSuggesting || !title}
              className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{isAiSuggesting ? 'Menganalisis...' : 'Analisis AI & Cadangan'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategori Laporan
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Dewan Makan & Sajian Makanan">Dewan Makan & Sajian Makanan</option>
                  <option value="Kebersihan Dorm & Persekitaran">Kebersihan Dorm & Persekitaran</option>
                  <option value="Fasiliti & Kerosakan Bangunan">Fasiliti & Kerosakan Bangunan</option>
                  <option value="Roll Call & Kehadiran Murid">Roll Call & Kehadiran Murid</option>
                  <option value="Disiplin, Solat & Aktiviti">Disiplin, Solat & Aktiviti</option>
                  <option value="Sickbay & Kesihatan Murid">Sickbay & Kesihatan Murid</option>
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tajuk Laporan / Ringkasan Fokus
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Contoh: Semakan Keadaan Kesihatan Murid Sickbay & Kehadiran Roll Call"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Dorm Block */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Blok Asrama Terlibat
                </label>
                <select
                  value={dormBlock}
                  onChange={e => setDormBlock(e.target.value as DormBlockName)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Umum / Seluruh Asrama</option>
                  <option value="Blok A - Mat Salleh (Lelaki)">Blok A - Mat Salleh (Lelaki)</option>
                  <option value="Blok B - Rentap (Lelaki)">Blok B - Rentap (Lelaki)</option>
                  <option value="Blok C - Mahsuri (Perempuan)">Blok C - Mahsuri (Perempuan)</option>
                  <option value="Blok D - Tun Teja (Perempuan)">Blok D - Tun Teja (Perempuan)</option>
                </select>
              </div>

              {/* Location Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Perincian Lokasi
                </label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={e => setLocationDetails(e.target.value)}
                  placeholder="Contoh: Dewan Makan Utama / Bilik Sickbay"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Priority & Score */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tahap Keutamaan
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Skor Kebersihan (1-5)
                  </label>
                  <select
                    value={ratingScore}
                    onChange={e => setRatingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value={5}>5 ★ Cemerlang</option>
                    <option value={4}>4 ★ Baik</option>
                    <option value={3}>3 ★ Sederhana</option>
                    <option value={2}>2 ★ Memerlukan Pembaikan</option>
                    <option value={1}>1 ★ Tidak Memuaskan</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Description & Photo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Keterangan & Catatan Pemeriksaan
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="Terangkan secara jelas penemuan pemeriksaan, keadaan kebersihan, kerosakan, atau maklumat menu makanan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto Laporan (Kamera / Muat Naik)
                </label>
                <div className="space-y-2">
                  <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                    <img src={photoUrl} alt="Laporan" className="w-full h-full object-cover" />
                  </div>
                  <label className="w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Tukar Foto Bukti</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

            </div>

            {/* AI Suggestion Display Box */}
            {aiSuggestion && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Cadangan & Analisis AI Gemini</span>
                </div>
                {aiSuggestion.suggestedComments && (
                  <p className="text-purple-800 dark:text-purple-300 italic">
                    "Cadangan Ulasan PK HEM: {aiSuggestion.suggestedComments}"
                  </p>
                )}
                {aiSuggestion.suggestedFollowUp && (
                  <p className="text-purple-700 dark:text-purple-400 font-medium">
                    Tindakan Susulan Disyorkan: {aiSuggestion.suggestedFollowUp}
                  </p>
                )}
              </div>
            )}

            {/* Form Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hantar Laporan Bergambar</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Filter and Search Bar for Reports */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('semua')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'semua' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setFilterStatus('Dalam Semakan')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'Dalam Semakan' ? 'bg-amber-500 text-white font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Belum Semak
            </button>
            <button
              onClick={() => setFilterStatus('Disahkan PK HEM')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'Disahkan PK HEM' ? 'bg-emerald-600 text-white font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Disahkan
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari tajuk / penyelia..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Photo Reports Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredReports.map(rep => (
          <div
            key={rep.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Photo Header Container */}
              <div className="relative h-56 bg-slate-950 overflow-hidden group">
                <img
                  src={rep.photoUrl}
                  alt={rep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-900/90 text-white rounded-lg backdrop-blur-sm border border-white/10">
                    {rep.category}
                  </span>

                  {rep.priority === 'Segera' ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-red-600 text-white rounded-lg shadow-sm animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      SEGERA
                    </span>
                  ) : rep.priority === 'Penting' ? (
                    <span className="text-[11px] font-semibold px-2.5 py-1 bg-amber-500 text-white rounded-lg">
                      Penting
                    </span>
                  ) : null}
                </div>

                {/* Bottom Image Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                    <span>{rep.date} · {rep.timestamp}</span>
                    {rep.ratingScore && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        ★ {rep.ratingScore}/5
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                    {rep.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    PPA: {rep.ppaName}
                  </span>
                  {rep.dormBlock && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      {rep.dormBlock}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {rep.description}
                </p>

                {rep.locationDetails && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rep.locationDetails}</span>
                  </div>
                )}

                {/* PK HEM Approval Comments Section */}
                {rep.status === 'Disahkan PK HEM' ? (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Disahkan PK HEM
                      </span>
                      <span className="text-[10px] font-mono font-normal text-emerald-700 dark:text-emerald-400">
                        {rep.pkHemApprovedDate}
                      </span>
                    </div>
                    {rep.pkHemComments && (
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 italic">
                        "{rep.pkHemComments}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                    <span>Status: Dalam semakan pengesahan PK HEM</span>
                    <span className="font-bold text-[10px] font-mono">PENDING</span>
                  </div>
                )}

              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              {userRole === 'PK_HEM' && rep.status !== 'Disahkan PK HEM' ? (
                <button
                  onClick={() => setSelectedReportId(rep.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Semak & Sahkan Laporan Ini</span>
                </button>
              ) : (
                <div className="flex items-center justify-between w-full text-slate-400 text-[11px]">
                  <span>ID Laporan: <strong className="font-mono text-slate-600 dark:text-slate-300">{rep.id}</strong></span>
                  {userRole === 'PPA' && (
                    <button
                      onClick={() => deleteReport(rep.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Padam Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* PK HEM Approval Modal Popup */}
      {selectedReportId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Semakan & Pengesahan Laporan PK HEM</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sila masukkan ulasan rasmi PK HEM bagi laporan bergambar ini untuk simpanan rekod fail sekolah & pemantauan warden.
            </p>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ulasan & Arahan Tindakan PK HEM
                </label>
                <textarea
                  rows={3}
                  value={approvalComment}
                  onChange={e => setApprovalComment(e.target.value)}
                  placeholder="Contoh: Laporan disahkan. Kontraktor dewan makan dipuji / Penyelia sila maklumkan penyenggara fasiliti."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReportId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
