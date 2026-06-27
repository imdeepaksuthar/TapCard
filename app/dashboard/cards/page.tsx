'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../../lib/api';
import Link from 'next/link';

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
    bio?: string;
  };
  contact_buttons?: {
    call?: string;
    whatsapp?: string;
    email?: string;
  };
  social_links?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  company_details?: {
    company_name?: string;
    website?: string;
    address?: string;
  };
  location_info?: {
    address?: string;
    village?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  custom_branding?: {
    primary_color?: string;
    secondary_color?: string;
    theme_color?: string;
  };
  views_count: number;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const hexToRgba = (hex: string, alpha: number) => {
  try {
    const h = (hex || '').replace('#', '');
    const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(59,130,246,${alpha})`;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(59,130,246,${alpha})`;
  }
};

// ─── Inline Icons ────────────────────────────────────────────────────────────
const ContactIcons: Record<string, ReactNode> = {
  phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
  whatsapp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-9 9 8.96 8.96 0 01-4.4-1.15L3 21l1.15-4.6A8.96 8.96 0 013 12a9 9 0 1118 0z" />,
  email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  website: <><circle cx="12" cy="12" r="9" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" /></>,
  location: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" strokeWidth="2" /></>,
};

// ─── Social platform metadata (label + URL base) ─────────────────────────────
const SOCIAL_META: Record<string, { label: string; base: string }> = {
  linkedin: { label: 'LinkedIn', base: 'https://linkedin.com/in/' },
  instagram: { label: 'Instagram', base: 'https://instagram.com/' },
  facebook: { label: 'Facebook', base: 'https://facebook.com/' },
  twitter: { label: 'X', base: 'https://x.com/' },
  youtube: { label: 'YouTube', base: 'https://youtube.com/@' },
};

const SocialIcon = ({ name, className }: { name: string; className?: string }) => {
  const common = { className, viewBox: '0 0 24 24', fill: 'currentColor' as const };
  switch (name) {
    case 'linkedin':
      return <svg {...common}><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.37-3.9-2.38 0-2.74 1.85-2.74 3.77V24h-4V8z" /></svg>;
    case 'instagram':
      return <svg {...common}><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" /></svg>;
    case 'facebook':
      return <svg {...common}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>;
    case 'twitter':
      return <svg {...common}><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3L17.61 20.65z" /></svg>;
    case 'youtube':
      return <svg {...common}><path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" /></svg>;
    default:
      return <svg {...common} fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>;
  }
};

// ─── Organized contact row ───────────────────────────────────────────────────
function InfoRow({ type, value, href, color }: { type: string; value: string; href: string; color: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="group/row flex items-center gap-3.5 rounded-2xl p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
    >
      <span
        className="shrink-0 h-8 w-8 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover/row:scale-110 shadow-sm"
        style={{ background: hexToRgba(color, 0.15), color, border: `1px solid ${hexToRgba(color, 0.25)}` }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {ContactIcons[type]}
        </svg>
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-semibold text-gray-300 truncate group-hover/row:text-white transition-colors duration-300">
        {value}
      </span>
      <span className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-white/5 text-gray-400 group-hover/row:bg-white/20 group-hover/row:text-white transition-all duration-300 opacity-0 group-hover/row:opacity-100 -translate-x-2 group-hover/row:translate-x-0 border border-white/10">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}

// ─── QR Code Modal ───────────────────────────────────────────────────────────
function QRCodeModal({
  card,
  url,
  onClose,
}: {
  card: Card | null;
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const download = () => {
    const svg = document.getElementById('tapcard-qr');
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const size = 640;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 48, 48, size - 96, size - 96);
      }
      URL.revokeObjectURL(objUrl);
      const a = document.createElement('a');
      a.download = `${card?.slug || 'card'}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = objUrl;
  };

  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D1527]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-7 flex flex-col items-center">
                <h3 className="text-lg font-bold text-white text-center">Scan to Connect</h3>
                <p className="text-sm text-gray-400 text-center mt-1 mb-6">
                  Point any camera at the code to open{' '}
                  <span className="text-blue-300 font-semibold">{card.personal_info?.name || 'this card'}</span>
                </p>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                  className="bg-white p-4 rounded-2xl shadow-2xl shadow-blue-500/10 ring-1 ring-black/5"
                >
                  <QRCodeSVG id="tapcard-qr" value={url} size={196} level="H" fgColor="#0D1527" bgColor="#ffffff" />
                </motion.div>

                <div className="mt-5 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[11px] text-gray-400 truncate" title={url}>{url}</p>
                </div>

                <div className="flex gap-3 mt-5 w-full">
                  <button
                    onClick={download}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={copy}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30 hover:text-blue-100 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
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
  const [qrCard, setQrCard] = useState<Card | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${origin}/${slug}`);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

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

      <QRCodeModal
        card={qrCard}
        url={qrCard ? `${origin}/${qrCard.slug}` : ''}
        onClose={() => setQrCard(null)}
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
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            initial="hidden"
            animate="show"
            className="grid gap-8 max-w-[850px] mx-auto justify-center w-full grid-cols-1"
          >
            {cards.map((card) => {
              const primaryColor = card.custom_branding?.primary_color || '#3b82f6';
              const secondaryColor = card.custom_branding?.secondary_color || '#eff6ff';
              const profileImage = card.profile_image || card.personal_info?.profile_image;
              const companyName = card.company_details?.company_name || card.personal_info?.company_name || '';
              const designation = card.personal_info?.designation || '';
              const bio = card.personal_info?.bio || '';
              const isActive = card.status === 'active';
              const isCopied = copiedSlug === card.slug;

              // ── Organized contact data ──
              const sl = card.social_links || {};
              const cb = card.contact_buttons || {};
              const li = card.location_info || {};
              const phone = cb.call || sl.phone || '';
              const whatsapp = cb.whatsapp || sl.whatsapp || '';
              const email = cb.email || sl.email || '';
              const website = card.company_details?.website || sl.website || '';
              const address =
                card.company_details?.address ||
                [li.address, li.village, li.city, li.state, li.pincode].filter(Boolean).join(', ');

              const cleanPhone = phone.replace(/[^\d+]/g, '');
              const cleanWa = whatsapp.replace(/[^\d]/g, '');
              const websiteHref = website ? (website.startsWith('http') ? website : `https://${website}`) : '';
              const websiteLabel = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
              const mapHref = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
              const hasContact = !!(phone || whatsapp || email || website || address);

              const socials = (['linkedin', 'instagram', 'facebook', 'twitter', 'youtube'] as const)
                .map((k) => ({ k, v: (sl[k] || '').trim() }))
                .filter((s) => s.v)
                .map((s) => {
                  const meta = SOCIAL_META[s.k];
                  return { k: s.k, label: meta.label, href: s.v.startsWith('http') ? s.v : meta.base + s.v.replace(/^@/, '') };
                });

              return (
                <motion.div
                  key={card.id}
                  variants={{
                    hidden: { opacity: 0, y: 28, scale: 0.96 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 22 } },
                  }}
                  className="w-full max-w-[1050px] mx-auto group/card relative rounded-[32px] p-2 bg-[#0D1527]/40 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-2 overflow-hidden"
                >
                  {/* Ambient glowing orb based on primaryColor */}
                  <div 
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15] pointer-events-none transition-opacity duration-700 group-hover/card:opacity-[0.25]"
                    style={{ background: primaryColor }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 relative z-10">
                    
                    {/* Left Column (Profile & Socials) -> md:col-span-5 */}
                    <div className="md:col-span-5 flex flex-col gap-2">
                      {/* Profile Box */}
                      <div className="flex-1 rounded-[24px] bg-white/[0.03] border border-white/5 p-5 flex flex-col items-center justify-center relative overflow-hidden group/profile hover:bg-white/[0.06] transition-colors duration-500">
                        <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10">
                           <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           <span>{card.views_count}</span>
                        </div>
                        
                        {/* Avatar */}
                        <div className="relative mt-4 mb-6 group/avatar">
                           <div className="absolute inset-0 rounded-[24px] opacity-40 blur-xl scale-110 transition-transform duration-700 group-hover/avatar:scale-125 group-hover/avatar:opacity-60" style={{ background: primaryColor }} />
                           <div className="h-24 w-24 rounded-[20px] bg-[#1a2333] border-2 border-white/20 overflow-hidden flex items-center justify-center relative z-10 shadow-2xl">
                             {profileImage ? (
                               <img src={profileImage} alt={card.personal_info?.name || 'Profile'} className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                             ) : (
                               <span className="text-4xl font-bold text-white">{(card.personal_info?.name || 'U').charAt(0).toUpperCase()}</span>
                             )}
                           </div>
                           <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#00d26a] rounded-full border-[3px] border-[#0D1527] flex items-center justify-center shadow-lg z-20">
                             <svg className="relative w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                           </div>
                        </div>

                        {/* Text */}
                        <div className="text-center w-full relative z-20">
                           <h3 className="text-[22px] font-black text-white tracking-tight leading-tight mb-1.5 truncate">{card.personal_info?.name || 'Untitled Card'}</h3>
                           {designation && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">{designation}</p>}
                        </div>

                        {/* Chips */}
                        {(companyName || card.category?.name) && (
                          <div className="mt-6 flex flex-wrap justify-center gap-2 relative z-20">
                            {companyName && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                                <svg className="w-3.5 h-3.5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                <span className="truncate max-w-[120px]">{companyName}</span>
                              </span>
                            )}
                            {card.category?.name && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>
                                <span className="truncate max-w-[120px]">{card.category.name}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Socials Box */}
                      {socials.length > 0 && (
                        <div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-6 flex flex-wrap justify-center items-center gap-3 hover:bg-white/[0.06] transition-colors duration-500">
                          {socials.map((s) => (
                            <a
                              key={s.k}
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={s.label}
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-400 bg-white/5 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group/social"
                            >
                              <span className="absolute inset-0 rounded-xl opacity-0 group-hover/social:opacity-20 transition-opacity duration-300" style={{ background: primaryColor }} />
                              <span className="relative z-10 transition-colors duration-300 group-hover/social:text-white">
                                <SocialIcon name={s.k} className="w-4 h-4" />
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column (Controls & Info) -> md:col-span-7 */}
                    <div className="md:col-span-7 flex flex-col gap-2">
                      
                      {/* Top Controls Box */}
                      <div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:bg-white/[0.06] transition-colors duration-500">
                        {/* Status Toggle */}
                        <div className="flex items-center gap-3 pl-1">
                          <button
                            onClick={() => handleToggleStatus(card.id, card.status)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${isActive ? 'bg-[#00d26a]/20 border-[#00d26a]/30' : 'bg-white/5 border-white/10'}`}
                            aria-label="Toggle card status"
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${isActive ? 'translate-x-5 shadow-[0_0_12px_rgba(0,210,106,0.8)]' : 'translate-x-0'}`} />
                          </button>
                          <span className={`text-[10px] font-black tracking-[0.15em] uppercase ${isActive ? 'text-[#00d26a]' : 'text-gray-500'}`}>
                            {card.status}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQrCard(card)}
                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-sm cursor-pointer relative z-50"
                            title="Show QR code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16h.01M20 16h.01M14 20h.01M18 20h.01M20 20h.01" /></svg>
                          </button>
                          
                          <button
                            onClick={() => copyLink(card.slug)}
                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-sm relative group/copy cursor-pointer z-50"
                            title={isCopied ? 'Link copied!' : 'Copy link'}
                          >
                            {isCopied ? (
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
                            )}
                          </button>

                          <Link
                            href={`/${card.slug}`}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-[11px] font-extrabold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-95 group/btn cursor-pointer relative z-50"
                            title="View Live Profile"
                          >
                            <span>Live</span>
                            <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                          
                          <div className="w-px h-6 bg-white/10 mx-1"></div>

                          <Link
                            href={`/dashboard/cards/edit/${card.id}`}
                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-sm cursor-pointer relative z-50"
                            title="Edit Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </Link>

                          <button
                            onClick={() => { setDeleteTargetId(card.id); }}
                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 flex items-center justify-center text-gray-400 hover:text-rose-400 transition-all shadow-sm cursor-pointer relative z-50"
                            title="Delete Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Info Box (About + Contact) */}
                      <div className="flex-1 rounded-[24px] bg-white/[0.03] border border-white/5 p-5 sm:p-6 flex flex-col hover:bg-white/[0.06] transition-colors duration-500">
                        {bio && (
                          <div className="mb-7">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">About</h4>
                            </div>
                            <p className="text-[13px] leading-relaxed text-gray-300 font-medium">{bio}</p>
                          </div>
                        )}

                        {hasContact && (
                          <div className="flex-1">
                            <div className="flex items-center gap-2.5 mb-4">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Contact</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {phone && <InfoRow type="phone" value={phone} href={`tel:${cleanPhone}`} color={primaryColor} />}
                              {whatsapp && <InfoRow type="whatsapp" value={whatsapp} href={`https://wa.me/${cleanWa}`} color="#25D366" />}
                              {email && <InfoRow type="email" value={email} href={`mailto:${email}`} color={primaryColor} />}
                              {website && <InfoRow type="website" value={websiteLabel} href={websiteHref} color={primaryColor} />}
                              {address && <InfoRow type="location" value={address} href={mapHref} color={primaryColor} />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
