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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full relative aspect-[1.586/1] rounded-[24px] p-[1.5px] overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ boxShadow: `0 25px 50px -12px ${primaryColor}30` }}
                >
                  {/* Glowing gradient border effect */}
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
                  
                  {/* Inner debit card container */}
                  <div className="relative h-full w-full bg-gradient-to-br from-[#121A2F] to-[#0A0F1C] rounded-[22.5px] p-6 flex flex-col justify-between overflow-hidden shadow-inner">
                    
                    {/* Decorative abstract background elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" style={{ background: primaryColor, opacity: 0.15 }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl -ml-10 -mb-10 transition-transform duration-700 group-hover:scale-110" style={{ background: secondaryColor, opacity: 0.1 }} />
                    {/* Subtle noise texture overlay */}
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                    {/* Live Profile QR Code */}
                    {origin && (
                      <div className="absolute right-6 top-[45%] -translate-y-1/2 p-1.5 bg-white rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-20 group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100">
                        <QRCodeSVG 
                          value={`${origin}/${card.slug}`} 
                          size={54} 
                          fgColor="#000000" 
                          bgColor="#ffffff" 
                          level="M" 
                          marginSize={0}
                        />
                      </div>
                    )}

                    {/* Top Row: Status + Contactless */}
                    <div className="flex justify-between items-start relative z-10">
                      <button
                        onClick={() => handleToggleStatus(card.id, card.status)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border backdrop-blur-md transition-all ${card.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20 text-gray-400 hover:bg-gray-500/20'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${card.status === 'active' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-500'}`} />
                        <span className="text-[9px] font-bold tracking-widest uppercase">{card.status}</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                          <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {card.views_count}
                        </div>
                        {/* Contactless Wave */}
                        <svg className="w-5 h-5 text-white/40 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        </svg>
                      </div>
                    </div>

                    {/* Middle Row: EMV Chip + Logo */}
                    <div className="flex items-center gap-5 relative z-10 -mt-2">
                      {/* EMV Chip */}
                      <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 opacity-90 flex items-center justify-center overflow-hidden border border-yellow-700/50 shadow-sm relative">
                        {/* Chip lines */}
                        <div className="absolute inset-0 opacity-30 mix-blend-multiply">
                          <div className="w-full h-[1px] bg-black absolute top-[30%]"></div>
                          <div className="w-full h-[1px] bg-black absolute top-[70%]"></div>
                          <div className="h-full w-[1px] bg-black absolute left-[30%]"></div>
                          <div className="h-full w-[1px] bg-black absolute left-[70%]"></div>
                          <div className="w-[1px] h-[30%] bg-black absolute top-0 left-[50%]"></div>
                          <div className="w-[1px] h-[30%] bg-black absolute bottom-0 left-[50%]"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-[#0A0F1C] shadow-lg">
                          {profileImage ? (
                            <img src={profileImage} alt={card.personal_info?.name || 'Profile'} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                              {(card.personal_info?.name || 'U').trim().charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Company</p>
                          <p className="text-sm font-semibold text-white/90 truncate max-w-[120px] leading-tight">{companyName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Embossed Name + Actions */}
                    <div className="flex justify-between items-end relative z-10">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-mono text-[17px] sm:text-xl text-white/90 uppercase tracking-widest truncate shadow-black drop-shadow-md">
                          {card.personal_info?.name || 'Untitled Card'}
                        </h4>
                        <p className="font-mono text-[9px] uppercase tracking-widest mt-1 truncate" style={{ color: primaryColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {card.personal_info?.designation || 'No Designation'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 shrink-0 items-center">
                        <a
                          href={`/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg shadow-blue-500/30 transition-all group/btn"
                          title="View Live Profile"
                        >
                          <span className="text-[10px] tracking-wider uppercase">Live Link</span>
                          <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-xl backdrop-blur-sm border border-white/5">
                        <button
                          onClick={() => { router.push(`/dashboard/cards/edit/${card.id}`); }}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 border border-transparent hover:border-blue-500/30 text-blue-400 hover:text-white transition-all group/btn"
                          title="Edit Card"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setDeleteTargetId(card.id); }}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 border border-transparent hover:border-rose-500/30 text-rose-400 hover:text-white transition-all group/btn"
                          title="Delete Card"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        </div>
                      </div>
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
