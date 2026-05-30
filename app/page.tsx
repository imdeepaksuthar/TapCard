'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import { ArrowRight, Smartphone, Zap, Shield, Globe, Users, QrCode, CheckCircle2, ChevronDown, Star, CreditCard, BarChart3, Palette, Search, Eye, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });

const bentoFeatures = [
  {
    title: "Tap to Share",
    desc: "Instantly transfer your contact details using NFC technology. No app required.",
    icon: <Smartphone className="w-6 h-6" />,
    colSpan: "md:col-span-2",
  },
  {
    title: "QR Ready",
    desc: "For older phones, simply scan the dynamic QR code.",
    icon: <QrCode className="w-6 h-6" />,
    colSpan: "",
  },
  {
    title: "Bank-Level Security",
    desc: "Your data is encrypted and securely stored. Total control over what you share.",
    icon: <Shield className="w-6 h-6" />,
    colSpan: "",
  },
  {
    title: "Lead Generation",
    desc: "Capture incoming leads automatically. Export directly to your CRM.",
    icon: <Users className="w-6 h-6" />,
    colSpan: "md:col-span-2",
  },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Sign up and build your digital identity in minutes. Add links, socials, and payment methods.", icon: <CreditCard className="w-7 h-7" /> },
  { num: "02", title: "Customize Design", desc: "Choose from premium templates. Add your logo, colors, and completely own the look.", icon: <Palette className="w-7 h-7" /> },
  { num: "03", title: "Share Instantly", desc: "Tap your NFC card or share your unique link. Connections are saved immediately.", icon: <Zap className="w-7 h-7" /> },
];

const faqs = [
  { q: 'How does the NFC card work?', a: 'Our NFC cards contain a tiny microchip that sends your digital profile link to any modern smartphone when tapped against it. No app is required by the receiver.' },
  { q: 'Can I update my info after sharing?', a: 'Yes! Your card links to your digital profile. Any updates you make in your dashboard are instantly reflected for anyone who has your link or taps your card.' },
  { q: 'Is there a monthly fee?', a: 'The basic digital profile is 100% free forever. We offer a Pro plan for $5/month that includes advanced analytics, custom colors, and lead capture features.' },
  { q: "What if they don't have NFC?", a: 'Every digital profile comes with a dynamic QR code. You can have them scan the QR code from your phone screen or print it on physical marketing materials.' },
];

