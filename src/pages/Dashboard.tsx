import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PenLine, Sparkles, Hash, Library as LibraryIcon } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [generationsToday, setGenerationsToday] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [agencyStats, setAgencyStats] = useState({ platform: '', tone: '' });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'generations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        setTotalGenerations(snapshot.size);
        
        // Count today's
        const now = new Date();
        const docDatas = snapshot.docs.map(d => d.data());
        
        const todayCount = docDatas.filter(data => {
          const createdAt = data.createdAt as Timestamp;
          if (!createdAt) return false;
          return differenceInCalendarDays(now, createdAt.toDate()) === 0;
        }).length;
        
        setGenerationsToday(todayCount);

        if (profile?.plan === 'agency' && docDatas.length > 0) {
          const platforms = docDatas.map(d => d.platform).reduce((acc: Record<string, number>, curr: string) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
          const tones = docDatas.map(d => d.tone).reduce((acc: Record<string, number>, curr: string) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
          
          const maxObjKey = (obj: Record<string, number>) => Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
          setAgencyStats({
            platform: maxObjKey(platforms),
            tone: maxObjKey(tones)
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDataLoading(false);
      }
    }
    if (user && profile) {
      loadStats();
    }
  }, [user, profile]);

  if (loading || dataLoading) {
    return <div className="flex-1 flex items-center justify-center p-8">Loading dashboard...</div>;
  }

  const isFree = profile?.plan === 'free';
  const dailyLimit = 5;
  const creditsRemaining = isFree ? Math.max(0, dailyLimit - generationsToday) : 'Unlimited';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8 lg:py-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back, {user?.displayName || 'Creator'}</h1>
          <p className="text-sm text-slate-500 mt-1">Ready to create some thumb-stopping copy?</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0 flex items-center" onClick={() => navigate('/generator')}>
          <PenLine className="w-4 h-4 mr-2" /> New Caption
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Credits</h3>
          </div>
          <div className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            {creditsRemaining}
          </div>
          {isFree && (
            <p className="text-sm text-slate-500 mt-auto">Resets tonight. <button onClick={() => navigate('/settings')} className="text-indigo-600 font-bold hover:underline">Upgrade</button> for unlimited.</p>
          )}
          {!isFree && (
            <p className="text-sm text-slate-500 mt-auto">You are on the {profile?.plan} plan.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <LibraryIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Captions</h3>
          </div>
          <div className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            {totalGenerations * 3}
          </div>
          <p className="text-sm text-slate-500 mt-auto">Generated variations</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <Hash className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hashtags</h3>
          </div>
          <div className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            {totalGenerations * 15}
          </div>
          <p className="text-sm text-slate-500 mt-auto">Tags created and optimized</p>
        </div>
      </div>

      {profile?.plan === 'agency' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800">Agency Analytics</h2>
          </div>
          <div className="p-6 pt-0">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Generations</p>
                <div className="text-2xl font-bold mt-2 text-slate-800">{totalGenerations}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Favorite Platform</p>
                <div className="text-2xl font-bold mt-2 text-slate-800">{agencyStats.platform || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Top Tone</p>
                <div className="text-2xl font-bold mt-2 text-slate-800 truncate">{agencyStats.tone || 'N/A'}</div>
              </div>
            </div>
            
            <div className="h-40 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-sm text-slate-400">
              <Sparkles className="w-6 h-6 mb-2 text-indigo-300" />
              <p className="font-medium text-slate-500">Additional Pro/Agency insights will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
