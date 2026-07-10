'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Smartphone, QrCode, Sparkles, User, Link as LinkIcon, Share2, ArrowRight } from 'lucide-react';
import React from 'react';

export default function AnimatedHeroCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  // Move the shine strictly based on mouse
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ['100%', '0%']);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ['100%', '0%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative flex items-center justify-center h-full w-full" style={{ perspective: 1500 }}>
      {/* Floating Badges */}
      <motion.div 
        animate={{ y: [0, -12, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-2 sm:-right-6 top-16 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-xl hidden sm:flex"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <Share2 className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-white">12k+ Scans</p>
          <p className="text-[10px] text-indigo-200 font-medium">This month</p>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 12, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-2 sm:-left-8 bottom-24 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-xl hidden sm:flex"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-white">NFC Enabled</p>
          <p className="text-[10px] text-indigo-200 font-medium">Tap to share</p>
        </div>
      </motion.div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-[320px] sm:w-[350px] h-[520px] rounded-[32px] border border-white/10 bg-gradient-to-b from-[#131A2D] to-[#0A0F19] shadow-2xl p-7 cursor-pointer"
      >
        {/* Dynamic Shine Layer */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 rounded-[32px] overflow-hidden"
          style={{
            background: `radial-gradient(800px circle at ${shineX} ${shineY}, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />

        {/* Card Content (Z-translation creates the 3D depth) */}
        <div style={{ transform: "translateZ(50px)" }} className="relative z-20 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/10">
              <span className="font-bold text-xl tracking-tight">DS</span>
            </div>
            <div className="rounded-full bg-white/5 border border-white/10 p-2.5 backdrop-blur-md">
              <QrCode className="h-5 w-5 text-indigo-300" />
            </div>
          </div>

          {/* Body */}
          <div className="mt-10 flex-1">
            <h3 className="text-[28px] font-extrabold text-white tracking-tight leading-none">Deepak Suthar</h3>
            <p className="text-sm font-semibold text-indigo-400 mt-2">Product Engineer</p>

            <div className="mt-10 space-y-5">
              {[
                { icon: User, label: "+91 99838 78055" },
                { icon: Sparkles, label: "hello@cardsetu.com" },
                { icon: LinkIcon, label: "www.cardsetu.com" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/5 text-indigo-300">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[15px] font-medium text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 p-4 backdrop-blur-sm group hover:bg-white/10 transition-colors">
              <div>
                <p className="text-[13px] font-semibold text-gray-200">Save to Contacts</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Works on iOS & Android</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-400 transition-colors">
                <ArrowRight className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background glow behind the card */}
        <div 
          className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl transition-opacity duration-500" 
          style={{ transform: "translateZ(-20px)", opacity: 0.8 }} 
        />
      </motion.div>
    </div>
  );
}
