'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import { ArrowRight, Smartphone, Zap, Shield, Globe, Users, Palette, CheckCircle2, QrCode, Contact, Share2, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState({ users: 0, cards: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroProgress, setHeroProgress] = useState(0);
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

  useEffect(() => {
    const onScroll = () => {
      const heroH = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / heroH));
      setHeroProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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

      {/* Fixed scroll-driven 3D scene — sits behind hero, naturally hidden when later sections (with solid backgrounds) scroll over it */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene3D scrollProgress={heroProgress} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-6 flex flex-col items-center justify-center text-center min-h-screen overflow-hidden">

        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Apple-style subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

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
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-20"
          >
            <Link href="/register" className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-8 py-4 rounded-full font-semibold text-white transition-colors flex items-center justify-center">
              Sign In
            </Link>
          </motion.div>

          {/* Spacer to push scroll-cue down — the real 3D card lives in the fixed canvas behind */}
          <div className="mt-20 h-[320px] sm:h-[420px] pointer-events-none" />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 text-[10px] tracking-[0.3em] font-semibold z-10"
        >
          <span>SCROLL TO EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent"
          />
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="relative z-10 py-32 px-6">
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
      <section id="how-it-works" className="relative bg-zinc-950 py-32 px-6 border-t border-zinc-900">
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


      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-black border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Simple, transparent <br/> <span className="text-zinc-500">pricing.</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-zinc-400 mb-6 text-sm">Perfect for individuals starting out.</p>
              <div className="text-4xl font-bold mb-8">Free</div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> 1 Digital Business Card</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Basic Analytics</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Standard Templates</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors font-medium">Get Started</Link>
            </motion.div>

            {/* Pro */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-b from-blue-900/20 to-zinc-900 border border-blue-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-zinc-400 mb-6 text-sm">For active professionals.</p>
              <div className="text-4xl font-bold mb-8">$5<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Unlimited Cards</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Advanced Analytics</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Custom NFC Programming</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Lead Capture</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors font-medium">Upgrade to Pro</Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-zinc-400 mb-6 text-sm">For teams and companies.</p>
              <div className="text-4xl font-bold mb-8">Custom</div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Team Management</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Centralized Billing</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> CRM Integrations</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Dedicated Manager</li>
              </ul>
              <Link href="/contact" className="block text-center w-full py-3 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors font-medium">Contact Sales</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400">Everything you need to know about the product and billing.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: 'How does the NFC card work?', a: 'Our NFC cards contain a tiny microchip that sends your digital profile link to any modern smartphone when tapped against it. No app is required by the receiver.' },
              { q: 'Can I update my info after sharing?', a: 'Yes! Your card links to your digital profile. Any updates you make in your dashboard are instantly reflected for anyone who has your link or taps your card.' },
              { q: 'Is there a monthly fee?', a: 'The basic digital profile is 100% free forever. We offer a Pro plan for $5/month that includes advanced analytics, custom colors, and lead capture features.' },
              { q: 'What if they don\'t have NFC?', a: 'Every digital profile comes with a dynamic QR code. You can have them scan the QR code from your phone screen or print it on physical marketing materials.' }
            ].map((faq, i) => (
              <div key={i} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 font-medium flex justify-between items-center focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`transform transition-transform duration-300 text-zinc-500 ${openFaq === i ? 'rotate-180' : ''}`} size={20} />
                </button>
                <div className={`px-6 pb-5 text-zinc-400 text-sm overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pb-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
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


      {/* Comprehensive Footer */}
      <footer className="border-t border-zinc-900 bg-black pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="Card Setu" className="h-8 mb-6" />
            <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
              The premium digital business card for modern professionals. Networking reimagined with a single tap.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} Card Setu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-zinc-400 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}