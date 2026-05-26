'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function MyCards() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const deleteCard = async (id: number) => {
    try {
      await apiFetch(`/api/cards/${id}`, { method: 'DELETE' });
      setCards(cards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again. Error: ' + (error as Error).message);
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
    <div className="p-6 space-y-6">
      {/* Title Section with Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Digital Cards</h1>
          <p className="text-gray-400 text-sm">Manage and share your professional profiles.</p>
        </div>
        {cards.length === 0 && (
          <button
            onClick={() => router.push('/dashboard/cards/create')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No cards created yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm">Create your first digital business card and start sharing your professional profile.</p>
          <button
            onClick={() => router.push('/dashboard/cards/create')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300"
          >
            Create Your First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center justify-items-center">
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
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-[#0D1527]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group relative min-h-[250px]"
              >
                {/* Accent indicator line on the left edge */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
                  style={{ backgroundColor: primaryColor }}
                />

                <div className="p-6 pl-8">
                  {/* Status & Views row */}
                  <div className="flex justify-between items-center mb-5">
                    <span 
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase border ${
                        card.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {card.status}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {card.views_count} Views
                    </div>
                  </div>

                  {/* Horizontal Business Card Content */}
                  <div className="flex items-center gap-5">
                    {/* Left: Avatar */}
                    <div className="h-16 w-16 rounded-2xl border border-white/10 overflow-hidden bg-[#141E33] shrink-0 relative shadow-inner">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt={card.personal_info?.name || 'Profile'} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div 
                          className="h-full w-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                          {(card.personal_info?.name || 'U').trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-white truncate group-hover:text-blue-400 transition-colors">
                        {card.personal_info?.name || 'Untitled Card'}
                      </h4>
                      <p className="text-xs font-semibold uppercase tracking-wider truncate mt-0.5" style={{ color: primaryColor }}>
                        {card.personal_info?.designation || 'No Designation'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {companyName}
                      </p>
                    </div>
                  </div>

                  {/* Category & Subcategory Badge */}
                  {card.category && (
                    <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] bg-white/5 border border-white/5 text-gray-300 font-medium w-fit">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H8a2 2 0 00-2 2v16z" />
                      </svg>
                      {card.category.name}
                      {card.subcategory && <span className="text-gray-500">›</span>}
                      {card.subcategory && <span className="text-blue-400">{card.subcategory.name}</span>}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 pl-8 pb-4 pt-3 bg-black/20 border-t border-white/5 flex justify-between items-center">
                  <a
                    href={`/c/${card.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    View Live Profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/cards/edit/${card.id}`)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                      title="Edit Card"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
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
  );
}
