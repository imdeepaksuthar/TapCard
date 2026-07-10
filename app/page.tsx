'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  ArrowRight, Smartphone, Zap, Shield, Users, QrCode, CreditCard, Palette,
  Check, ChevronDown, Menu, X, Sun, Moon, Search, Sparkles, LogOut, LayoutDashboard,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Interactive 3D hero card — client-only, lazy-loaded so it never blocks first paint.
const HeroCard3D = dynamic(() => import('./components/HeroCard3D'), { ssr: false });

const features = [
  { title: 'Instant Sharing', desc: 'Share your card via link, QR, or embed — anywhere, no app required.', icon: Smartphone, span: 'sm:col-span-2' },
  { title: 'QR Ready', desc: 'Any phone can scan your dynamic QR code in a tap.', icon: QrCode, span: '' },
  { title: 'Bank-Level Security', desc: 'Encrypted and stored securely. You control exactly what you share.', icon: Shield, span: '' },
  { title: 'Lead Generation', desc: 'Capture incoming leads automatically and export straight to your CRM.', icon: Users, span: 'sm:col-span-2' },
];

const steps = [
  { num: '01', title: 'Create your profile', desc: 'Sign up and build your digital identity in minutes — links, socials, and payment methods.', icon: CreditCard },
  { num: '02', title: 'Customize the design', desc: 'Pick a premium template, add your logo and colors, and own the look completely.', icon: Palette },
  { num: '03', title: 'Share instantly', desc: 'Send your unique link or QR anywhere. Every connection is saved immediately.', icon: Zap },
];

const faqs = [
  { q: 'How does the digital business card work?', a: 'You build a personalized profile with your contact info, social links, and portfolio, then share it via a unique URL or QR code. Anyone can view it instantly on any device — no app needed.' },
  { q: 'Can I update my info after sharing?', a: 'Yes. Your card links to your live profile, so any change you make in the dashboard is instantly reflected for everyone who has your link.' },
  { q: 'Is there a monthly fee?', a: 'The basic digital profile is free forever. Paid plans add advanced analytics, custom branding, and lead-capture features.' },
  { q: 'Can I use my card offline?', a: 'Your profile includes a dynamic QR code you can save or print. Anyone can scan it from your screen or printed materials, even without internet on your end.' },
];

