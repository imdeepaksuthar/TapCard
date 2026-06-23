'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import { ArrowRight, Smartphone, Zap, Shield, Users, QrCode, CheckCircle2, ChevronDown, CreditCard, Palette } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });

const bentoFeatures = [
  {
    title: "Instant Sharing",
    desc: "Share your digital business card via link, QR code, or embed it anywhere. No app required.",
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
  { num: "03", title: "Share Instantly", desc: "Share your unique link or QR code anywhere. Connections are saved immediately.", icon: <Zap className="w-7 h-7" /> },
];

const faqs = [
  { q: 'How does the digital business card work?', a: 'You create a personalized profile with all your contact info, social links, and portfolio. Share it via a unique URL or QR code — anyone can view it instantly on any device, no app needed.' },
  { q: 'Can I update my info after sharing?', a: 'Yes! Your card links to your live digital profile. Any updates you make in your dashboard are instantly reflected for everyone who has your link.' },
  { q: 'Is there a monthly fee?', a: 'The basic digital profile is 100% free forever. We offer a Pro plan for $5/month that includes advanced analytics, custom colors, and lead capture features.' },
  { q: 'Can I use my card offline?', a: 'Your digital profile comes with a dynamic QR code that you can save or print. Anyone can scan it from your phone screen or printed materials, even without internet on your end.' },
];

export default function Home() {
  const [stats, setStats] = useState({ users: 0, cards: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef({ value: 0 });

  const [plans, setPlans] = useState<any[]>([]);



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



    return () => {
      window.removeEventListener('scroll', onScroll);
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
      .from('.hero-scroll-cue', { opacity: 0, duration: 0.8 }, '-=0.3');



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
      <div ref={sceneWrapRef} className="fixed inset-0 z-0 pointer-events-none hidden lg:block">
        <Scene3D scrollProgress={scrollProgressRef} />
      </div>

      {/* ─── Hero Section ─── */}
      <section id="home" className="hero-section relative pt-[clamp(7rem,12vh,11rem)] pb-[clamp(5rem,8vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] max-w-[1440px] mx-auto min-h-[100dvh] flex flex-col justify-center overflow-hidden">

        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Background glow */}
        <div className="hero-glow absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full gap-[clamp(2rem,5vw,4rem)]">
          {/* Left */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2 max-w-2xl">
            <div className="hero-badge inline-flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-full text-[11px] font-semibold tracking-widest text-zinc-400 mb-8 backdrop-blur-xl uppercase">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              The Future of Networking
            </div>

            <h1 className="hero-title text-[clamp(2.75rem,5vw+1rem,4.5rem)] font-black tracking-tighter mb-[clamp(1rem,3vh,1.5rem)] leading-[1.05] drop-shadow-2xl">
              <span className="text-white">Networking.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">Reimagined.</span>
            </h1>

            <p className="hero-subtitle text-[clamp(1rem,1vw+0.75rem,1.25rem)] text-zinc-300 font-medium max-w-lg mb-[clamp(2rem,4vh,2.5rem)] leading-relaxed">
              The premium digital business card for modern professionals. Share your identity instantly, backed by enterprise-grade security and analytics.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-[clamp(0.75rem,2vw,1rem)] w-full sm:w-auto">
              <Link
                href="/register"
                className="group ag-glow-btn relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[size:200%_100%] text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-[0_4px_32px_rgba(59,130,246,0.45),0_0_60px_rgba(99,102,241,0.15)] hover:shadow-[0_8px_48px_rgba(59,130,246,0.6),0_0_80px_rgba(99,102,241,0.25)] transition-all duration-300"
                style={{ backgroundPosition: 'left center', transition: 'background-position 0.5s ease, box-shadow 0.3s ease, transform 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = 'right center')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = 'left center')}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              <Link
                href="#features"
                className="group px-8 py-4 rounded-full font-semibold ag-glass-card text-zinc-200 hover:text-white flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>


          </div>

          {/* Right spacer — 3D scene renders in the fixed layer behind */}
          <div className="hidden lg:block lg:w-1/2 h-[clamp(350px,40vw,500px)] pointer-events-none" />
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-[10px] tracking-[0.25em] font-semibold z-10">
          <span>SCROLL</span>
          <div className="scroll-line w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      <div className="relative z-10 bg-black w-full">



      {/* ─── Scale / Metrics ─── */}
      <section className="relative z-10 py-[clamp(6rem,12vh,10rem)] px-[clamp(1.25rem,3vw,3rem)] border-t border-zinc-900 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <div className="gsap-section-title">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">By the numbers</p>
            <h2 className="text-[clamp(2.5rem,5vw+1rem,4.5rem)] font-black tracking-tighter mb-4 text-white">Scale with confidence.</h2>
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-zinc-400 mb-16 max-w-2xl mx-auto">Enterprise-grade infrastructure powering real connections worldwide.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Metric — Users */}
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl ag-float-card overflow-hidden">
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.10)_0%,transparent_70%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
              {/* Glow orb behind number */}
              <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
              <div className="relative z-10 text-center">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600 mb-2 leading-none group-hover:scale-105 transition-transform duration-500">
                  {stats.users > 0 ? `${(stats.users / 1000).toFixed(stats.users >= 1000 ? 0 : 1)}k+` : '15k+'}
                </div>
                <div className="text-zinc-400 font-semibold tracking-[0.15em] uppercase text-xs">Registered Users</div>
              </div>
            </div>
            {/* Metric — Cards */}
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl ag-float-card overflow-hidden">
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10)_0%,transparent_70%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <div className="absolute w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="relative z-10 text-center">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 mb-2 leading-none group-hover:scale-105 transition-transform duration-500">
                  {stats.cards > 0 ? `${(stats.cards / 1000).toFixed(stats.cards >= 1000 ? 0 : 1)}k+` : '52k+'}
                </div>
                <div className="text-zinc-400 font-semibold tracking-[0.15em] uppercase text-xs">Cards Created</div>
              </div>
            </div>
            {/* Metric — Uptime */}
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl ag-float-card overflow-hidden">
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.10)_0%,transparent_70%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
              <div className="absolute w-32 h-32 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
              <div className="relative z-10 text-center">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 mb-2 leading-none group-hover:scale-105 transition-transform duration-500">99.9%</div>
                <div className="text-zinc-400 font-semibold tracking-[0.15em] uppercase text-xs">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid Features ─── */}
      <section id="features" className="relative z-10 py-[clamp(5rem,10vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] bg-zinc-950/50">
        <div className="max-w-[1440px] mx-auto">
          <div className="gsap-section-title text-center mb-[clamp(3rem,6vh,5rem)]">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">Features</p>
            <h2 className="text-[clamp(2rem,4vw+1rem,3.5rem)] font-bold tracking-tight leading-tight">
              Designed for <span className="text-zinc-500">seamless connection.</span>
            </h2>
          </div>

          <div className="bento-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {bentoFeatures.map((f, i) => (
              <div
                key={i}
                className={`bento-card group relative overflow-hidden rounded-2xl sm:rounded-3xl p-7 sm:p-9 ${f.colSpan} ag-float-card`}
              >
                {/* Top highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-indigo-500/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-400/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
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
      <section id="how-it-works" className="relative z-10 py-[clamp(5rem,10vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] border-t border-zinc-900">
        <div className="max-w-[1440px] mx-auto">
          <div className="gsap-section-title text-center mb-[clamp(3rem,6vh,5rem)]">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">How it works</p>
            <h2 className="text-[clamp(2rem,4vw+1rem,3.5rem)] font-bold tracking-tight leading-tight">
              Three simple steps.
            </h2>
          </div>

          <div className="steps-container grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="step-card relative group">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl ag-float-card p-7 sm:p-8 h-full flex flex-col">
                  {/* Top shimmer line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
                  {/* Step watermark number */}
                  <div className="absolute top-4 right-5 text-[5rem] font-black leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-700/60 to-transparent">{step.num}</div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 to-indigo-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:from-blue-500/25 group-hover:to-indigo-500/25 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all duration-300 relative z-10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3 relative z-10">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed flex-1 relative z-10">{step.desc}</p>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r from-indigo-500/40 to-transparent z-20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="relative z-10 py-[clamp(5rem,10vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] border-t border-zinc-900">
        <div className="max-w-[1440px] mx-auto">
          <div className="gsap-section-title text-center mb-[clamp(3rem,6vh,5rem)]">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="text-[clamp(2rem,4vw+1rem,3.5rem)] font-bold tracking-tight leading-tight">
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
                  <div key={plan.id} className="pricing-card rounded-2xl sm:rounded-3xl ag-glass-premium p-7 sm:p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2">
                    {/* Top shimmer */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
                    {/* Glow orb */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-blue-500/12 blur-3xl rounded-full" />
                    {/* Popular badge */}
                    <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider shadow-lg shadow-blue-500/30">POPULAR</div>
                    <h3 className="text-lg font-bold mb-1 relative z-10">{plan.name}</h3>
                    <p className="text-zinc-400 text-sm mb-6 relative z-10">For active professionals.</p>
                    <div className="text-4xl font-extrabold mb-8 relative z-10 text-white">{formatPrice(plan.price)}<span className="text-lg text-zinc-400 font-normal">{Number(plan.price) > 0 ? periodLabel : ''}</span></div>
                    <ul className="space-y-3 mb-8 flex-grow text-zinc-300 text-sm relative z-10">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex gap-2.5 items-center">
                          <CheckCircle2 size={16} className="text-blue-400 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="ag-glow-btn block text-center w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 relative z-10">
                      Upgrade to {plan.name.replace(' Plan', '')}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={plan.id} className="pricing-card rounded-2xl sm:rounded-3xl ag-float-card p-7 sm:p-8 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600/40 to-transparent" />
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6">{index === 0 ? 'Perfect for individuals.' : 'For teams and companies.'}</p>
                  <div className="text-4xl font-extrabold mb-8">{formatPrice(plan.price)}<span className="text-lg text-zinc-500 font-normal">{Number(plan.price) > 0 ? periodLabel : ''}</span></div>
                  <ul className="space-y-3 mb-8 flex-grow text-zinc-300 text-sm">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-center">
                        <CheckCircle2 size={16} className="text-blue-500/80 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block text-center w-full py-3.5 rounded-full ag-glass-card border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white font-semibold text-sm transition-all duration-300">
                    {index === 0 ? 'Get Started' : 'Contact Sales'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="relative z-10 py-[clamp(5rem,10vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] border-t border-zinc-900">
        <div className="max-w-[1024px] mx-auto">
          <div className="gsap-section-title text-center mb-[clamp(3rem,6vh,4rem)]">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="text-[clamp(2rem,4vw+1rem,3.5rem)] font-bold tracking-tight mb-4 leading-tight">Frequently Asked Questions</h2>
            <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-zinc-500">Everything you need to know about the product.</p>
          </div>

          <div className="faq-list space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item rounded-2xl overflow-hidden transition-all duration-400 ${
                openFaq === i
                  ? 'ag-glass-card border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.08)]'
                  : 'ag-float-card hover:border-zinc-600/50'
              }`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 font-medium flex justify-between items-center focus:outline-none gap-4 min-h-[52px]"
                >
                  <span className={`text-sm sm:text-base transition-colors duration-300 ${openFaq === i ? 'text-white' : 'text-zinc-200'}`}>{faq.q}</span>
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openFaq === i
                      ? 'bg-indigo-500/20 border border-indigo-500/30 rotate-180'
                      : 'bg-zinc-800/60 border border-zinc-700/50'
                  }`}>
                    <ChevronDown className={`text-zinc-400 transition-colors ${openFaq === i ? 'text-indigo-300' : ''}`} size={14} />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-400 ease-in-out ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-3">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section relative z-10 py-[clamp(6rem,12vh,10rem)] px-[clamp(1.25rem,3vw,3rem)] text-center overflow-hidden border-t border-zinc-900">
        {/* Multi-layer glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(400px,60vw,900px)] h-[clamp(300px,40vw,500px)] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(200px,30vw,500px)] h-[clamp(150px,20vw,300px)] bg-indigo-500/8 blur-[80px] rounded-full pointer-events-none" />
        {/* Ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="cta-content max-w-3xl mx-auto relative z-10">
          <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-5">Start for free</p>
          <h2 className="text-[clamp(2.5rem,5vw+1rem,4rem)] font-black tracking-tight mb-6 leading-tight">Elevate your brand.<br /><span className="ag-shimmer-text">Start today.</span></h2>
          <p className="text-[clamp(1rem,1.5vw+0.5rem,1.25rem)] text-zinc-400 mb-[clamp(2rem,4vh,2.5rem)] max-w-xl mx-auto leading-relaxed">
            Join {stats.users.toLocaleString()}+ professionals already using Card Setu to make lasting impressions.
          </p>
          <Link
            href="/register"
            className="group ag-glow-btn inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 sm:px-12 sm:py-5 rounded-full font-bold text-base sm:text-lg shadow-[0_4px_32px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_48px_rgba(59,130,246,0.55)]"
          >
            Create Your Card Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-900/60 bg-black pt-[clamp(4rem,8vh,6rem)] pb-[clamp(2rem,4vh,3rem)] px-[clamp(1.25rem,3vw,3rem)] relative overflow-hidden">
        {/* Subtle footer glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-[clamp(2rem,4vw,3rem)] mb-[clamp(3rem,6vh,4rem)] relative z-10">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="Card Setu" className="h-7 sm:h-8 mb-5 opacity-90 hover:opacity-100 transition-opacity" />
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-6">
              The premium digital business card for modern professionals. Networking reimagined for the digital age.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
                <Link key={s} href="#"
                  className="w-9 h-9 rounded-xl ag-glass-card flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-xs font-semibold"
                  aria-label={s}
                >
                  {s[0]}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-5 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              {[{label:'Features',href:'#features'},{label:'How it Works',href:'#how-it-works'},{label:'Pricing',href:'#pricing'},{label:'FAQ',href:'#faq'}].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-zinc-200 transition-colors duration-200 relative group">
                    {l.label}
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-blue-400/50 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-5 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              {['About Us','Careers','Contact','Blog'].map(l => (
                <li key={l}>
                  <Link href="#" className="hover:text-zinc-200 transition-colors duration-200 relative group">
                    {l}
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-blue-400/50 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              {['Privacy Policy','Terms of Service','Refund Policy'].map(l => (
                <li key={l}>
                  <Link href="#" className="hover:text-zinc-200 transition-colors duration-200 relative group">
                    {l}
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-blue-400/50 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto border-t border-zinc-900/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm relative z-10">
          <p className="text-zinc-600">&copy; {new Date().getFullYear()} Card Setu. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 inline-block" />
            All systems operational
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
