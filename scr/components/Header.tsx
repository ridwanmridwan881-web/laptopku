import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Laptop, User, ShoppingBag, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import type { NavigateFunction } from '../App';

interface HeaderProps {
  navigate: NavigateFunction;
  currentPage: string;
}

export default function Header({ navigate, currentPage }: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              LaptopKu
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavButton active={currentPage === 'home'} onClick={() => navigate('home')}>
              Beranda
            </NavButton>
            <NavButton onClick={() => navigate('home')}>Gaming</NavButton>
            <NavButton onClick={() => navigate('home')}>Kerja</NavButton>
            <NavButton onClick={() => navigate('home')}>Budget</NavButton>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('cart')}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1">
                    <button
                      onClick={() => { navigate('profile'); setUserMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      Profil Saya
                    </button>
                    <button
                      onClick={() => { navigate('orders'); setUserMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      Pesanan Saya
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { navigate('admin'); setUserMenuOpen(false); }}
                        className="w-full px-4 py-2 text-left text-cyan-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </button>
                    )}
                    <hr className="my-1 border-slate-700" />
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate('register')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg transition-colors"
                >
                  Daftar
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col gap-1">
              <MobileNavButton onClick={() => { navigate('home'); setMobileMenuOpen(false); }}>
                Beranda
              </MobileNavButton>
              <MobileNavButton onClick={() => { navigate('home'); setMobileMenuOpen(false); }}>
                Gaming
              </MobileNavButton>
              <MobileNavButton onClick={() => { navigate('home'); setMobileMenuOpen(false); }}>
                Kerja
              </MobileNavButton>
              <MobileNavButton onClick={() => { navigate('home'); setMobileMenuOpen(false); }}>
                Budget
              </MobileNavButton>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}
