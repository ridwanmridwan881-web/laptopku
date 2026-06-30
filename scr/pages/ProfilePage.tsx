import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, Check, ShoppingBag } from 'lucide-react';
import type { NavigateFunction } from '../App';

interface ProfilePageProps {
  navigate: NavigateFunction;
}

export default function ProfilePage({ navigate }: ProfilePageProps) {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      address
    });

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Profil Saya</h1>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profile?.full_name || 'Pengguna'}</h2>
              <p className="text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Telepon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Alamat Pengiriman</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('orders')}
          className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white transition-colors w-full"
        >
          <ShoppingBag className="w-5 h-5 text-cyan-500" />
          <span>Lihat Riwayat Pesanan</span>
        </button>
      </div>
    </div>
  );
}
