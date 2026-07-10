'use client';
import Header from './components/Header';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  ArrowRight, Smartphone, Zap, Shield, Users, QrCode, CreditCard, Palette,
  Check, ChevronDown, Menu, X, Sun, Moon, Search, Sparkles, LogOut, LayoutDashboard,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Interactive 3D hero card — client-only, lazy-loaded so it never blocks first paint.
import AnimatedHeroCard from './components/AnimatedHeroCard';

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
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 15420, cards: 52100 });

  useEffect(() => {
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

  const fadeUp = {
    initial: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease: 'easeOut' as const },
  };

  const fmtPrice = (p: string | number) => {
    const n = Number(p);
    return n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'Free';
  };

  return (
    <div className="dash-scope min-h-screen antialiased">
      <Header />

      <main>
        {/* ─────────────── HERO ─────────────── */}
        <section id="home" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* faint blueprint grid, masked to fade at the edges */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm39 39V1H1v38h38z' fill='%236366f1' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
              }}
            />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-0 lg:min-h-[calc(100vh-4rem)]">
            <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" /> The future of networking
              </span>
              <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-7xl text-balance">
                Networking, <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent ag-shimmer-text">reimagined.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-[var(--d-text-muted)] sm:text-xl">
                The premium digital business card for modern professionals. Share your identity instantly — backed by enterprise-grade security and analytics.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={user ? '/dashboard' : '/register'} className="ag-glow-btn flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#features" className="flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-4 text-sm font-bold text-gray-900 dark:text-white shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/10">
                  Learn more
                </Link>
              </div>

              {/* Trust markers */}
              <div className="mt-10 flex items-center gap-8 border-t border-[var(--d-border)] pt-8">
                <div>
                  <p className="text-2xl font-black text-[var(--d-text)]">12,005+</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] mt-1">Professionals</p>
                </div>
                <div className="h-10 w-px bg-[var(--d-border)]" />
                <div>
                  <p className="text-2xl font-black text-[var(--d-text)]">45,002+</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text-muted)] mt-1">Cards created</p>
                </div>
              </div>
            </motion.div>

            {/* Hero visual — Interactive 3D CSS Card */}
            <motion.div initial={{ opacity: 1, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }} className="relative">
              <div className="relative h-[520px] w-full hidden lg:block">
                <AnimatedHeroCard />
                <div className="absolute right-4 top-10 z-30 flex items-center gap-2 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-semibold shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Live
                </div>
              </div>

              {/* Mobile & tablet fallback (can still use the AnimatedHeroCard since it's lightweight!) */}
              <div className="relative mx-auto w-full max-w-sm lg:hidden h-[520px]">
                 <AnimatedHeroCard />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─────────────── FEATURES ─────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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
          <section id="pricing" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
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


      </main>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
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
