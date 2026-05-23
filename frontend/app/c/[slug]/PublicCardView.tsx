'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeadForm from '../../../components/LeadForm';

type AnyObj = Record<string, any>;

const THEME_HEX: Record<string, string> = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  green: '#22c55e',
  rose: '#f43f5e',
  orange: '#f97316',
  slate: '#64748b',
};

const getHexColor = (c?: string) => {
  if (!c) return '#6366f1';
  if (c.startsWith('#')) return c;
  return THEME_HEX[c] || '#6366f1';
};

const asObject = (v: any): AnyObj => (v && !Array.isArray(v) && typeof v === 'object' ? v : {});

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Brand SVG icons (inline so we don't add deps)
const Icon = {
  Phone: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  Whatsapp: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  ),
  Save: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  Share: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Sun: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Moon: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Globe: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  MapPin: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Building: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
    </svg>
  ),
  Wallet: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h12v4" />
      <path d="M3 6v12a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-4h-6a2 2 0 0 1 0-4h6" />
    </svg>
  ),
  Check: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Copy: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Eye: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Bolt: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  // Social brand glyphs (monochrome)
  Facebook: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/>
    </svg>
  ),
  Twitter: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z"/>
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
      <circle cx="18.41" cy="5.59" r="1.44"/>
    </svg>
  ),
  LinkedIn: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
    </svg>
  ),
  YouTube: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.52A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.13c1.9.52 9.4.52 9.4.52s7.5 0 9.4-.52a3 3 0 0 0 2.1-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z"/>
    </svg>
  ),
};

const SOCIAL_META: Record<string, { label: string; color: string; href: (v: string) => string; Icon: any }> = {
  facebook:  { label: 'Facebook',  color: '#1877F2', href: (v) => v, Icon: Icon.Facebook },
  twitter:   { label: 'X',         color: '#0F1419', href: (v) => v, Icon: Icon.Twitter },
  instagram: { label: 'Instagram', color: '#E1306C', href: (v) => v, Icon: Icon.Instagram },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', href: (v) => v, Icon: Icon.LinkedIn },
  youtube:   { label: 'YouTube',   color: '#FF0000', href: (v) => v, Icon: Icon.YouTube },
};

