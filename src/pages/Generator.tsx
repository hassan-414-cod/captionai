import { useState, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ImagePlus, Copy, Save, RefreshCw, X, Sparkles } from 'lucide-react';
import { describeImageContext, generateCaptions, GeneratedResult } from '../lib/gemini';
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { differenceInCalendarDays } from 'date-fns';
import { ImageHoverZoom } from '../components/animations';

export default function Generator() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Casual and Friendly');
  const [hashtagCount, setHashtagCount] = useState('15');
  const [language, setLanguage] = useState('English');
  const [brandVoice, setBrandVoice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFree = profile?.plan === 'free';
  const maxHashtags = isFree ? 10 : 30;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const checkLimits = async () => {
    if (!isFree) return true;
    try {
      const q = query(
        collection(db, 'generations'),
        where('userId', '==', user!.uid),
      );
      const snapshot = await getDocs(q);
      const now = new Date();
      const todayCount = snapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt as Timestamp;
        return differenceInCalendarDays(now, createdAt.toDate()) === 0;
      }).length;
      if (todayCount >= 5) {
        toast.error("You've reached your daily limit of 5 generations on the free plan.");
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!description && !imageFile) {
      toast.error('Please provide a description or upload an image.');
      return;
    }
    if (!user) {
      toast.error('Please log in to generate captions.');
      return;
    }

    const canProceed = await checkLimits();
    if (!canProceed) return;

    setIsGenerating(true);
    try {
      let imageDescription = '';
      if (imageFile) {
        toast.info('Analyzing image...');
        const base64Data = await fileToBase64(imageFile);
        imageDescription = await describeImageContext(base64Data, imageFile.type);
        if (!description) {
          setDescription('Auto-generated from image: ' + imageDescription);
        }
      }

      toast.info('Crafting your perfect caption...');
      const genResult = await generateCaptions({
        description,
        platform,
        tone,
        hashtagCount: isFree ? Math.min(parseInt(hashtagCount), 10) : parseInt(hashtagCount),
        language,
        brandVoice: isFree ? undefined : brandVoice,
        imageDescription
      });

      setResult(genResult);
      toast.success('Generated successfully!');
      
      // Auto-save to library
      const generationId = doc(collection(db, 'generations')).id;
      await setDoc(doc(db, 'generations', generationId), {
        userId: user.uid,
        platform,
        tone,
        prompt: description,
        variants: [genResult.variants.direct, genResult.variants.story, genResult.variants.cta],
        hashtags: genResult.hashtags,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyAllHashtags = () => {
    if (!result) return;
    const text = result.hashtags.map(t => `#${t}`).join(' ');
    copyToClipboard(text);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Input Side */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">Create Post</h1>
          <p className="text-sm text-slate-500">Fill in the details below or upload an image.</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="desc" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Post Description <span className="text-red-500">*</span></Label>
            <Textarea 
              id="desc" 
              placeholder="E.g. A flat lay of my new skincare routine with warm morning light coming through the window." 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Twitter/X'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {['Casual and Friendly', 'Professional', 'Funny and Witty', 'Inspirational and Motivational', 'Bold and Edgy', 'Luxury and Refined'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {['English', 'Urdu', 'Arabic', 'Hinglish'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hashtags</Label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(count => (
                  <button 
                    key={count}
                    disabled={isFree && count > 10}
                    onClick={() => setHashtagCount(count.toString())}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg ${hashtagCount === count.toString() ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-600 border border-slate-200'} ${isFree && count > 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isFree && (
            <>
              <div>
                <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Image Upload (Auto-Caption)</Label>
                {imagePreview ? (
                  <ImageHoverZoom src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg border border-slate-200 shadow-sm">
                    <button onClick={removeImage} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black transition-colors z-10">
                      <X className="w-3 h-3" />
                    </button>
                  </ImageHoverZoom>
                ) : (
                  <div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <div className="w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                        <ImagePlus className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">Drop photo to auto-describe</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brand Voice (Paste past captions)</Label>
                <Textarea 
                  placeholder="Paste 3-5 of your best past captions here so the AI learns your unique style..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-20"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                />
              </div>
            </>
          )}

          <Button 
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all h-14" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Crafting Magic...</> : <><Sparkles className="w-5 h-5 mr-3"/> Generate Content</>}
          </Button>

          {isFree && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Free plan limited to 5 generations/day. <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => navigate('/settings')}>Upgrade to unlock Image Upload and Brand Voice.</span>
            </p>
          )}
        </div>
      </div>

      {/* Output Side */}
      <div className="w-full lg:w-1/2">
        <div className="h-full bg-slate-50 rounded-2xl border border-slate-200 flex flex-col min-h-[600px] overflow-hidden shadow-sm">
          {result ? (
            <div className="p-6 flex flex-col h-full overflow-y-auto bg-slate-50 gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Generated Output</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Saved to Library</button>
                  <button onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <Tabs defaultValue="direct" className="w-full">
                  <TabsList className="w-full flex border-b border-slate-100 bg-white p-0 h-auto rounded-none justify-start">
                    <TabsTrigger value="direct" className="px-6 py-4 rounded-none text-sm font-medium text-slate-400 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50/30 data-[state=active]:shadow-none transition-colors">Direct</TabsTrigger>
                    <TabsTrigger value="story" className="px-6 py-4 rounded-none text-sm font-medium text-slate-400 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50/30 data-[state=active]:shadow-none transition-colors">Story-led</TabsTrigger>
                    <TabsTrigger value="cta" className="px-6 py-4 rounded-none text-sm font-medium text-slate-400 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50/30 data-[state=active]:shadow-none transition-colors">CTA-driven</TabsTrigger>
                  </TabsList>
                  
                  {['direct', 'story', 'cta'].map((type) => (
                    <TabsContent key={type} value={type} className="mt-0">
                      <div className="p-8 flex flex-col gap-4">
                        <p className="text-slate-700 leading-relaxed text-lg min-h-[150px] whitespace-pre-wrap">
                          {(result.variants as any)[type]}
                        </p>
                        <div className="flex justify-end pt-4 border-t border-slate-50">
                          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 transition-colors" onClick={() => copyToClipboard((result.variants as any)[type])}>
                            <Copy className="w-4 h-4" /> Copy Caption
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Hashtags</h3>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors" onClick={copyAllHashtags}>
                    Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-medium cursor-pointer hover:border-indigo-300 transition-colors"
                      onClick={() => copyToClipboard(`#${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Sparkles className="w-8 h-8 text-indigo-200" />
              </div>
              <p className="font-medium text-slate-500">Your AI-crafted copy will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
