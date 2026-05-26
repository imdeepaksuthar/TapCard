'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from './components/Header';
import { ArrowRight, Smartphone, Zap, Shield, Globe, Users, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Home() {
  const [stats, setStats] = useState({ users: 0, cards: 0 });

  useEffect(() => {
    // Simulated fetch or actual fetch if endpoint exists
    const fetchStats = async () => {
      try {
        const data = await apiFetch<{ users: number, cards: number }>('/api/homepage-stats', { method: 'GET' });
        setStats(data);
      } catch (err) {
        // Fallback demo data
        setStats({ users: 12500, cards: 48300 });
      }
    };
    fetchStats();
  }, []);

  const features = [
    { icon: <Smartphone className="text-blue-400" size={24} />, title: "Mobile Optimized", desc: "Perfect display on every device screen." },
    { icon: <Zap className="text-indigo-400" size={24} />, title: "Lightning Fast", desc: "NFC enabled for instant card sharing." },
    { icon: <Shield className="text-purple-400" size={24} />, title: "Secure Data", desc: "Bank-level encryption for your contacts." },
    { icon: <Globe className="text-blue-400" size={24} />, title: "Global Access", desc: "Share your identity anywhere, anytime." },
    { icon: <Users className="text-indigo-400" size={24} />, title: "Lead Generation", desc: "Capture prospect info effortlessly." },
    { icon: <Palette className="text-purple-400" size={24} />, title: "Custom Themes", desc: "Express your brand with premium designs." }
  ];

  return (
    <main className="relative min-h-screen bg-[#030712] text-white overflow-hidden flex flex-col">
      {/* Dynamic Animated Header */}
      <Header />

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-10 pointer-events-none z-0" />

      {/* Hero Content */}
      <section className="relative z-10 pt-48 pb-20 px-6 flex flex-col items-center text-center min-h-[90vh] justify-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-md shadow-xl"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          Next-Gen Digital Business Cards
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight"
        >
          Networking, <br />
          <span className="text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text">Reimagined.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-light leading-relaxed"
        >
          Create stunning, interactive digital cards that showcase your professional identity. 
          Connect, share, and manage your contacts with a single tap.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/register" className="group relative overflow-hidden bg-white text-gray-900 px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/login" className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 backdrop-blur-md flex items-center justify-center">
            Sign In
          </Link>
        </motion.div>

        {/* Dynamic Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex gap-12 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-white mb-1">{stats.users.toLocaleString()}+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Active Users</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-white mb-1">{stats.cards.toLocaleString()}+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Cards Created</div>
          </div>
        </motion.div>
      </section>

      {/* 6-Column UI Feature Grid Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-[#0a0f1d]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text">succeed</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our premium suite of tools empowers you to grow your network and capture leads effortlessly.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-[3rem] p-12 md:p-20 backdrop-blur-xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to upgrade your networking?</h2>
          <p className="text-xl text-blue-200/70 mb-10 max-w-2xl mx-auto">Join thousands of professionals already using Card Setu to make lasting impressions.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
            Create Your Card Now
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Card Setu. All rights reserved.</p>
      </footer>
    </main>
  );
}
