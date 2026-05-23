'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-white overflow-hidden flex flex-col justify-center items-center">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-6 max-w-5xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Card Setu
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 px-4 transition-colors backdrop-blur-sm">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Welcome to Card Setu
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent"
        >
          Your Bridge to a <br />
          <span className="text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text">Premium Digital Presence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed"
        >
          Create stunning, interactive digital cards that showcase your professional identity. 
          Connect, share, and manage your contacts with a single tap.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/c/demo" className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]">
            <span className="relative z-10">View Demo Card</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-sm">
            Contact Sales
          </button>
        </motion.div>

        {/* Floating Cards (Decorative) */}
        <div className="mt-24 relative w-full max-w-2xl h-64 hidden md:block">
          <motion.div
            initial={{ opacity: 0, rotate: -5, x: -50 }}
            animate={{ opacity: 1, rotate: -10, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute top-0 left-10 w-64 h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-full mb-4 flex items-center justify-center">
              <span className="text-blue-400 font-bold">JD</span>
            </div>
            <div className="w-3/4 h-4 bg-white/10 rounded mb-2" />
            <div className="w-1/2 h-3 bg-white/5 rounded" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 5, x: 50 }}
            animate={{ opacity: 1, rotate: 12, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute top-10 right-10 w-64 h-40 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full mb-4 flex items-center justify-center">
              <span className="text-indigo-400 font-bold">AS</span>
            </div>
            <div className="w-3/4 h-4 bg-white/10 rounded mb-2" />
            <div className="w-1/2 h-3 bg-white/5 rounded" />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
