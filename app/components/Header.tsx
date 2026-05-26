'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // 1. Simple passive scroll listener for the header background
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. Performant Intersection Observer for Scroll Spy
    const sections = ['features', 'how-it-works', 'pricing', 'faq'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: '-40% 0px -40% 0px', // Triggers when section is near the middle
      threshold: 0
    });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 sm:px-6">
      <header
        className={`flex justify-between items-center w-full pointer-events-auto transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'max-w-4xl bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full py-3 px-6 mt-4 shadow-2xl shadow-blue-500/10'
            : 'max-w-5xl bg-transparent border border-transparent rounded-none py-6 px-0 mt-0'
        }`}
      >
        <Link
          href="/"
          className="flex items-center"
        >
          <img src="/logo-dark.png" alt="Card Setu Logo" className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
          {[
            { id: 'features', label: 'Features' },
            { id: 'how-it-works', label: 'How it Works' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'faq', label: 'FAQ' },
          ].map((item) => (
            <Link 
              key={item.id} 
              href={`#${item.id}`} 
              className={`text-sm font-medium transition-all duration-300 px-4 py-1.5 rounded-full ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                <User size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-full py-2 px-4 transition-colors whitespace-nowrap"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2 px-4 sm:px-5 transition-colors backdrop-blur-sm whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
