"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, Copy, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Library() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    loadGenerations();
  }, [user]);

  const loadGenerations = async () => {
    try {
      const q = query(
        collection(db, 'generations'),
        where('userId', '==', user!.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setGenerations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this caption?')) return;
    try {
      await deleteDoc(doc(db, 'generations', id));
      setGenerations(prev => prev.filter(g => g.id !== id));
      toast.success('Caption deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to delete ALL your history? This cannot be undone.')) return;
    try {
      setLoading(true);
      for (const item of generations) {
        await deleteDoc(doc(db, 'generations', item.id));
      }
      setGenerations([]);
      toast.success('History cleared');
    } catch (e) {
      toast.error('Failed to clear history');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const filtered = generations.filter(g => {
    const matchesSearch = g.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || g.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  if (loading) {
    return <div className="flex-1 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Saved Captions</h1>
          <p className="text-sm text-slate-500 mt-1">Browse and reuse your past generations</p>
        </div>
        {generations.length > 0 && (
          <button onClick={clearHistory} className="px-4 py-2 text-xs font-bold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center transition-colors">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear History
          </button>
        )}
      </div>

      <div className="mb-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search descriptions..." 
            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px] p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Platforms</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="Twitter/X">Twitter/X</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            No saved captions found. Generate some magic first!
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-medium text-slate-800 leading-relaxed line-clamp-2">{item.prompt}</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600">{item.platform}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date((item.createdAt as Timestamp).toDate()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <Tabs defaultValue="direct" className="w-full">
                  <TabsList className="flex gap-2 mb-6 bg-transparent h-auto p-0 border-b border-slate-100 pb-px">
                    <TabsTrigger value="direct" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors shadow-none">Direct</TabsTrigger>
                    <TabsTrigger value="story" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors shadow-none">Story</TabsTrigger>
                    <TabsTrigger value="cta" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors shadow-none">CTA</TabsTrigger>
                  </TabsList>
                  
                  {['direct', 'story', 'cta'].map((type, idx) => (
                    <TabsContent key={type} value={type} className="mt-0">
                      <div className="relative group">
                        <p className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-5 leading-relaxed pr-12 min-h-[100px]">
                          {item.variants[idx]}
                        </p>
                        <button 
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-slate-50 border border-slate-200 shadow-sm p-2 rounded-lg text-slate-600"
                          onClick={() => copyToClipboard(item.variants[idx])}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.hashtags.map((tag: string, i: number) => (
                    <span 
                      key={i} 
                      className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full cursor-pointer hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                      onClick={() => copyToClipboard(`#${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
