import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Sparkles, Zap, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { signInWithGoogle } from '../lib/firebase';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ParticleBackground, TextReveal, Parallax, RevealOnScroll, HoverScale } from '../components/animations';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="w-full flex-1 flex flex-col pt-16 lg:pt-32 animate-bg-gradient relative overflow-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="w-full px-4 text-center max-w-4xl mx-auto mb-20 lg:mb-32 relative z-10 scroll-snap-section">
        <Parallax offset={30}>
          <div className="inline-flex items-center rounded-full border border-slate-200/50 px-3 py-1 text-sm bg-white/50 backdrop-blur-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="font-bold text-slate-700">The AI Copywriter for Social Media</span>
          </div>
          <TextReveal delay={0.1}>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-800 mb-6 leading-tight">
              Write perfect captions in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">5 seconds.</span>
            </h1>
          </TextReveal>
          <TextReveal delay={0.2}>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload a photo or describe your post. CaptionAI instantly generates platform-optimized copy and hashtag sets tailored to your voice.
            </p>
          </TextReveal>
          <RevealOnScroll delay={0.3} yOffset={20}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all" onClick={signInWithGoogle}>
                Start Generating for Free
              </Button>
            </div>
          </RevealOnScroll>
        </Parallax>
      </section>

      {/* Features Showcase */}
      <section className="w-full bg-white/80 backdrop-blur-xl border-y border-slate-200/50 py-20 lg:py-32 relative z-10 scroll-snap-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            <RevealOnScroll delay={0.1}>
              <FeatureCard 
                icon={<LayoutTemplate />}
                title="Platform Optimized"
                description="Instagram, TikTok, LinkedIn, or X. Every caption follows the rules for optimal reach."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <FeatureCard 
                icon={<Zap />}
                title="Lightning Fast"
                description="Stop staring at a blank screen. Get 3 distinct caption variants and hashtags instantly."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.3}>
              <FeatureCard 
                icon={<Sparkles />}
                title="Your Brand Voice"
                description="Train the AI on your past captions so it sounds exactly like you, every time."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-20 lg:py-32 bg-transparent relative z-10 scroll-snap-section" id="pricing">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <TextReveal>
              <h2 className="text-4xl font-bold tracking-tight text-slate-800 mb-4">Simple, transparent pricing</h2>
            </TextReveal>
            <TextReveal delay={0.1}>
              <p className="text-lg text-slate-600">Choose the plan that fits your growth.</p>
            </TextReveal>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <RevealOnScroll delay={0.1}>
              <PricingTier 
                name="Free"
                price="$0"
                description="For casual creators."
                features={[
                  '5 generations per day',
                  'Up to 10 hashtags',
                  'All platform formats',
                  'Basic tones'
                ]}
                onClick={signInWithGoogle}
                buttonText="Get Started"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <PricingTier 
                name="Pro"
                price="$5"
                period="/mo"
                description="For serious creators & small business."
                features={[
                  'Unlimited generations',
                  'Up to 30 hashtags',
                  'Image-to-Caption upload',
                  'Train your Brand Voice',
                  'CSV Export'
                ]}
                highlighted
                onClick={signInWithGoogle}
                buttonText="Start 7-Day Free Trial"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.3}>
              <PricingTier 
                name="Agency"
                price="$20"
                period="/mo"
                description="For marketing teams handling clients."
                features={[
                  'Everything in Pro',
                  'Team member seats',
                  'Bulk generation mode',
                  'White-label exports',
                  'Analytics Dashboard'
                ]}
                onClick={signInWithGoogle}
                buttonText="Go Agency"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <HoverScale>
      <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
            {icon}
          </div>
          <CardTitle className="text-slate-800 font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
        </CardContent>
      </Card>
    </HoverScale>
  );
}

function PricingTier({ name, price, period = "", description, features, highlighted = false, onClick, buttonText }: any) {
  return (
    <HoverScale className="h-full">
      <Card className={`relative flex flex-col rounded-3xl h-full ${highlighted ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-indigo-600 bg-white/90 backdrop-blur-sm' : 'border-slate-200/80 shadow-sm bg-white/60 backdrop-blur-sm'}`}>
        {highlighted && (
          <div className="absolute -top-4 w-full flex justify-center">
            <span className="bg-indigo-600 text-white text-[10px] font-bold py-1.5 px-4 rounded-full uppercase tracking-widest shadow-sm">
              Most Popular
            </span>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 font-bold">{name}</CardTitle>
          <CardDescription className="text-slate-500 font-medium">{description}</CardDescription>
          <div className="mt-4 flex items-baseline text-4xl font-bold text-slate-800">
            {price}
            <span className="text-lg font-medium text-slate-500 ml-1">{period}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-4 mb-8 flex-1">
            {features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          <Button 
            className={`w-full h-12 rounded-xl font-bold ${highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none'}`}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </HoverScale>
  );
}
