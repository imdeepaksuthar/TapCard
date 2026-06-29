'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, X, Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/cards/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch { /* ignore */ }
      finally { setIsSearching(false); }
    }, 300);
  }, []);

  useEffect(() => {
    // 1. Simple passive scroll listener for the header background
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. Performant Intersection Observer for Scroll Spy
    const sections = ['home', 'features', 'how-it-works', 'pricing', 'faq'];
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

    const observed = new Set<string>();
    
    const observeElements = () => {
      sections.forEach(id => {
        if (!observed.has(id)) {
          const el = document.getElementById(id);
          if (el) {
            observer.observe(el);
            observed.add(id);
          }
        }
      });
    };

    observeElements();
    
    // Check periodically for asynchronously rendered sections like pricing
    const interval = setInterval(observeElements, 500);

    // 3. Close search on ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API}/api/plans`);
        if (res.ok) {
          const plansData = await res.json();
          if (plansData && plansData.length > 0) setHasPlans(true);
        }
      } catch { /* ignore */ }
    };
    fetchPlans();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 sm:px-6">
      <header
        className={`flex justify-between items-center w-full pointer-events-auto transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'max-w-4xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] rounded-full py-2.5 px-5 mt-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset] ring-1 ring-blue-500/5'
            : 'max-w-5xl bg-transparent border border-transparent rounded-none py-6 px-0 mt-0'
        }`}
        style={isScrolled ? {
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)',
        } : {}}
      >
        {/* Top shimmer line when scrolled */}
        {isScrolled && (
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full pointer-events-none" />
        )}

        <Link href="/" className="flex items-center group">
          <img src="/logo-dark.png" alt="Card Setu Logo" className="h-8 sm:h-9 w-auto group-hover:opacity-90 transition-opacity duration-200" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded-full p-1 backdrop-blur-xl">
          {[
            { id: 'home', label: 'Home', href: '/#home' },
            { id: 'features', label: 'Features', href: '/#features' },
            { id: 'how-it-works', label: 'How it Works', href: '/#how-it-works' },
            { id: 'pricing', label: 'Pricing', href: '/#pricing' },
            { id: 'faq', label: 'FAQ', href: '/#faq' },
          ].filter(item => item.id !== 'pricing' || hasPlans).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-sm font-medium transition-all duration-300 px-4 py-1.5 rounded-full ${
                activeSection === item.id || (item.id === 'home' && activeSection === '')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 items-center">
          {/* Search Toggle Button */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('header-search-input')?.focus(), 100); }}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                searchOpen
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
              }`}
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap px-3 py-2 rounded-full hover:bg-white/[0.06]"
              >
                <User size={15} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-full py-2 px-3 transition-all duration-300 whitespace-nowrap"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full py-2 px-4 sm:px-5 transition-all duration-300 whitespace-nowrap shadow-lg shadow-blue-500/25 hover:-translate-y-px hover:shadow-blue-500/40"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          aria-label="Toggle mobile menu"
          className="md:hidden p-2 ml-1 text-zinc-400 hover:text-white pointer-events-auto rounded-full hover:bg-white/[0.06] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`absolute top-[calc(100%+10px)] left-4 right-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col md:hidden pointer-events-auto transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100 p-3' : 'max-h-0 opacity-0 p-0 border-transparent'
        }`}
      >
        {[
          { id: 'home', label: 'Home', href: '/#home' },
          { id: 'features', label: 'Features', href: '/#features' },
          { id: 'how-it-works', label: 'How it Works', href: '/#how-it-works' },
          { id: 'pricing', label: 'Pricing', href: '/#pricing' },
          { id: 'faq', label: 'FAQ', href: '/#faq' },
        ].filter(item => item.id !== 'pricing' || hasPlans).map((item) => (
          <Link 
            key={item.id} 
            href={item.href} 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-base font-medium px-4 py-3.5 rounded-xl transition-colors ${
              activeSection === item.id || (item.id === 'home' && activeSection === '')
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* ── Search Panel (fixed full-width overlay) ── */}
      {searchOpen && (
        <div className="fixed inset-0 top-0 z-[60] pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
          />
          {/* Panel */}
          <div
            ref={searchRef}
            className="absolute left-1/2 -translate-x-1/2 top-[70px] w-[calc(100%-2rem)] max-w-[480px] pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/[0.98] backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Search Input */}
              <div className="relative flex items-center border-b border-zinc-800/60 px-4">
                <Search size={16} className="text-zinc-500 shrink-0" />
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search business cards..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                      setSearchOpen(false);
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-4 pl-3 pr-10 outline-none"
                />
                {searchQuery ? (
                  <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                ) : (
                  <kbd className="absolute right-4 text-[10px] text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5 font-mono hidden sm:inline">ESC</kbd>
                )}
                {isSearching && (
                  <div className="absolute right-4">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Results */}
              {searchQuery.length >= 2 && (
                <div className="max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((card: any) => (
                        <Link
                          key={card.slug}
                          href={`/${card.slug}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-zinc-800/30 last:border-b-0"
                        >
                          {card.image ? (
                            <img src={card.image} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                              <span className="text-sm font-bold text-white/70">{(card.name || '?')[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">{card.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {[card.designation, card.company].filter(Boolean).join(' \u00b7 ') || card.slug}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-600 shrink-0">
                            <Eye size={11} />
                            <span className="text-[10px] font-medium">{card.views?.toLocaleString()}</span>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => { setSearchOpen(false); }}
                        className="block w-full text-center py-3 text-sm text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors font-medium border-t border-zinc-800/60"
                      >
                        See all results for &ldquo;{searchQuery}&rdquo; &rarr;
                      </Link>
                    </>
                  ) : !isSearching ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                      No cards found for &ldquo;{searchQuery}&rdquo;
                      <div className="mt-2 text-xs text-zinc-600">Press Enter to search all fields</div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Empty state */}
              {searchQuery.length < 2 && (
                <div className="px-4 py-6 text-center text-zinc-600 text-xs">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
