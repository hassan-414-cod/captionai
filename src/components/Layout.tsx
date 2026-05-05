import { Link, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../lib/auth';
import { signInWithGoogle, logOut } from '../lib/firebase';
import { Button } from './ui/button';
import { Loader2, PenLine, LayoutDashboard, Library, Settings, LogOut } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { MouseGlow, AnimatedDivider } from './animations';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative w-full">
      <MouseGlow />
      <header className={`fixed top-0 z-50 w-full transition-all duration-400 ease-out border-b ${scrolled ? 'bg-slate-50/80 backdrop-blur-xl border-slate-200' : 'bg-transparent border-transparent'}`}>
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-bold text-xl tracking-tight">CaptionAI</span>
          </Link>

          <nav className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-6">
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/generator" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  Generator
                </Link>
                <Link to="/library" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  Library
                </Link>
                <Link to="/settings" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  Settings
                </Link>
                <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 cursor-pointer" onClick={() => logOut().then(() => navigate('/'))}>
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`} alt="Avatar" className="w-6 h-6 rounded-full" />
                  <span className="text-xs font-medium text-slate-600 pr-1">Sign Out</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <button onClick={signInWithGoogle} className="hover:text-indigo-600">Log in</button>
                <button onClick={signInWithGoogle} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Get Started</button>
              </div>
            )}
          </nav>
        </div>
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
