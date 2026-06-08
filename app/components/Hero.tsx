'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Nfc, Sparkles, Zap } from 'lucide-react';
import { useDeviceTier } from '@/lib/useDeviceTier';

// The WebGL scene is client-only and code-split, so it never blocks the initial
// HTML/LCP and only ships to devices that will actually render it.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

/**
 * Pure CSS/SVG stand-in for the 3D card. Shown during SSR + first paint, and
 * permanently on devices with no WebGL or a reduced-motion preference — so every
 * visitor gets a polished, on-brand hero regardless of hardware.
 */
function StaticHeroArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="hero-float relative w-[80%] max-w-[440px] aspect-[1.6/1] rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-indigo-950/70 to-zinc-900 shadow-2xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/4 h-2/3 w-2/3 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute left-6 top-6 h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
        <Nfc className="absolute right-5 top-5 h-7 w-7 text-blue-300/80" />
        <div className="absolute bottom-6 left-6 h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-yellow-600 shadow-inner" />
        <div className="absolute bottom-7 right-6 h-3 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function Hero() {
  const cap = useDeviceTier();
  // `tier === null` (SSR / pre-detection) falls through to the static art.
  const showCanvas = cap.tier !== null && !cap.prefersStatic;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Backdrop layers */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_60%,transparent_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-16 pt-28 sm:px-6 md:pt-32 lg:min-h-[100svh] lg:grid-cols-2 lg:gap-12 lg:pb-0 lg:pt-0">
        {/* ── Copy ── */}
        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            The Future of Networking
          </div>

          <h1 className="mb-6 text-[2.75rem] font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              One Tap.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Infinite Connections.
            </span>
          </h1>

          <p className="mb-9 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl">
            The premium NFC business card for modern professionals. Share your entire digital
            identity with a single tap — no app required.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 px-8 py-4 font-semibold text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-blue-400" /> Instant setup
            </span>
            <span className="flex items-center gap-1.5">
              <Nfc size={14} className="text-blue-400" /> Works on every phone
            </span>
          </div>
        </div>

        {/* ── Visual: 3D scene or static fallback ── */}
        <div className="relative h-[340px] w-full sm:h-[420px] lg:h-[600px]">
          {showCanvas ? (
            <HeroScene tier={cap.tier!} isTouch={cap.isTouch} maxDpr={cap.maxDpr} />
          ) : (
            <StaticHeroArt />
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold tracking-[0.25em] text-zinc-600">
        <span>SCROLL</span>
        <div className="h-8 w-px bg-gradient-to-b from-zinc-600 to-transparent" />
      </div>
    </section>
  );
}
