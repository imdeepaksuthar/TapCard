'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Search, Sun, Moon, LayoutDashboard, LogOut, Menu, X, Eye, ArrowRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hasPlans, setHasPlans] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

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
    try {
      const storedTheme = localStorage.getItem('dash-theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    const sections = ['home', 'features', 'how-it-works', 'pricing', 'faq'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasPlans]);

  const isDark = theme === 'dark';
  const toggleTheme = () =>
    setTheme((p) => {
      const n = p === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('dash-theme', n); } catch {}
      if (n === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      return n;
    });

  const navLinks = [
    { label: 'Home', href: isLandingPage ? '#home' : '/#home', id: 'home' },
    { label: 'Features', href: isLandingPage ? '#features' : '/#features', id: 'features' },
    { label: 'How it Works', href: isLandingPage ? '#how-it-works' : '/#how-it-works', id: 'how-it-works' },
    ...(hasPlans ? [{ label: 'Pricing', href: isLandingPage ? '#pricing' : '/#pricing', id: 'pricing' }] : []),
    { label: 'FAQ', href: isLandingPage ? '#faq' : '/#faq', id: 'faq' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-[#0A0F19]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-[14px] text-white shadow-md transition-transform duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--d-accent-2), var(--d-accent))' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]"><path d="M5 12.55a8 8 0 0 1 14 0" /><path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" /><circle cx="12" cy="19" r="1.5" /></svg>
            </span>
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Card<span className="text-indigo-600 dark:text-indigo-400">Setu</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            {navLinks.map((l) => {
              const isActive = isLandingPage && activeSection === l.id;
              return (
                <Link 
                  key={l.label} 
                  href={l.href} 
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
                    isActive 
                      ? 'bg-white text-indigo-600 shadow-md dark:bg-white/10 dark:text-white ring-1 ring-black/5 dark:ring-white/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-indigo-500/5'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => document.getElementById('header-search-input')?.focus(), 100); }}
              aria-label="Search cards" 
              className={`hidden sm:flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                searchOpen
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-white/10'
              }`}
            >
              <Search className="h-5 w-5" />
            </button>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-white/10 transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors">
                  <LayoutDashboard className="h-[18px] w-[18px]" /> Dashboard
                </Link>
                <button onClick={logout} className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</Link>
                <Link href="/register" className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu" className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-1">
              {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu animated drawer */}
        <AnimatePresence>
          {navOpen && (
            <motion.nav 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-gray-200/50 dark:border-white/5 bg-white dark:bg-[#0A0F19]"
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((l) => {
                const isActive = isLandingPage && activeSection === l.id;
                return (
                  <Link 
                    key={l.label} 
                    href={l.href} 
                    onClick={() => setNavOpen(false)} 
                    className={`rounded-2xl px-5 py-3.5 text-base font-bold transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400'
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
                
                <div className="my-2 h-px bg-gray-200/50 dark:bg-white/5" />
                
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setNavOpen(false)} className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-white/5 transition-colors">
                      <LayoutDashboard className="h-5 w-5 text-gray-400" /> Dashboard
                    </Link>
                    <button onClick={() => { logout(); setNavOpen(false); }} className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-base font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors text-left">
                      <LogOut className="h-5 w-5" /> Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <Link href="/login" onClick={() => setNavOpen(false)} className="rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-3.5 text-center text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setNavOpen(false)} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-center text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Search Panel (fixed full-width overlay) ── */}
      {searchOpen && (
        <div className="fixed inset-0 top-0 z-[60] pointer-events-none flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md pointer-events-auto"
            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            ref={searchRef}
            className="relative w-[calc(100%-2rem)] max-w-2xl pointer-events-auto"
          >
            <div className="rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/90 dark:bg-[#0A0F19]/90 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
              {/* Search Input Area */}
              <div className="relative flex items-center border-b border-gray-100 dark:border-white/5 px-5 py-2">
                <Search size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search professionals, skills, or companies..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                      setSearchOpen(false);
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg py-4 pl-4 pr-12 outline-none border-none focus:ring-0 focus:border-transparent focus:outline-none shadow-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                
                {searchQuery ? (
                  <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/10 rounded-full p-1.5">
                    <X size={14} />
                  </button>
                ) : (
                  <div className="absolute right-5 flex items-center gap-1">
                    <kbd className="text-[11px] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded px-2 py-1 font-mono hidden sm:inline-block shadow-sm">ESC</kbd>
                  </div>
                )}
                
                {isSearching && (
                  <div className="absolute right-14">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Results Area */}
              <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                {searchQuery.length >= 2 ? (
                  searchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Results</div>
                      {searchResults.map((card: any) => (
                        <Link
                          key={card.slug}
                          href={`/${card.slug}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="group flex items-center gap-4 px-3 py-3 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                          {card.image ? (
                            <img src={card.image} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-white/10 group-hover:shadow-md transition-shadow" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center shrink-0 ring-1 ring-gray-200 dark:ring-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-base group-hover:shadow-md transition-all">
                              {(card.name || '?')[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{card.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {[card.designation, card.company].filter(Boolean).join(' \u00b7 ') || card.slug}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 shrink-0 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium">View Profile</span>
                            <ArrowRight size={14} />
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => { setSearchOpen(false); }}
                        className="mt-2 block w-full text-center py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-colors font-semibold"
                      >
                        See all results for &ldquo;{searchQuery}&rdquo; &rarr;
                      </Link>
                    </div>
                  ) : !isSearching ? (
                    <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">No results found for &ldquo;{searchQuery}&rdquo;</p>
                      <p className="mt-1 text-sm text-gray-500">Try searching for a different name or skill.</p>
                    </div>
                  ) : null
                ) : (
                  <div className="px-4 py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-sm">Search the network</p>
                    <p className="mt-1 text-sm text-gray-500">Find professionals by name, company, or skills.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
