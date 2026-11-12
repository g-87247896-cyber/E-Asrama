import React, { useState } from 'react';
import { useAsrama, UserRoleMode } from '../context/AsramaContext';
import { ShieldCheck, UserCheck, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { ppas, loginAsPkHem, loginAsPpa, theme, toggleTheme } = useAsrama();

  const [selectedRole, setSelectedRole] = useState<UserRoleMode>('PK_HEM');
  const [selectedPpaId, setSelectedPpaId] = useState<string>(ppas[0]?.id || 'ppa-01');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let success = false;
    if (selectedRole === 'PK_HEM') {
      success = loginAsPkHem(password);
    } else {
      success = loginAsPpa(selectedPpaId, password);
    }

    if (!success) {
      setErrorMessage('Kata laluan tidak sah. Sila semak semula kod laluan akses pengurusan sekolah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Logo & Brand Name */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-blue-600/30">
            eA
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">
              e-Asrama SMK Banggi
            </h1>
            <p className="text-[11px] text-slate-400">
              Sekolah Menengah Kebangsaan Banggi, Kudat, Sabah
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Portal Pelaporan & Kehadiran PPA
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-t-3xl"></div>

          {/* Heading */}
          <div className="text-center space-y-1.5 pt-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Log Masuk Pengurus & Penyelia
            </h2>
            <p className="text-xs text-slate-400">
              Sila pilih peranan dan masukkan kata laluan untuk mengakses portal
            </p>
          </div>

          {/* Role Segmented Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl text-xs font-semibold border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('PK_HEM');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'PK_HEM'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>PK HEM (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('PPA');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'PPA'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>PPA / Penyelia</span>
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-2xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* PPA Dropdown if PPA selected */}
            {selectedRole === 'PPA' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Pilih Profil Penyelia Asrama (PPA)
                </label>
                <select
                  value={selectedPpaId}
                  onChange={e => setSelectedPpaId(e.target.value)}
                  className="w-full px-3.5 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {ppas.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Laluan Akses Rasmi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata laluan..."
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 mt-2"
            >
              <span>Akses Portal e-Asrama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-800/80">
            Sektor Hal Ehwal Murid · SMK Banggi, Sabah
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-slate-500 z-10">
        © {new Date().getFullYear()} e-Asrama SMK Banggi. Hak Cipta Terpelihara Kementerian Pendidikan Malaysia.
      </footer>

    </div>
  );
};
