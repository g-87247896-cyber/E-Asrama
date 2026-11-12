import React, { useState } from 'react';
import { useAsrama } from '../context/AsramaContext';
import { AssetCategory, AssetCondition, DormBlockName } from '../types/asrama';
import { Package, AlertTriangle, CheckCircle2, Wrench, PlusCircle, Search, Filter, Camera, Link2, DollarSign, Calendar, MapPin, Building, Sparkles } from 'lucide-react';

export const AssetManagementModule: React.FC = () => {
  const { assets, damageReports, addAsset, updateAssetCondition, reportAssetDamage, updateDamageStatus, userRole, reports } = useAsrama();

  const [activeSubTab, setActiveSubTab] = useState<'inventori' | 'kerosakan'>('inventori');

  // Filter States
  const [filterCat, setFilterCat] = useState<string>('semua');
  const [filterCond, setFilterCond] = useState<string>('semua');
  const [filterBlock, setFilterBlock] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Asset Form Modal state
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Perabot & Katil');
  const [dormBlock, setDormBlock] = useState<DormBlockName | ''>('Blok A - Mat Salleh (Lelaki)');
  const [locationDetails, setLocationDetails] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<AssetCondition>('Baik');

  // Damage Report Modal state
  const [selectedAssetForDamage, setSelectedAssetForDamage] = useState<string | null>(null);
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePriority, setDamagePriority] = useState<'Biasa' | 'Penting' | 'Segera'>('Biasa');
  const [damageCost, setDamageCost] = useState<number>(0);
  const [damagePhoto, setDamagePhoto] = useState<string>('/src/assets/images/facility_maintenance_check_1794457276249.jpg');
  const [linkToPhotoReport, setLinkToPhotoReport] = useState<boolean>(true);

  // Filtered Assets
  const filteredAssets = assets.filter(ast => {
    const matchesCat = filterCat === 'semua' || ast.category.toLowerCase().includes(filterCat.toLowerCase());
    const matchesCond = filterCond === 'semua' || ast.condition.toLowerCase() === filterCond.toLowerCase();
    const matchesBlock = filterBlock === 'semua' || (ast.dormBlock && ast.dormBlock.toLowerCase().includes(filterBlock.toLowerCase()));
    const matchesSearch = ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ast.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ast.locationDetails.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesCond && matchesBlock && matchesSearch;
  });

  // Calculate Asset Metrics
  const totalQuantity = assets.reduce((acc, a) => acc + a.quantity, 0);
  const baikCount = assets.filter(a => a.condition === 'Baik').length;
  const selenggaraCount = assets.filter(a => a.condition === 'Perlu Penyelenggaraan').length;
  const rosakCount = assets.filter(a => a.condition === 'Rosak').length;

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !locationDetails) return;

    const catPrefixMap: Record<string, string> = {
      'Perabot & Katil': 'PRB',
      'Elektrik & Kipas': 'ELK',
      'Sanitari & Paip': 'SNT',
      'Dapur & Dewan Makan': 'DPR',
      'Keselamatan & Bomba': 'BMB',
      'Sukan & Riadah': 'SKN',
    };

    const prefix = catPrefixMap[category] || 'AST';
    const num = Math.floor(100 + Math.random() * 900);
    const generatedCode = `SMKB-ASR-${prefix}-${num}`;

    addAsset({
      assetCode: generatedCode,
      name,
      category,
      dormBlock: dormBlock || undefined,
      locationDetails,
      condition,
      quantity,
    });

    setIsAddAssetOpen(false);
    setName('');
    setLocationDetails('');
  };

  const handleDamageReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForDamage || !damageDesc) return;

    const targetAsset = assets.find(a => a.id === selectedAssetForDamage);
    if (!targetAsset) return;

    reportAssetDamage({
      assetId: targetAsset.id,
      assetCode: targetAsset.assetCode,
      assetName: targetAsset.name,
      category: targetAsset.category,
      dormBlock: targetAsset.dormBlock,
      description: damageDesc,
      priority: damagePriority,
      photoUrl: damagePhoto,
      estimatedCost: damageCost,
    }, linkToPhotoReport);

    setSelectedAssetForDamage(null);
    setDamageDesc('');
    setDamageCost(0);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDamagePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Pengurusan & Pemantauan Aset Asrama</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar perabot, peralatan elektrik, sanitari & perkaitan laporan kerosakan aset dengan laporan PPA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddAssetOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Daftar Aset Baharu</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jumlah Jenis Aset</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {assets.length} <span className="text-xs font-normal text-slate-400">({totalQuantity} unit)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Inventori Asrama SMK Banggi</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Keadaan Baik</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
            {baikCount} <span className="text-xs font-normal text-emerald-600">jenis</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Berfungsi mengikut SOP</p>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Perlu Selenggara</div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 dark:text-amber-400 mt-1">
            {selenggaraCount} <span className="text-xs font-normal text-amber-600">jenis</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Tindakan servisyur</p>
        </div>

        <div className="bg-red-50/70 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-red-800 dark:text-red-300">Rosak / Rosak Teruk</div>
          <div className="text-2xl font-extrabold font-mono text-red-700 dark:text-red-400 mt-1">
            {rosakCount} <span className="text-xs font-normal text-red-600">jenis</span>
          </div>
          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">Laporan kerosakan dibuat</p>
        </div>

      </div>

      {/* Sub-Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('inventori')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSubTab === 'inventori'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Senarai Inventori Aset ({assets.length})
        </button>
        <button
          onClick={() => setActiveSubTab('kerosakan')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'kerosakan'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Laporan Kerosakan Aset ({damageReports.length})</span>
        </button>
      </div>

      {/* TAB 1: SENARAI INVENTORI ASET */}
      {activeSubTab === 'inventori' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="semua">Semua Kategori</option>
                <option value="Perabot">Perabot & Katil</option>
                <option value="Elektrik">Elektrik & Kipas</option>
                <option value="Sanitari">Sanitari & Paip</option>
                <option value="Dapur">Dapur & Dewan Makan</option>
                <option value="Bomba">Keselamatan & Bomba</option>
              </select>

              <select
                value={filterCond}
                onChange={e => setFilterCond(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="semua">Semua Keadaan</option>
                <option value="Baik">Baik</option>
                <option value="Perlu Penyelenggaraan">Perlu Penyelenggaraan</option>
                <option value="Rosak">Rosak</option>
              </select>

              <select
                value={filterBlock}
                onChange={e => setFilterBlock(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="semua">Semua Blok</option>
                <option value="Blok A">Blok A (Mat Salleh)</option>
                <option value="Blok B">Blok B (Rentap)</option>
                <option value="Blok C">Blok C (Mahsuri)</option>
                <option value="Blok D">Blok D (Tun Teja)</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kod / nama aset..."
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Assets Grid Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(ast => (
              <div
                key={ast.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        {ast.assetCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {ast.name}
                      </h3>
                    </div>

                    {ast.condition === 'Baik' ? (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        Baik
                      </span>
                    ) : ast.condition === 'Perlu Penyelenggaraan' ? (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                        Selenggara
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full animate-pulse">
                        ROSAK
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Building className="w-3.5 h-3.5" />
                      <span>{ast.dormBlock || 'Seluruh Asrama'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ast.locationDetails}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span>Kategori: <strong>{ast.category}</strong></span>
                      <span>Kuantiti: <strong className="font-mono">{ast.quantity} unit</strong></span>
                    </div>
                  </div>

                  {ast.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      "{ast.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Diperiksa: {ast.lastInspectedDate}
                  </span>

                  <button
                    onClick={() => setSelectedAssetForDamage(ast.id)}
                    className="px-3 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Laporkan Kerosakan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: LAPORAN KEROSAKAN ASET */}
      {activeSubTab === 'kerosakan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {damageReports.map(dmg => {
              const linkedReport = reports.find(r => r.id === dmg.linkedPhotoReportId);
              return (
                <div
                  key={dmg.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                        {dmg.assetCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {dmg.reportDate} · {dmg.reportTime}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {dmg.assetName}
                    </h3>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {dmg.description}
                    </p>

                    {dmg.photoUrl && (
                      <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                        <img src={dmg.photoUrl} alt="Kerosakan" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Linked PPA Report Info */}
                    {linkedReport && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Berkait Laporan Bergambar PPA #{linkedReport.id}</span>
                        </div>
                        <p className="text-[11px] text-blue-800 dark:text-blue-300 italic">
                          "{linkedReport.title}" — Status: {linkedReport.status}
                        </p>
                      </div>
                    )}

                    {dmg.pkHemNote && (
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-200">
                        <strong>Nota PK HEM:</strong> "{dmg.pkHemNote}"
                      </div>
                    )}
                  </div>

                  {/* Status update controls */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Pelapor: <strong className="text-slate-800 dark:text-slate-200">{dmg.reportedByPpa}</strong>
                    </span>

                    {userRole === 'PK_HEM' ? (
                      <select
                        value={dmg.status}
                        onChange={e => updateDamageStatus(dmg.id, e.target.value as any)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Baru Diterima">Baru Diterima</option>
                        <option value="Dalam Penyelenggaraan">Dalam Penyelenggaraan</option>
                        <option value="Selesai Dibaikpulih">Selesai Dibaikpulih</option>
                        <option value="Cadangan Pelupusan">Cadangan Pelupusan</option>
                      </select>
                    ) : (
                      <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400">
                        {dmg.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Asset */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Daftar Aset Asrama Baharu</span>
            </h2>

            <form onSubmit={handleAddAssetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama / Perincian Aset
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Contoh: Katil Dua Tingkat Besi / Kipas Siling 56 Inci"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Aset
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Perabot & Katil">Perabot & Katil</option>
                    <option value="Elektrik & Kipas">Elektrik & Kipas</option>
                    <option value="Sanitari & Paip">Sanitari & Paip</option>
                    <option value="Dapur & Dewan Makan">Dapur & Dewan Makan</option>
                    <option value="Keselamatan & Bomba">Keselamatan & Bomba</option>
                    <option value="Sukan & Riadah">Sukan & Riadah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blok Asrama
                  </label>
                  <select
                    value={dormBlock}
                    onChange={e => setDormBlock(e.target.value as DormBlockName)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">Umum / Seluruh Asrama</option>
                    <option value="Blok A - Mat Salleh (Lelaki)">Blok A - Mat Salleh (Lelaki)</option>
                    <option value="Blok B - Rentap (Lelaki)">Blok B - Rentap (Lelaki)</option>
                    <option value="Blok C - Mahsuri (Perempuan)">Blok C - Mahsuri (Perempuan)</option>
                    <option value="Blok D - Tun Teja (Perempuan)">Blok D - Tun Teja (Perempuan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Stesen Spesifik
                  </label>
                  <input
                    type="text"
                    value={locationDetails}
                    onChange={e => setLocationDetails(e.target.value)}
                    required
                    placeholder="Contoh: Bilik 101 - 104 Aras 1"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kuantiti Unit
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssetOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Simpan Aset Baharu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Report Damage for Selected Asset */}
      {selectedAssetForDamage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Borang Laporan Kerosakan Aset Asrama</span>
            </h2>

            <form onSubmit={handleDamageReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perincian Masalah / Kerosakan
                </label>
                <textarea
                  rows={3}
                  value={damageDesc}
                  onChange={e => setDamageDesc(e.target.value)}
                  required
                  placeholder="Terangkan kerosakan fizikal, fungsi yang terjejas atau isu keselamatan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahap Keutamaan
                  </label>
                  <select
                    value={damagePriority}
                    onChange={e => setDamagePriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera (Immediate Action)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Anggaran Kos Baikpulih (RM)
                  </label>
                  <input
                    type="number"
                    value={damageCost}
                    onChange={e => setDamageCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkPhoto"
                  checked={linkToPhotoReport}
                  onChange={e => setLinkToPhotoReport(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="linkPhoto" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Kaitkan terus secara automatik dengan Laporan Bergambar PPA
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForDamage(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  Hantar Laporan Kerosakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