export default function Home() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 15420, cards: 52100 });

  useEffect(() => {
    try { if (localStorage.getItem('dash-theme') === 'dark') setTheme('dark'); } catch {}

    (async () => {
      try {
        const d = await apiFetch<{ users: number; cards: number }>('/api/homepage-stats');
        if (d && (d.users || d.cards)) setStats(d);
      } catch {}
    })();

    (async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/plans`);
        if (res.ok) setPlans(await res.json());
      } catch {}
    })();
  }, []);

  const isDark = theme === 'dark';
  const toggleTheme = () =>
    setTheme((p) => {
      const n = p === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('dash-theme', n); } catch {}
      return n;
    });

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    ...(plans.length ? [{ label: 'Pricing', href: '#pricing' }] : []),
    { label: 'FAQ', href: '#faq' },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease: 'easeOut' as const },
  };

  const fmtPrice = (p: string | number) => {
    const n = Number(p);
    return n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'Free';
  };

  return (
    <div className={`dash-scope ${isDark ? 'dark' : ''} min-h-screen antialiased`}>
      {/* ─────────────── NAV ─────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--d-border)] bg-[var(--d-header)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, var(--d-accent-2), var(--d-accent))' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12.55a8 8 0 0 1 14 0" /><path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" /></svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight">Card <span className="text-[var(--d-accent)]">Setu</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-[var(--d-text-muted)] transition-colors hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link href="/search" aria-label="Search cards" className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[var(--d-text-muted)] transition-colors hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--d-text-muted)] transition-colors hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link href="/dashboard" className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[var(--d-text-muted)] transition-colors hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 rounded-full border border-[var(--d-border)] px-3 py-2 text-sm font-medium text-[var(--d-text-muted)] transition-colors hover:border-rose-400 hover:text-rose-500">
                  <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link href="/login" className="hidden sm:inline rounded-full px-3 py-2 text-sm font-medium text-[var(--d-text-muted)] transition-colors hover:text-[var(--d-text)]">Sign In</Link>
                <Link href="/register" className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={navOpen} className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-[var(--d-text-muted)] hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {navOpen && (
          <nav className="md:hidden border-t border-[var(--d-border)] bg-[var(--d-surface)] px-4 py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setNavOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-[var(--d-text-muted)] transition-colors hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]">
                  {l.label}
                </a>
              ))}
              {!user && <Link href="/login" onClick={() => setNavOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-[var(--d-text-muted)]">Sign In</Link>}
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* ─────────────── HERO ─────────────── */}
        <section id="home" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* faint blueprint grid, masked to fade at the edges */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'linear-gradient(var(--d-border) 1px, transparent 1px), linear-gradient(90deg, var(--d-border) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse 85% 65% at 65% 35%, #000 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 65% 35%, #000 30%, transparent 75%)',
              }}
            />
            <div className="absolute right-[-8%] top-[6%] h-[540px] w-[760px] max-w-[110vw] rounded-full opacity-70 blur-3xl" style={{ background: 'radial-gradient(closest-side, var(--d-accent-soft), transparent)' }} />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-0 lg:min-h-[calc(100vh-4rem)]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--d-accent)]" /> The future of networking
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-balance">
                Networking,
                <span className="block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">reimagined.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--d-text-muted)] sm:text-lg">
                The premium digital business card for modern professionals. Share your identity instantly — backed by enterprise-grade security and analytics.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={user ? '/dashboard' : '/register'} className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40">
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="#features" className="inline-flex items-center justify-center rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] px-6 py-3.5 text-sm font-semibold text-[var(--d-text)] transition-colors hover:bg-[var(--d-hover)]">
                  Learn more
                </a>
              </div>

              <div className="mt-10 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-extrabold tabular-nums">{stats.users.toLocaleString()}+</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--d-text-faint)]">Professionals</div>
                </div>
                <div className="h-9 w-px bg-[var(--d-border)]" />
                <div>
                  <div className="text-2xl font-extrabold tabular-nums">{stats.cards.toLocaleString()}+</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--d-text-faint)]">Cards created</div>
                </div>
              </div>
            </motion.div>

            {/* Hero visual — interactive 3D card on desktop, fast CSS mockup on mobile/tablet */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }} className="relative">
              {/* Desktop: real-time 3D model (mouse-parallax, floating) */}
              <div className="relative hidden h-[520px] w-full lg:block">
                <HeroCard3D />
                <div className="absolute right-4 top-10 flex items-center gap-1.5 rounded-full bg-[var(--d-surface)] px-3 py-1.5 text-xs font-semibold shadow-[var(--d-shadow)] ring-1 ring-[var(--d-border)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" /> Live
                </div>
              </div>

              {/* Mobile & tablet: lightweight CSS card (no WebGL) */}
              <div className="relative mx-auto w-full max-w-sm lg:hidden">
                <div className="relative rounded-3xl border border-[var(--d-border)] bg-[var(--d-surface)] p-6 shadow-[var(--d-shadow)]">
                  <div className="h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />
                  <div className="-mt-10 flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--d-surface)] bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">DS</div>
                    <h3 className="mt-3 text-lg font-bold">Deepak Suthar</h3>
                    <p className="text-sm text-[var(--d-text-muted)]">Product Engineer</p>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-2.5">
                    {[Smartphone, QrCode, Users, CreditCard].map((Ic, i) => (
                      <div key={i} className="flex aspect-square items-center justify-center rounded-xl bg-[var(--d-surface-2)] text-[var(--d-accent)]"><Ic className="h-5 w-5" /></div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--d-surface-2)] px-4 py-3">
                    <span className="text-xs font-medium text-[var(--d-text-muted)]">cardsetu.com/deepak</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--d-surface)] text-[var(--d-text-muted)]"><QrCode className="h-4 w-4" /></span>
                  </div>
                </div>
                <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-[var(--d-surface)] px-3 py-1.5 text-xs font-semibold shadow-[var(--d-shadow)] ring-1 ring-[var(--d-border)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─────────────── FEATURES ─────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--d-accent)]">Everything you need</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">One card. Every connection.</h2>
            <p className="mt-4 text-[var(--d-text-muted)]">Purpose-built for the way professionals actually network today.</p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className={`rounded-2xl border border-[var(--d-border)] bg-[var(--d-surface)] p-6 shadow-[var(--d-shadow)] transition-transform hover:-translate-y-1 ${f.span}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--d-accent-soft)] text-[var(--d-accent)]"><f.icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--d-text-muted)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────────── HOW IT WORKS ─────────────── */}
        <section id="how-it-works" className="border-y border-[var(--d-border)] bg-[var(--d-surface-2)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--d-accent)]">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">Live in three steps</h2>
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((s, i) => (
                <motion.div key={s.num} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative rounded-2xl border border-[var(--d-border)] bg-[var(--d-surface)] p-7 shadow-[var(--d-shadow)]">
                  <span className="absolute right-6 top-6 font-mono text-4xl font-extrabold text-[var(--d-border)]">{s.num}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"><s.icon className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--d-text-muted)]">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────── PRICING (only when plans exist) ─────────────── */}
        {plans.length > 0 && (
          <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--d-accent)]">Pricing</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">Simple, honest plans</h2>
              <p className="mt-4 text-[var(--d-text-muted)]">Start free. Upgrade when you're ready.</p>
            </motion.div>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan: any, i: number) => {
                const popular = plan.is_popular || i === 1;
                const period = plan.billing_period === 'monthly' ? '/mo' : plan.billing_period === 'yearly' ? '/yr' : '';
                return (
                  <div key={plan.id ?? i} className={`flex flex-col rounded-2xl border bg-[var(--d-surface)] p-7 shadow-[var(--d-shadow)] ${popular ? 'border-[var(--d-accent)] ring-1 ring-[var(--d-accent)]' : 'border-[var(--d-border)]'}`}>
                    {popular && <span className="mb-3 w-max rounded-full bg-[var(--d-accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--d-accent)]">Most popular</span>}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <div className="mt-2 text-4xl font-extrabold">
                      {fmtPrice(plan.price)}
                      {Number(plan.price) > 0 && <span className="text-base font-normal text-[var(--d-text-muted)]">{period}</span>}
                    </div>
                    <ul className="mt-6 flex flex-1 flex-col gap-3">
                      {(plan.features || []).map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm text-[var(--d-text-muted)]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className={`mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition-all ${popular ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/30' : 'border border-[var(--d-border)] text-[var(--d-text)] hover:bg-[var(--d-hover)]'}`}>
                      Get started
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─────────────── FAQ ─────────────── */}
        <section id="faq" className="border-t border-[var(--d-border)] bg-[var(--d-surface-2)]">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <motion.div {...fadeUp} className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--d-accent)]">FAQ</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">Questions, answered</h2>
            </motion.div>
            <div className="mt-10 flex flex-col gap-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="overflow-hidden rounded-2xl border border-[var(--d-border)] bg-[var(--d-surface)]">
                    <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold sm:text-base">
                      {f.q}
                      <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--d-text-muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--d-text-muted)]">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────── CTA ─────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-14 text-center shadow-2xl sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%)' }} />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-balance">Ready to share smarter?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-indigo-100">Join thousands of professionals networking with a single tap.</p>
            <Link href={user ? '/dashboard' : '/register'} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5">
              {user ? 'Go to dashboard' : 'Create your card'} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, var(--d-accent-2), var(--d-accent))' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12.55a8 8 0 0 1 14 0" /><path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" /></svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight">Card <span className="text-[var(--d-accent)]">Setu</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--d-text-muted)]">The premium digital business card for modern professionals. Networking reimagined for the digital age.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-faint)]">Product</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--d-text-muted)]">
              <li><a href="#features" className="hover:text-[var(--d-text)]">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[var(--d-text)]">How it Works</a></li>
              {plans.length > 0 && <li><a href="#pricing" className="hover:text-[var(--d-text)]">Pricing</a></li>}
              <li><a href="#faq" className="hover:text-[var(--d-text)]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-faint)]">Legal</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--d-text-muted)]">
              <li><Link href="/privacy" className="hover:text-[var(--d-text)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--d-text)]">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-[var(--d-text)]">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--d-border)]">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-[var(--d-text-faint)] sm:px-6">
            &copy; {new Date().getFullYear()} Card Setu. All rights reserved.
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg>
      </a>
    </div>
  );
}
