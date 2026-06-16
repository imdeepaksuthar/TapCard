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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-blue-500/20 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700 mb-2 drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
                  {stats.users > 0 ? `${(stats.users / 1000).toFixed(stats.users >= 1000 ? 0 : 1)}k+` : '15k+'}
                </div>
                <div className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Registered Users</div>
              </div>
            </div>
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-emerald-500/20 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700 mb-2 drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
                  {stats.cards > 0 ? `${(stats.cards / 1000).toFixed(stats.cards >= 1000 ? 0 : 1)}k+` : '52k+'}
                </div>
                <div className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Cards Created</div>
              </div>
            </div>
            <div className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-purple-500/20 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-[clamp(3rem,6vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-700 mb-2 drop-shadow-lg group-hover:scale-105 transition-transform duration-500">99.9%</div>
                <div className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Uptime SLA</div>
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
      <section id="faq" className="relative z-10 py-[clamp(5rem,10vh,8rem)] px-[clamp(1.25rem,3vw,3rem)] border-t border-zinc-900">
        <div className="max-w-[1024px] mx-auto">
          <div className="gsap-section-title text-center mb-[clamp(3rem,6vh,4rem)]">
            <p className="text-blue-400 text-[clamp(0.75rem,1vw,0.875rem)] font-semibold tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="text-[clamp(2rem,4vw+1rem,3.5rem)] font-bold tracking-tight mb-4 leading-tight">Frequently Asked Questions</h2>
            <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-zinc-500">Everything you need to know about the product.</p>
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
      <section className="cta-section relative z-10 py-[clamp(6rem,12vh,10rem)] px-[clamp(1.25rem,3vw,3rem)] text-center overflow-hidden border-t border-zinc-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(300px,50vw,700px)] h-[clamp(200px,30vw,400px)] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="cta-content max-w-3xl mx-auto relative z-10">
          <h2 className="text-[clamp(2.5rem,5vw+1rem,4rem)] font-bold tracking-tight mb-6 leading-tight">Elevate your brand.</h2>
          <p className="text-[clamp(1rem,1.5vw+0.5rem,1.25rem)] text-zinc-400 mb-[clamp(2rem,4vh,2.5rem)] max-w-xl mx-auto leading-relaxed">
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
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-900 bg-black pt-[clamp(4rem,8vh,6rem)] pb-[clamp(2rem,4vh,3rem)] px-[clamp(1.25rem,3vw,3rem)]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-[clamp(2rem,4vw,3rem)] mb-[clamp(3rem,6vh,4rem)]">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="Card Setu" className="h-7 sm:h-8 mb-5" />
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
              The premium digital business card for modern professionals. Networking reimagined for the digital age.
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
