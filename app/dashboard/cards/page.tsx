'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../../lib/api';

interface Card {
  id: number;
  slug: string;
  status: string;
  profile_image?: string;
  category?: { name: string };
  subcategory?: { name: string };
  personal_info: {
    name?: string;
    designation?: string;
    company_name?: string;
    profile_image?: string;
  };
  company_details?: {
    company_name?: string;
  };
  custom_branding?: {
    primary_color?: string;
    secondary_color?: string;
    theme_color?: string;
  };
  views_count: number;
  created_at: string;
}

// ─── Custom Confirm Modal ────────────────────────────────────────────────────
function ConfirmDeleteModal({
  isOpen,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D1527]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
            >
              {/* Top rose accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />

              <div className="p-7">
                {/* Icon */}
                <div className="flex items-center justify-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-white text-center mb-2">Delete Card?</h3>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  Are you sure you want to delete this card?{' '}
                  <span className="text-rose-400 font-semibold">This action cannot be undone.</span>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-7">
                  <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Deleting…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Yes, Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyCards() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const playUISound = (type: 'click' | 'pop' | 'success' | 'save') => {
    // Sound disabled in admin dashboard
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchCards = async () => {
      try {
        const data = await apiFetch<{ cards: Card[] }>('/api/cards');
        setCards(data.cards);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCards();
    }
  }, [user, authLoading, router]);

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/cards/${deleteTargetId}`, { method: 'DELETE' });
      setCards(cards.filter(card => card.id !== deleteTargetId));
      playUISound('success');
    } catch (error) {
      console.error('Failed to delete card:', error);
      playUISound('pop');
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleStatus = async (cardId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setCards(cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c));
      
      await apiFetch(`/api/cards/${cardId}/toggle-status`, { method: 'PATCH' });
      playUISound('success');
    } catch (error) {
      console.error('Failed to toggle status:', error);
      setCards(cards.map(c => c.id === cardId ? { ...c, status: currentStatus } : c));
      playUISound('pop');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTargetId(null); playUISound('click'); }}
        isDeleting={isDeleting}
      />

      <div className="p-fluid-lg space-y-fluid-lg">
        {/* Title Section with Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-fluid-md">
          <div>
            <h1 className="text-fluid-2xl font-bold">My Digital Cards</h1>
            <p className="text-gray-400 text-fluid-sm">Manage and share your professional profiles.</p>
          </div>
          {cards.length === 0 && (
            <button
              onClick={() => router.push('/dashboard/cards/create')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Card
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No cards created yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Create your first digital business card and start sharing your professional profile.
            </p>
            <button
              onClick={() => router.push('/dashboard/cards/create')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300"
            >
              Create Your First Card
            </button>
          </div>
        ) : (
          <div className={`grid gap-8 max-w-6xl mx-auto justify-center justify-items-center ${cards.length === 1 ? 'grid-cols-1 w-full max-w-md' : 'grid-cols-[repeat(auto-fit,minmax(clamp(320px,35vw,400px),1fr))] w-full'}`}>
            {cards.map((card) => {
              const primaryColor = card.custom_branding?.primary_color || '#3b82f6';
              const secondaryColor = card.custom_branding?.secondary_color || '#eff6ff';
              const profileImage = card.profile_image || card.personal_info?.profile_image;
              const companyName = card.company_details?.company_name || card.personal_info?.company_name || 'Independent';

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-md flex flex-col group"
                >
                  {/* The NFC Card Face */}
                  <div
                    className="w-full relative aspect-[1.586/1] rounded-[24px] p-[1.5px] overflow-hidden transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl shadow-lg border border-white/5"
                    style={{ boxShadow: `0 20px 40px -15px ${primaryColor}40` }}
                  >
                    {/* Glowing gradient border effect */}
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-90 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
                    
                    {/* Inner debit card container */}
                    <div className="relative h-full w-full bg-gradient-to-br from-[#121A2F] via-[#0A0F1C] to-[#05080F] rounded-[22.5px] p-6 flex flex-col justify-between overflow-hidden shadow-inner border border-white/5">
                      
                      {/* Decorative radial gradients */}
                      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125" style={{ background: primaryColor, opacity: 0.2 }} />
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125" style={{ background: secondaryColor, opacity: 0.15 }} />
                      {/* Mesh/noise texture overlay */}
                      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                      {/* Top Row: Brand & Contactless Icon */}
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 font-mono">TAPCARD NFC</span>
                        
                        {/* Contactless waves icon */}
                        <div className="text-white/40 flex items-center justify-center">
                          <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                          </svg>
                        </div>
                      </div>

                      {/* Middle Row: EMV Chip & Company Info */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          {/* High-fidelity SVG EMV Chip */}
                          <svg className="w-11 h-8 rounded-md shadow-md opacity-95 shrink-0" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="36" rx="6" fill="url(#chip-gold)" />
                            <rect x="0.5" y="0.5" width="47" height="35" rx="5.5" stroke="#D97706" strokeOpacity="0.4" />
                            <path d="M14 0V36M34 0V36M0 12H48M0 24H48" stroke="#78350F" strokeWidth="0.5" strokeOpacity="0.3" />
                            <path d="M14 12C14 18.6 18.4 24 24 24C29.6 24 34 18.6 34 12" stroke="#78350F" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
                            <rect x="19" y="10" width="10" height="16" rx="2" fill="none" stroke="#78350F" strokeWidth="0.5" strokeOpacity="0.3" />
                            <defs>
                              <linearGradient id="chip-gold" x1="0" y1="0" x2="48" y2="36" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FDE68A" />
                                <stop offset="0.5" stopColor="#F59E0B" />
                                <stop offset="1" stopColor="#B45309" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* Profile & Company info */}
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-[#0A0F1C] shadow-lg relative shrink-0">
                              {profileImage ? (
                                <img src={profileImage} alt={card.personal_info?.name || 'Profile'} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-base font-bold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                                  {(card.personal_info?.name || 'U').trim().charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.15em] leading-none mb-0.5">Company</p>
                              <p className="text-xs font-semibold text-white/80 truncate max-w-[110px] leading-tight">{companyName}</p>
                            </div>
                          </div>
                        </div>

                        {/* QR Code housing */}
                        {origin && (
                          <div className="p-1.5 bg-white rounded-xl shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100">
                            <QRCodeSVG 
                              value={`${origin}/${card.slug}`} 
                              size={64} 
                              fgColor="#000000" 
                              bgColor="#ffffff" 
                              level="M" 
                              marginSize={0}
                            />
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Embossed Name + Designation */}
                      <div className="relative z-10 flex flex-col justify-end">
                        <h4 className="font-sans text-base sm:text-lg text-white/95 font-bold uppercase tracking-wider truncate shadow-black drop-shadow">
                          {card.personal_info?.name || 'Untitled Card'}
                        </h4>
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] mt-0.5 truncate" style={{ color: primaryColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                          {card.personal_info?.designation || 'No Designation'}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Actions Tray / Control & Info Panel */}
                  <div className="w-full mt-3 bg-[#0D1426]/90 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
                    {/* Left: Status Toggle & View Count */}
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
                      {/* Status switch */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(card.id, card.status)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${card.status === 'active' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/10 border-white/15'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${card.status === 'active' ? 'translate-x-5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'translate-x-0 bg-gray-400'}`}
                          />
                        </button>
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${card.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {card.status}
                        </span>
                      </div>

                      {/* Views count */}
                      <div className="flex items-center gap-1.5 text-xs text-white/60 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                        <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{card.views_count}</span>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center justify-end w-full sm:w-auto gap-2">
                      <a
                        href={`/${card.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/35 active:scale-95 group/btn"
                        title="View Live Profile"
                      >
                        <span>Live Link</span>
                        <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      <button
                        onClick={() => { router.push(`/dashboard/cards/edit/${card.id}`); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/20 text-gray-300 hover:text-blue-400 transition-all duration-300"
                        title="Edit Card"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => { setDeleteTargetId(card.id); }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-gray-300 hover:text-rose-400 transition-all duration-300"
                        title="Delete Card"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