export default function Home() {
  const [stats, setStats] = useState({ users: 0, cards: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef({ value: 0 });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentCards, setRecentCards] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/cards/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch { /* ignore */ }
      finally { setIsSearching(false); }
    }, 300);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<{ users: number; cards: number }>('/api/homepage-stats', { method: 'GET' });
        setStats(data);
      } catch {
        setStats({ users: 15420, cards: 52100 });
      }
    };
    fetchStats();

    // Fetch recently added cards
    const fetchRecent = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/cards/recent`);
        if (res.ok) setRecentCards(await res.json());
      } catch { /* ignore */ }
    };
    fetchRecent();

    // Fetch pricing plans
    const fetchPlans = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/plans`);
        if (res.ok) setPlans(await res.json());
      } catch { /* ignore */ }
    };
    fetchPlans();

    // Drive scroll progress for the 3D scene (hero height only)
    const onScroll = () => {
      const heroH = window.innerHeight;
      scrollProgressRef.current.value = Math.min(1, window.scrollY / heroH);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Close search dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ── GSAP Animations ──
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-badge', { opacity: 0, scale: 0.85, duration: 0.7, delay: 0.2 })
      .from('.hero-title', { opacity: 0, y: 60, duration: 1 }, '-=0.4')
      .from('.hero-subtitle', { opacity: 0, y: 40, duration: 0.8 }, '-=0.6')
      .from('.hero-cta', { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
      .from('.hero-scroll-cue', { opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.hero-search', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5');

    // Recent cards grid
    gsap.from('.recent-cards-grid > *', {
      scrollTrigger: { trigger: '.recent-cards-grid', start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
    });

    // 3D scene — fade out as user scrolls past hero
    if (sceneWrapRef.current) {
      gsap.to(sceneWrapRef.current, {
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
        opacity: 0,
        ease: 'none',
      });
    }

    // Section titles
    gsap.utils.toArray<HTMLElement>('.gsap-section-title').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
      });
    });

    // Bento feature cards — staggered
    gsap.from('.bento-card', {
      scrollTrigger: { trigger: '.bento-grid', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
    });

    // Steps
    gsap.from('.step-card', {
      scrollTrigger: { trigger: '.steps-container', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 50,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
    });

    // Pricing cards
    gsap.from('.pricing-card', {
      scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
    });

    // FAQ items
    gsap.from('.faq-item', {
      scrollTrigger: { trigger: '.faq-list', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    });

    // CTA section
    gsap.from('.cta-content', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 75%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 60,
      scale: 0.96,
      duration: 1,
      ease: 'power3.out',
    });

    // Parallax background glows
    mm.add('(min-width: 768px)', () => {
      gsap.to('.hero-glow', {
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 },
        y: 200,
        opacity: 0,
      });
    });

  }, { scope: mainRef });

  return (
    <main ref={mainRef} className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <Header />

      {/* Fixed 3D scene — renders behind hero, fades on scroll via GSAP */}
      <div ref={sceneWrapRef} className="fixed inset-0 z-0 pointer-events-none">
        <Scene3D scrollProgress={scrollProgressRef} />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="hero-section relative pt-28 pb-24 md:pt-36 md:pb-32 px-5 sm:px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Background glow */}
        <div className="hero-glow absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full gap-12 lg:gap-16">
          {/* Left */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2 max-w-2xl">
            <div className="hero-badge inline-flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-full text-[11px] font-semibold tracking-widest text-zinc-400 mb-8 backdrop-blur-xl uppercase">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              The Future of Networking
            </div>

            <h1 className="hero-title text-[2.75rem] sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">Networking.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Reimagined.</span>
            </h1>

            <p className="hero-subtitle text-base sm:text-lg md:text-xl text-zinc-400 max-w-lg mb-10 leading-relaxed">
              The premium digital business card for modern professionals. Share your identity with a single tap.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-semibold transition-transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-full font-semibold border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>

            {/* ── Search Bar ── */}
            <div ref={searchRef} className="hero-search relative mt-8 w-full max-w-lg">
              <div className={`relative flex items-center rounded-2xl border transition-all duration-200 ${searchFocused ? 'border-blue-500/50 bg-zinc-900/90 ring-1 ring-blue-500/20' : 'border-zinc-800 bg-zinc-900/60'} backdrop-blur-xl`}>
                <Search size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search business cards..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-3.5 pl-11 pr-10 outline-none rounded-2xl"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-4">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchFocused && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50 max-h-[360px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((card: any) => (
                      <Link
                        key={card.slug}
                        href={`/${card.slug}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-zinc-800/50 last:border-b-0"
                      >
                        {card.image ? (
                          <img src={card.image} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                            <span className="text-sm font-bold text-white/70">{(card.name || '?')[0]}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{card.name}</p>
                          <p className="text-xs text-zinc-500 truncate">
                            {[card.designation, card.company].filter(Boolean).join(' · ') || card.slug}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600 shrink-0">
                          <Eye size={12} />
                          <span className="text-[10px] font-medium">{card.views?.toLocaleString()}</span>
                        </div>
                      </Link>
                    ))
                  ) : !isSearching ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                      No cards found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right spacer — 3D scene renders in the fixed layer behind */}
          <div className="hidden lg:block lg:w-1/2 h-[450px] pointer-events-none" />
          {/* Mobile spacer */}
          <div className="mt-8 h-[260px] sm:h-[320px] lg:hidden pointer-events-none" />
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-[10px] tracking-[0.25em] font-semibold z-10">
          <span>SCROLL</span>
          <div className="scroll-line w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* ─── Recently Added Cards ─── */}
      {recentCards.length > 0 && (
        <section className="relative z-10 py-16 sm:py-20 px-5 sm:px-6 border-t border-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="gsap-section-title flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-2">Discover</p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recently Added</h2>
              </div>
            </div>

            <div className="recent-cards-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentCards.map((card: any) => (
                <Link
                  key={card.slug}
                  href={`/${card.slug}`}
                  className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 flex flex-col items-center text-center hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200"
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 mb-3 group-hover:ring-blue-500/30 transition-all" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center ring-2 ring-white/10 mb-3 group-hover:ring-blue-500/30 transition-all">
                      <span className="text-lg font-bold text-white/60">{(card.name || '?')[0]}</span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-white truncate w-full">{card.name}</p>
                  {card.designation && (
                    <p className="text-[11px] text-zinc-500 truncate w-full mt-0.5">{card.designation}</p>
                  )}
                  {card.company && (
                    <p className="text-[10px] text-zinc-600 truncate w-full mt-0.5">{card.company}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-zinc-600">
                    <Eye size={10} />
                    <span className="text-[10px] font-medium">{card.views?.toLocaleString() || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Bento Grid Features ─── */}
      <section id="features" className="relative z-10 py-24 sm:py-32 px-5 sm:px-6 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="gsap-section-title text-center mb-16 sm:mb-20">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Designed for <span className="text-zinc-500">seamless connection.</span>
            </h2>
          </div>

          <div className="bento-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {bentoFeatures.map((f, i) => (
              <div
                key={i}
                className={`bento-card group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800/60 p-7 sm:p-9 ${f.colSpan} bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors duration-300`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-500/15 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="relative z-10 py-24 sm:py-32 px-5 sm:px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="gsap-section-title text-center mb-16 sm:mb-20">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Three simple steps.
            </h2>
          </div>

          <div className="steps-container grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="step-card relative group">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-7 sm:p-8 hover:bg-zinc-900/70 transition-colors duration-300 h-full flex flex-col">
                  {/* Step number */}
                  <div className="absolute top-6 right-6 text-[4rem] font-black text-zinc-800/50 leading-none select-none">{step.num}</div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:from-blue-500/25 group-hover:to-indigo-500/25 transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed flex-1">{step.desc}</p>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-zinc-700 to-transparent z-20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="relative z-10 py-24 sm:py-32 px-5 sm:px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="gsap-section-title text-center mb-16 sm:mb-20">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Simple, transparent <span className="text-zinc-500">pricing.</span>
            </h2>
          </div>

          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {(Array.isArray(plans) ? plans : []).map((plan, index) => {
              const isPopular = index === 1;
              const formatPrice = (price: string | number) => {
                const num = Number(price);
                return num > 0 ? `₹${num.toFixed(2).replace(/\.00$/, '')}` : 'Free';
              };
              const periodLabel = plan.billing_period === 'monthly' ? '/mo' : (plan.billing_period === 'yearly' ? '/yr' : '');

              if (isPopular) {
                return (
                  <div key={plan.id} className="pricing-card rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-zinc-900/60 p-7 sm:p-8 flex flex-col relative overflow-hidden ring-1 ring-blue-500/10">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">POPULAR</div>
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-zinc-500 text-sm mb-6">For active professionals.</p>
                    <div className="text-4xl font-extrabold mb-8">{formatPrice(plan.price)}<span className="text-lg text-zinc-500 font-normal">{Number(plan.price) > 0 ? periodLabel : ''}</span></div>
                    <ul className="space-y-3 mb-8 flex-grow text-zinc-300 text-sm">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex gap-2.5 items-center"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> {f}</li>
                      ))}
                    </ul>
                    <Link href="/register" className="block text-center w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-sm shadow-lg shadow-blue-600/20">
                      Upgrade to {plan.name.replace(' Plan', '')}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={plan.id} className="pricing-card rounded-2xl sm:rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-7 sm:p-8 flex flex-col hover:border-zinc-700 transition-colors">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6">{index === 0 ? 'Perfect for individuals.' : 'For teams and companies.'}</p>
                  <div className="text-4xl font-extrabold mb-8">{formatPrice(plan.price)}<span className="text-lg text-zinc-500 font-normal">{Number(plan.price) > 0 ? periodLabel : ''}</span></div>
                  <ul className="space-y-3 mb-8 flex-grow text-zinc-300 text-sm">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-center"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <Link href="/register" className="block text-center w-full py-3.5 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors font-semibold text-sm">
                    {index === 0 ? 'Get Started' : 'Contact Sales'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="relative z-10 py-24 sm:py-32 px-5 sm:px-6 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <div className="gsap-section-title text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-500 text-sm">Everything you need to know about the product.</p>
          </div>

          <div className="faq-list space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden transition-colors hover:border-zinc-700">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 font-medium flex justify-between items-center focus:outline-none gap-4"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`shrink-0 transform transition-transform duration-300 text-zinc-500 ${openFaq === i ? 'rotate-180' : ''}`} size={18} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section relative z-10 py-32 sm:py-40 px-5 sm:px-6 text-center overflow-hidden border-t border-zinc-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="cta-content max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">Elevate your brand.</h2>
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
            Join {stats.users.toLocaleString()}+ professionals already using Card Setu to make lasting impressions.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 bg-white text-black px-10 py-4 sm:px-12 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-transform hover:scale-[1.03] active:scale-95"
          >
            Create Your Card Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-900 bg-black pt-16 sm:pt-24 pb-10 sm:pb-12 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 sm:gap-12 mb-12 sm:mb-16">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="Card Setu" className="h-7 sm:h-8 mb-5" />
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
              The premium digital business card for modern professionals. Networking reimagined with a single tap.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Card Setu. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-zinc-400 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp Widget */}
      <a
        href="https://wa.me/+919983878055"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[99] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </a>
    </main>
  );
}
