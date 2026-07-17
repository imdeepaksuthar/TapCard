'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Building2, Eye, Filter, Loader2, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [designation, setDesignation] = useState(searchParams.get('designation') || '');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch results whenever params change
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Build query string
        const params = new URLSearchParams({
          paginate: 'true',
          page: page.toString(),
        });
        
        if (q) params.append('q', q);
        if (location) params.append('location', location);
        if (designation) params.append('designation', designation);
        if (company) params.append('company', company);

        const res = await fetch(`${API}/api/cards/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
          setPagination({
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
          });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q, location, designation, company, page]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (location) params.append('location', location);
    if (designation) params.append('designation', designation);
    if (company) params.append('company', company);
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setQ('');
    setLocation('');
    setDesignation('');
    setCompany('');
    setPage(1);
    router.push('/search', { scroll: false });
  };

  return (
    <div className="dash-scope min-h-screen bg-[var(--d-bg)] text-[var(--d-text)] selection:bg-blue-500/30 transition-colors duration-200">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.02] dark:opacity-5 pointer-events-none" />
      
      <Header />

      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        
        {/* Search Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Professionals</span>
          </h1>
          <p className="text-[var(--d-text-muted)] text-lg">
            Find the right connections by name, company, role, or location.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            
            {/* Mobile Filter Toggle */}
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl px-4 py-3 font-semibold hover:bg-[var(--d-hover)] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Advanced Filters</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Form */}
            <div className={`space-y-6 lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <form onSubmit={handleSearch} className="bg-[var(--d-surface)] border border-[var(--d-border)] rounded-2xl p-6 backdrop-blur-xl shadow-[var(--d-shadow)]">
                
                <div className="space-y-5">
                  {/* Global Search */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--d-text-muted)] uppercase tracking-wider mb-2">Search</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--d-text-faint)]" />
                      <input
                        type="text"
                        placeholder="Name, keyword..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full bg-[var(--d-bg)] border border-[var(--d-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--d-text)] placeholder-[var(--d-text-faint)] focus:outline-none focus:border-[var(--d-accent)] focus:ring-1 focus:ring-[var(--d-accent)]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--d-text-muted)] uppercase tracking-wider mb-2">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--d-text-faint)]" />
                      <input
                        type="text"
                        placeholder="City, State, Country..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-[var(--d-bg)] border border-[var(--d-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--d-text)] placeholder-[var(--d-text-faint)] focus:outline-none focus:border-[var(--d-accent)] focus:ring-1 focus:ring-[var(--d-accent)]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--d-text-muted)] uppercase tracking-wider mb-2">Designation</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--d-text-faint)]" />
                      <input
                        type="text"
                        placeholder="CEO, Developer, Manager..."
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-[var(--d-bg)] border border-[var(--d-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--d-text)] placeholder-[var(--d-text-faint)] focus:outline-none focus:border-[var(--d-accent)] focus:ring-1 focus:ring-[var(--d-accent)]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--d-text-muted)] uppercase tracking-wider mb-2">Company</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--d-text-faint)]" />
                      <input
                        type="text"
                        placeholder="Company name..."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-[var(--d-bg)] border border-[var(--d-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--d-text)] placeholder-[var(--d-text-faint)] focus:outline-none focus:border-[var(--d-accent)] focus:ring-1 focus:ring-[var(--d-accent)]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20"
                  >
                    Apply Filters
                  </button>
                  
                  {(q || location || designation || company) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full bg-[var(--d-hover)] hover:bg-[var(--d-border-strong)] text-[var(--d-text)] font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 w-full">
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--d-border)]">
              <h2 className="text-xl font-bold">
                {isLoading ? (
                  <span className="flex items-center gap-2 text-[var(--d-text-muted)]">
                    <Loader2 size={20} className="animate-spin text-indigo-500" /> Searching...
                  </span>
                ) : pagination?.total > 0 ? (
                  <span>Found <span className="text-indigo-600 dark:text-indigo-400">{pagination.total}</span> professionals</span>
                ) : (
                  <span className="text-[var(--d-text-muted)]">No results found</span>
                )}
              </h2>
            </div>

            {/* Results Grid */}
            {!isLoading && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-[var(--d-border)] rounded-3xl bg-[var(--d-surface)]/20 shadow-sm">
                <div className="w-16 h-16 bg-[var(--d-hover)] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[var(--d-text-muted)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">No profiles found</h3>
                <p className="text-[var(--d-text-muted)] max-w-sm text-sm">
                  We couldn't find anyone matching your current filters. Try adjusting your search criteria or clearing filters.
                </p>
                {(q || location || designation || company) && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-2 bg-[var(--d-surface)] hover:bg-[var(--d-hover)] border border-[var(--d-border)] rounded-full text-sm font-semibold transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/${card.slug}`}
                    className="group relative bg-[var(--d-surface)] hover:bg-[var(--d-hover)] border border-[var(--d-border)] hover:border-[var(--d-border-strong)] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--d-shadow)]"
                  >
                    <div className="flex items-start gap-4">
                      {card.image ? (
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-[var(--d-border)] group-hover:ring-indigo-500/30 transition-all" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 ring-2 ring-[var(--d-border)] group-hover:ring-indigo-500/30 transition-all">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{(card.name || '?')[0]}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-[var(--d-text)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-sm text-[var(--d-text-muted)] truncate mt-0.5">
                          {card.designation || 'Professional'}
                        </p>
                        <p className="text-xs text-[var(--d-text-faint)] truncate mt-1">
                          {card.company || card.slug}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-[var(--d-border)] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--d-hover)] text-[10px] font-semibold text-[var(--d-text-muted)] uppercase tracking-wider">
                        <div className={`w-1.5 h-1.5 rounded-full ${card.type === 'premium' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                        {card.type}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-[var(--d-text-muted)] text-xs font-semibold">
                        <Eye size={14} className="text-[var(--d-text-faint)]" />
                        {card.views?.toLocaleString()} views
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="p-2 rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] text-[var(--d-text-muted)] hover:text-[var(--d-text)] hover:bg-[var(--d-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-medium text-[var(--d-text-muted)]">
                  Page <span className="text-[var(--d-text)]">{page}</span> of <span className="text-[var(--d-text)]">{pagination.last_page}</span>
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={page === pagination.last_page || isLoading}
                  className="p-2 rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] text-[var(--d-text-muted)] hover:text-[var(--d-text)] hover:bg-[var(--d-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="dash-scope min-h-screen bg-[var(--d-bg)] flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
