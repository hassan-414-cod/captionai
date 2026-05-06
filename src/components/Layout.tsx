import { Link, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../lib/auth';
import { signInWithGoogle, logOut } from '../lib/firebase';
import { Button } from './ui/button';
import { Loader2, PenLine, LayoutDashboard, Library, Settings, LogOut, Menu, X } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { MouseGlow, AnimatedDivider } from './animations';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative w-full overflow-x-hidden">
      <MouseGlow />
      <header className={`fixed top-0 z-50 w-full transition-all duration-400 ease-out border-b ${scrolled ? 'bg-slate-50/90 backdrop-blur-xl border-slate-200' : 'bg-transparent border-transparent'}`}>
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-bold text-xl tracking-tight">CaptionAI</span>
          </Link>

          <nav className="flex items-center">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center gap-6">
                  <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/generator" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Generator
                  </Link>
                  <Link to="/library" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Library
                  </Link>
                  <Link to="/settings" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Settings
                  </Link>
                  <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => logOut().then(() => navigate('/'))}>
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`} alt="Avatar" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-medium text-slate-600 pr-1">Sign Out</span>
                  </div>
                </div>
                <button 
                  className="sm:hidden p-2 text-slate-600 hover:text-indigo-600"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <button onClick={signInWithGoogle} className="hover:text-indigo-600">Log in</button>
                <button onClick={signInWithGoogle} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Get Started</button>
              </div>
            )}
          </nav>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {user && mobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/generator" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium">
              <PenLine size={18} /> Generator
            </Link>
            <Link to="/library" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium">
              <Library size={18} /> Library
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium">
              <Settings size={18} /> Settings
            </Link>
            <div className="h-px bg-slate-100 my-1 w-full" />
            <button onClick={() => { setMobileMenuOpen(false); logOut().then(() => navigate('/')); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 text-red-600 font-medium">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-1 flex flex-col items-center w-full pt-16">
        <Outlet />
      </main>
      
      <div className="w-full mt-auto">
        <AnimatedDivider />
        <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-medium w-full">
        <div className="flex gap-4">
          <span>v2.1.0-Stable</span>
          <span>Cloud Sync Active</span>
        </div>
        <div className="flex gap-4 uppercase tracking-widest hidden sm:flex">
          <Link to="/settings" className="text-indigo-600 hover:underline">Upgrade to Agency for Analytics</Link>
          <Link to="#" className="hover:text-slate-600">Support</Link>
        </div>
      </footer>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