export default function PublicCardView({ data }: { data: any }) {
  const { card } = data;
  const personalInfo   = asObject(card.personal_info);
  const contactButtons = asObject(card.contact_buttons);
  const socialLinks    = asObject(card.social_links);
  const paymentInfo    = asObject(card.payment_info);
  const companyDetails = asObject(card.company_details);
  const locationInfo   = asObject(card.location_info);
  const customBranding = asObject(card.custom_branding);

  const showSocial   = customBranding.show_social   !== false;
  const showCompany  = customBranding.show_company  !== false;
  const showAddress  = customBranding.show_address  !== false;
  const showLocation = customBranding.show_location !== false;
  const showPayment  = customBranding.show_payment  !== false;

  const [isDark, setIsDark]   = useState<boolean>(customBranding.dark_mode_enabled ?? true);
  const [copied, setCopied]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [shareOk, setShareOk] = useState(false);

  const themeName    = customBranding.theme_color || card.theme_color || 'indigo';
  const primaryColor = data.theme?.primary_color || getHexColor(themeName);
  const primary15    = hexToRgba(primaryColor, 0.15);
  const primary30    = hexToRgba(primaryColor, 0.3);

  const profileImage =
    card.profile_image ||
    personalInfo.profile_image ||
    null;

  // Pull contact methods, falling back to social_links if contact_buttons is empty
  const phone    = contactButtons.call     || socialLinks.phone    || socialLinks.call;
  const whatsapp = contactButtons.whatsapp || socialLinks.whatsapp;
  const email    = contactButtons.email    || socialLinks.email;

  const cleanedPhone    = phone    ? String(phone).replace(/[^\d+]/g, '')    : '';
  const cleanedWhatsapp = whatsapp ? String(whatsapp).replace(/[^\d]/g, '')  : '';

  // Filter social links: exclude contact channels already shown as quick actions
  const filteredSocials = useMemo(() => {
    const exclude = new Set(['phone', 'call', 'email', 'whatsapp']);
    return Object.entries(socialLinks).filter(([k, v]) => !exclude.has(k.toLowerCase()) && !!v);
  }, [socialLinks]);

  const fullAddress =
    companyDetails.address ||
    [locationInfo.address, locationInfo.village, locationInfo.city, locationInfo.state, locationInfo.pincode]
      .filter(Boolean)
      .join(', ');

  const hasPayment = !!(paymentInfo.upi_id || paymentInfo.upi || paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.qr_path);
  const hasLocationBlock = showLocation && (locationInfo.city || locationInfo.state || locationInfo.map_url);
  const hasBusinessBlock = showCompany && (companyDetails.company_name || companyDetails.gst || companyDetails.website || (showAddress && fullAddress));

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = personalInfo.name ? `${personalInfo.name} · Digital Card` : 'Digital Card';
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
        return;
      } catch {}
    }
    if (url) await copyToClipboard('share', url);
    setShareOk(true);
    setTimeout(() => setShareOk(false), 1600);
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards/public/${card.slug}/vcard`);
      if (!res.ok) throw new Error('vcard fetch failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(personalInfo.name || 'contact').replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // graceful fallback: trigger a tel: link as a minimum
      if (cleanedPhone) window.location.href = `tel:${cleanedPhone}`;
    } finally {
      setSaving(false);
    }
  };

  // Tailwind class helpers
  const surface       = isDark ? 'bg-[#12121A]' : 'bg-white';
  const surfaceSoft   = isDark ? 'bg-white/5'   : 'bg-slate-50';
  const borderSoft    = isDark ? 'border-white/10' : 'border-slate-200/70';
  const textMain      = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted     = isDark ? 'text-slate-400' : 'text-slate-500';
  const textSubtle    = isDark ? 'text-slate-300' : 'text-slate-600';
  const pageBg        = isDark ? 'bg-[#08080C]' : 'bg-slate-100';

  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <main className={`min-h-screen w-full ${pageBg} ${textMain} font-sans transition-colors duration-300`}>
      {/* Decorative backdrop on large screens */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor}, transparent 60%)` }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-3 pb-32 pt-4 sm:max-w-xl sm:px-5 sm:pt-6 md:max-w-2xl md:pb-36 md:pt-8">
        {/* ============ CARD ============ */}
        <div className={`relative overflow-hidden rounded-3xl border ${borderSoft} ${surface} shadow-2xl shadow-black/10 backdrop-blur`}>
          {/* ---- HERO ---- */}
          <div className="relative h-44 w-full overflow-hidden sm:h-52 md:h-60">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${hexToRgba(primaryColor, 0.7)} 45%, #0B0B14 100%)` }}
            />
            <div
              className="absolute inset-0 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, #ffffff33 0, transparent 35%), radial-gradient(circle at 80% 70%, #ffffff22 0, transparent 35%)',
              }}
            />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

            {/* Top action bar */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/10">
                <Icon.Eye className="h-3.5 w-3.5" />
                {Number(card.views_count || 0).toLocaleString()} views
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Share card"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25"
                >
                  {shareOk ? <Icon.Check className="h-4 w-4" /> : <Icon.Share className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsDark((v) => !v)}
                  aria-label="Toggle theme"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25"
                >
                  {isDark ? <Icon.Sun className="h-4 w-4" /> : <Icon.Moon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* ---- PROFILE ---- */}
          <div className="relative px-5 pb-2 sm:px-7">
            <div className="-mt-16 flex flex-col items-center text-center sm:-mt-20">
              <div className="relative">
                <div
                  className={`h-28 w-28 overflow-hidden rounded-full ring-4 sm:h-32 sm:w-32 ${isDark ? 'ring-[#12121A]' : 'ring-white'} shadow-xl`}
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${hexToRgba(primaryColor, 0.55)})` }}
                >
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImage} alt={personalInfo.name || 'Profile'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-white">
                      {(personalInfo.name || 'U').trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ${isDark ? 'ring-[#12121A]' : 'ring-white'}`}>
                  <Icon.Check className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              {personalInfo.name && (
                <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-[26px]">{personalInfo.name}</h1>
              )}
              {personalInfo.designation && (
                <p className={`mt-1 text-sm ${textSubtle} sm:text-[15px]`}>{personalInfo.designation}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {showCompany && (companyDetails.company_name || personalInfo.company) && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${surfaceSoft} ${textSubtle} ring-1 ${borderSoft}`}>
                    <Icon.Building className="h-3 w-3" />
                    {companyDetails.company_name || personalInfo.company}
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${hexToRgba(primaryColor, 0.75)})` }}
                >
                  <Icon.Bolt className="h-3 w-3" />
                  NFC Enabled
                </span>
              </div>
            </div>

            {/* ---- QUICK ACTIONS ---- */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={sectionVariants}
              className="mt-6 grid grid-cols-4 gap-2 sm:gap-3"
            >
              <QuickAction
                disabled={!cleanedPhone}
                href={cleanedPhone ? `tel:${cleanedPhone}` : undefined}
                label="Call"
                tint="#10B981"
                isDark={isDark}
                icon={<Icon.Phone className="h-5 w-5" />}
              />
              <QuickAction
                disabled={!cleanedWhatsapp}
                href={cleanedWhatsapp ? `https://wa.me/${cleanedWhatsapp}` : undefined}
                external
                label="WhatsApp"
                tint="#25D366"
                isDark={isDark}
                icon={<Icon.Whatsapp className="h-5 w-5" />}
              />
              <QuickAction
                disabled={!email}
                href={email ? `mailto:${email}` : undefined}
                label="Email"
                tint={primaryColor}
                isDark={isDark}
                icon={<Icon.Mail className="h-5 w-5" />}
              />
              <QuickAction
                onClick={handleSaveContact}
                label={saving ? 'Saving…' : 'Save'}
                tint="#F97316"
                isDark={isDark}
                icon={<Icon.Save className="h-5 w-5" />}
              />
            </motion.div>

            {/* ---- ABOUT ---- */}
            {personalInfo.bio && (
              <Section title="About" isDark={isDark} textMuted={textMuted}>
                <div className={`rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft}`}>
                  <p className={`text-sm leading-relaxed ${textSubtle}`}>{personalInfo.bio}</p>
                </div>
              </Section>
            )}

            {/* ---- CONNECT (SOCIAL) ---- */}
            {showSocial && filteredSocials.length > 0 && (
              <Section title="Connect" isDark={isDark} textMuted={textMuted}>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
                  {filteredSocials.map(([platform, url]) => {
                    const meta = SOCIAL_META[platform.toLowerCase()];
                    return (
                      <a
                        key={platform}
                        href={String(url)}
                        target="_blank"
                        rel="noreferrer"
                        title={meta?.label || platform}
                        className={`group flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl ${surfaceSoft} ring-1 ${borderSoft} transition hover:-translate-y-0.5 hover:shadow-md`}
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-full text-white transition group-hover:scale-105"
                          style={{ backgroundColor: meta?.color || primaryColor }}
                        >
                          {meta ? <meta.Icon className="h-4 w-4" /> : <Icon.Globe className="h-4 w-4" />}
                        </span>
                        <span className={`text-[10px] font-medium ${textMuted} capitalize`}>{meta?.label || platform}</span>
                      </a>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ---- BUSINESS ---- */}
            {hasBusinessBlock && (
              <Section title="Business" isDark={isDark} textMuted={textMuted}>
                <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200/60'} overflow-hidden rounded-2xl ${surfaceSoft} ring-1 ${borderSoft}`}>
                  {companyDetails.company_name && (
                    <InfoRow
                      icon={<Icon.Building className="h-4 w-4" style={{ color: primaryColor }} />}
                      label="Company"
                      value={companyDetails.company_name}
                      isDark={isDark}
                    />
                  )}
                  {companyDetails.gst && (
                    <InfoRow
                      icon={<Icon.Wallet className="h-4 w-4" style={{ color: primaryColor }} />}
                      label="GST"
                      value={companyDetails.gst}
                      onCopy={() => copyToClipboard('gst', companyDetails.gst)}
                      copied={copied === 'gst'}
                      isDark={isDark}
                    />
                  )}
                  {companyDetails.website && (
                    <InfoRow
                      icon={<Icon.Globe className="h-4 w-4" style={{ color: primaryColor }} />}
                      label="Website"
                      value={companyDetails.website}
                      href={companyDetails.website}
                      tint={primaryColor}
                      isDark={isDark}
                    />
                  )}
                  {showAddress && fullAddress && (
                    <InfoRow
                      icon={<Icon.MapPin className="h-4 w-4" style={{ color: primaryColor }} />}
                      label="Address"
                      value={fullAddress}
                      isDark={isDark}
                    />
                  )}
                </div>
              </Section>
            )}

            {/* ---- LOCATION ---- */}
            {hasLocationBlock && (
              <Section title="Location" isDark={isDark} textMuted={textMuted}>
                <div className={`overflow-hidden rounded-2xl ${surfaceSoft} ring-1 ${borderSoft}`}>
                  <div className="flex items-start gap-3 p-4">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: primary15, color: primaryColor }}
                    >
                      <Icon.MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {[locationInfo.village, locationInfo.city].filter(Boolean).join(', ') || 'Location'}
                      </p>
                      <p className={`mt-0.5 text-xs ${textMuted}`}>
                        {[locationInfo.state, locationInfo.pincode].filter(Boolean).join(' · ')}
                      </p>
                      {locationInfo.map_url && (
                        <a
                          href={locationInfo.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: primaryColor }}
                        >
                          Open in maps
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* ---- PAYMENT ---- */}
            {showPayment && hasPayment && (
              <Section title="Payment" isDark={isDark} textMuted={textMuted}>
                <div className={`rounded-2xl ${surfaceSoft} ring-1 ${borderSoft} p-4`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: primary15, color: primaryColor }}
                      >
                        <Icon.Wallet className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Pay via UPI / Bank</p>
                        <p className={`text-xs ${textMuted}`}>Secure quick transfer</p>
                      </div>
                    </div>
                    {paymentInfo.qr_path && (
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={paymentInfo.qr_path} alt="Payment QR" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2`}>
                    {(paymentInfo.upi_id || paymentInfo.upi) && (
                      <PayRow
                        label="UPI ID"
                        value={paymentInfo.upi_id || paymentInfo.upi}
                        onCopy={() => copyToClipboard('upi', paymentInfo.upi_id || paymentInfo.upi)}
                        copied={copied === 'upi'}
                        isDark={isDark}
                      />
                    )}
                    {paymentInfo.bank_name && (
                      <PayRow label="Bank" value={paymentInfo.bank_name} isDark={isDark} />
                    )}
                    {paymentInfo.account_number && (
                      <PayRow
                        label="A/C No."
                        value={paymentInfo.account_number}
                        onCopy={() => copyToClipboard('acc', paymentInfo.account_number)}
                        copied={copied === 'acc'}
                        isDark={isDark}
                        mono
                      />
                    )}
                    {paymentInfo.ifsc_code && (
                      <PayRow
                        label="IFSC"
                        value={paymentInfo.ifsc_code}
                        onCopy={() => copyToClipboard('ifsc', paymentInfo.ifsc_code)}
                        copied={copied === 'ifsc'}
                        isDark={isDark}
                        mono
                      />
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* ---- INQUIRY FORM ---- */}
            <Section title="Send an Inquiry" isDark={isDark} textMuted={textMuted}>
              <div className={`rounded-2xl ${surfaceSoft} ring-1 ${borderSoft} p-5`}>
                <p className="text-base font-semibold">Get in touch</p>
                <p className={`mt-0.5 text-xs ${textMuted}`}>We'll reply within 24 hours.</p>
                <div className="mt-4">
                  <LeadForm cardId={card.id} bare isDark={isDark} primaryColor={primaryColor} />
                </div>
              </div>
            </Section>

            {/* Footer */}
            <div className={`mt-8 pb-6 text-center text-[11px] ${textMuted}`}>
              Powered by <span className="font-semibold" style={{ color: primaryColor }}>Card Setu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- STICKY ACTION BAR ---- */}
      {(cleanedPhone || cleanedWhatsapp || email) && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 sm:pb-5">
          <div
            className={`flex w-full max-w-md gap-2 rounded-full p-2 shadow-2xl ring-1 backdrop-blur-xl sm:max-w-xl md:max-w-2xl ${
              isDark ? 'bg-black/70 ring-white/10' : 'bg-white/90 ring-slate-200'
            }`}
          >
            {cleanedPhone && (
              <a
                href={`tel:${cleanedPhone}`}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                style={{ backgroundColor: primaryColor, boxShadow: `0 8px 24px ${primary30}` }}
              >
                <Icon.Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {cleanedWhatsapp && (
              <a
                href={`https://wa.me/${cleanedWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                <Icon.Whatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            <button
              onClick={handleSaveContact}
              disabled={saving}
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:opacity-70 ${
                isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Icon.Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Toast for copy feedback */}
      {copied && copied !== 'share' && (
        <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Copied to clipboard
        </div>
      )}
    </main>
  );
}

/* ============================================================
 * Helper components
 * ============================================================ */

function Section({
  title,
  children,
  isDark,
  textMuted,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  textMuted: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-6"
    >
      <h3 className={`mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>{title}</h3>
      {children}
    </motion.div>
  );
}

function QuickAction({
  icon,
  label,
  href,
  external,
  onClick,
  tint,
  isDark,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  tint: string;
  isDark: boolean;
  disabled?: boolean;
}) {
  const base = `group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 ring-1 transition ${
    isDark ? 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.07]' : 'bg-white ring-slate-200 hover:shadow-md'
  } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:-translate-y-0.5'}`;

  const inner = (
    <>
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(tint, 0.14), color: tint }}
      >
        {icon}
      </span>
      <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
    </>
  );

  if (disabled || (!href && !onClick)) {
    return <div className={base}>{inner}</div>;
  }
  if (href) {
    return (
      <a className={base} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={base}>
      {inner}
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  tint,
  onCopy,
  copied,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  tint?: string;
  onCopy?: () => void;
  copied?: boolean;
  isDark: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm font-medium hover:underline"
            style={{ color: tint }}
          >
            {value}
          </a>
        ) : (
          <p className="break-words text-sm font-medium">{value}</p>
        )}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
            isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {copied ? <Icon.Check className="h-3.5 w-3.5 text-emerald-500" /> : <Icon.Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

function PayRow({
  label,
  value,
  onCopy,
  copied,
  isDark,
  mono,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  isDark: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ring-1 ${
        isDark ? 'bg-white/[0.03] ring-white/5' : 'bg-white ring-slate-200/70'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`truncate text-xs ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
            isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {copied ? <Icon.Check className="h-3.5 w-3.5 text-emerald-500" /> : <Icon.Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
