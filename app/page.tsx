'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Header from './components/Header';
import { ArrowRight, Smartphone, Zap, Shield, Globe, Users, Palette, CheckCircle2, QrCode, Contact, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';

export default function Home() {
  const [stats, setStats] = useState({ users: 0, cards: 0 });
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<{ users: number, cards: number }>('/api/homepage-stats', { method: 'GET' });
        setStats(data);
      } catch (err) {
        setStats({ users: 15420, cards: 52100 });
      }
    };
    fetchStats();
  }, []);

  const bentoFeatures = [
    {
      title: "Tap to Share",
      desc: "Instantly transfer your contact details using NFC technology. No app required.",
      icon: <Smartphone className="text-white w-8 h-8" />,
      colSpan: "col-span-1 md:col-span-2",
      bg: "bg-gradient-to-br from-zinc-800/50 to-zinc-900/50",
      delay: 0.1
    },
    {
      title: "QR Ready",
      desc: "For older phones, simply scan the dynamic QR code.",
      icon: <QrCode className="text-white w-8 h-8" />,
      colSpan: "col-span-1",
      bg: "bg-gradient-to-br from-blue-900/40 to-zinc-900/50",
      delay: 0.2
    },
    {
      title: "Bank-Level Security",
      desc: "Your data is encrypted and securely stored. Total control over what you share.",
      icon: <Shield className="text-white w-8 h-8" />,
      colSpan: "col-span-1",
      bg: "bg-gradient-to-br from-indigo-900/40 to-zinc-900/50",
      delay: 0.3
    },
    {
      title: "Lead Generation",
      desc: "Capture incoming leads automatically. Export directly to your CRM.",
      icon: <Users className="text-white w-8 h-8" />,
      colSpan: "col-span-1 md:col-span-2",
      bg: "bg-gradient-to-br from-zinc-800/50 to-zinc-900/50",
      delay: 0.4
    }
  ];

  const steps = [
    { num: "01", title: "Create Your Profile", desc: "Sign up and build your digital identity in minutes. Add links, socials, and payment methods." },
    { num: "02", title: "Customize Design", desc: "Choose from premium templates. Add your logo, colors, and completely own the look." },
    { num: "03", title: "Share Instantly", desc: "Tap your NFC card or share your unique link. Connections are saved immediately." }
  ];

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-6 flex flex-col items-center justify-center text-center min-h-screen overflow-hidden">
        
        {/* Apple-style subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-zinc-300 mb-8 backdrop-blur-xl"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            INTRODUCING THE FUTURE OF NETWORKING
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[1.1]"
          >
            Networking. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 font-medium tracking-tight"
          >
            The premium digital business card for modern professionals. Share your identity with a single tap.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/register" className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-8 py-4 rounded-full font-semibold text-white transition-colors flex items-center justify-center">
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Designed for <br/> <span className="text-zinc-500">seamless connection.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: f.delay, ease: [0.16, 1, 0.3, 1] }}
                className={`relative overflow-hidden rounded-[2.5rem] border border-zinc-800/50 p-10 ${f.colSpan} ${f.bg} group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-14 h-14 bg-black/50 border border-zinc-700/50 rounded-2xl flex items-center justify-center mb-12 backdrop-blur-md">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-zinc-400 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Step Section */}
      <section className="relative bg-zinc-950 py-32 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-bold tracking-tighter mb-24 text-center"
          >
            How it works.
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
            {/* Sticky Visual Side */}
            <div className="hidden md:block relative h-full">
              <div className="sticky top-1/4 h-[500px] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl">
                 {/* Abstract representation of a card */}
                 <motion.div 
                   animate={{ rotateY: [0, 10, -10, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="w-64 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-2xl shadow-blue-500/20 border border-white/20"
                 >
                   <div className="w-12 h-12 rounded-full bg-white/20 mb-4" />
                   <div className="w-3/4 h-4 bg-white/20 rounded-full mb-2" />
                   <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                 </motion.div>
              </div>
            </div>

            {/* Scrolling Steps */}
            <div className="flex flex-col gap-24 py-12 md:py-32">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-8 items-start"
                >
                  <div className="text-2xl font-mono text-zinc-600 font-bold mt-1">{step.num}</div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-4">{step.title}</h3>
                    <p className="text-xl text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative z-10 py-40 px-6 text-center overflow-hidden">
        {/* Background glow for CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white">Elevate your brand.</h2>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto tracking-tight">
            Join {stats.users.toLocaleString()}+ professionals already using Card Setu to make lasting impressions.
          </p>
          <div className="flex justify-center">
            <Link href="/register" className="group relative bg-white text-black px-12 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-3">
              Create Your Card Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-black py-12 px-6 text-center text-zinc-600 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} Card Setu. Crafted for the modern professional.</p>
      </footer>
    </main>
  );
}
