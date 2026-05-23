'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero3DBackground from '@/app/components/Hero3DBackground';
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
  Tag: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
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
  ShoppingCart: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Trash: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Plus: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Image: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  AlertTriangle: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  X: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  QrCode: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Download: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Smartphone: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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

export default function PublicCardView({ data, products = [] }: { data: any, products?: any[] }) {
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

  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPincode, setCheckoutPincode] = useState('');
  const [checkoutVillage, setCheckoutVillage] = useState('');
  const [postOffices, setPostOffices] = useState<any[]>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Payment Modal State
  const [activePaymentModal, setActivePaymentModal] = useState<'bank' | 'barcode' | null>(null);

  // Fetch Pincode Details
  useEffect(() => {
    if (checkoutPincode.length === 6) {
      setIsFetchingPincode(true);
      setFormError('');
      fetch(`https://api.zippopotam.us/in/${checkoutPincode}`)
        .then(res => {
          if (!res.ok) throw new Error('Invalid pincode');
          return res.json();
        })
        .then(data => {
          if (data && data.places && data.places.length > 0) {
            const offices = data.places.map((place: any) => ({ Name: place["place name"] }));
            setPostOffices(offices);
            setCheckoutVillage('');
          } else {
            setPostOffices([]);
            setFormError('Invalid Pincode. Please check and try again.');
          }
        })
        .catch(() => {
          setPostOffices([]);
          setFormError('Failed to fetch pincode details. Try again later.');
        })
        .finally(() => {
          setIsFetchingPincode(false);
        });
    } else {
      setPostOffices([]);
      setCheckoutVillage('');
    }
  }, [checkoutPincode]);

  const [verifyingGst, setVerifyingGst] = useState(false);
  const [gstData, setGstData] = useState<any>(null);
  const [showGstModal, setShowGstModal] = useState(false);

  // Products state
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const productCategories = useMemo(() => {
    if (!products) return ['All'];
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.description?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, selectedCategory]);

  const handleVerifyGst = async (gstNo: string) => {
    setVerifyingGst(true);
    setShowGstModal(true);
    setGstData(null);
    try {
      const res = await fetch('/api/verify-gst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstNo }),
      });
      const data = await res.json();
      if (data.success) {
        setGstData(data.data);
      } else {
        setGstData({ error: data.error || 'Verification failed' });
      }
    } catch (e) {
      setGstData({ error: 'Network error occurred' });
    } finally {
      setVerifyingGst(false);
    }
  };

  const cartItemCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQty = (id: any, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: any) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const themeName    = customBranding.theme_color || card.theme_color || 'indigo';
  const primaryColor = customBranding.primary_color || data.theme?.primary_color || getHexColor(themeName);
  const secondaryColor = customBranding.secondary_color || (isDark ? '#0B0B14' : '#f8fafc');
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

  const validateForm = () => {
    setFormError('');
    if (!checkoutName.trim()) {
      setFormError('Name is required.');
      return false;
    }
    if (!checkoutPhone.trim()) {
      setFormError('Phone number is required.');
      return false;
    }
    if (!checkoutEmail.trim() || !/^\S+@\S+\.\S+$/.test(checkoutEmail)) {
      setFormError('Valid email address is required.');
      return false;
    }
    if (checkoutPincode.length !== 6) {
      setFormError('Valid 6-digit Pincode is required.');
      return false;
    }
    if (postOffices.length > 0 && !checkoutVillage) {
      setFormError('Please select your Village/Area.');
      return false;
    }
    return true;
  };

  const generateOrderText = () => {
    let text = `*New Order*\n\n`;
    text += `*Name:* ${checkoutName}\n`;
    text += `*Phone:* ${checkoutPhone}\n`;
    text += `*Address:* ${checkoutVillage ? checkoutVillage + ', ' : ''}${checkoutPincode}\n`;
    text += `\n*Order Details:*\n`;
    cart.forEach(item => {
      text += `${item.quantity}x ${item.name} - ₹${(Number(item.price) * item.quantity).toFixed(2)}\n`;
    });
    text += `\n*Total: ₹${cartTotal.toFixed(2)}*`;
    return text;
  };

  const handleWhatsAppCheckout = () => {
    if (!validateForm()) return;
    const text = generateOrderText();
    const targetNumber = String(contactButtons.whatsapp || socialLinks.whatsapp || contactButtons.call || socialLinks.phone || socialLinks.call).replace(/[^\d]/g, '');
    if (targetNumber) {
      window.open(`https://wa.me/${targetNumber.replace('+', '')}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleEmailCheckout = async () => {
    if (!validateForm()) return;
    
    setIsSubmittingOrder(true);
    setFormError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_slug: card.slug,
          order_data: {
            name: checkoutName,
            phone: checkoutPhone,
            email: checkoutEmail,
            pincode: checkoutPincode,
            village: checkoutVillage
          },
          cart_items: cart
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit order');
      }

      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setIsCartOpen(false);
        setOrderSuccess(false);
        setCheckoutName('');
        setCheckoutPhone('');
        setCheckoutEmail('');
        setCheckoutPincode('');
        setCheckoutVillage('');
      }, 3000);
    } catch (err) {
      setFormError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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
  const hasBusinessBlock = (showCompany && (companyDetails.company_name || companyDetails.gst || companyDetails.website)) || (showAddress && fullAddress);

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
  const surface       = isDark ? 'bg-[#0f0f13]' : 'bg-white';
  const surfaceSoft   = isDark ? 'bg-white/[0.04]' : 'bg-slate-50';
  const borderSoft    = isDark ? 'border-white/10' : 'border-slate-200';
  const ringSoft      = isDark ? 'ring-white/10' : 'ring-slate-200';
  
  // Consistent interactive card style used for Connect, Business, Location, etc.
  const cardStyle     = `${surfaceSoft} ring-1 ${ringSoft} transition-all hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-white shadow-sm'}`;

  const textMain      = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted     = isDark ? 'text-slate-400' : 'text-slate-500';
  const textSubtle    = isDark ? 'text-slate-300' : 'text-slate-600';
  const pageBg        = isDark ? 'bg-[#08080C]' : 'bg-slate-100';

  const sectionVariants: any = {
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
            <Hero3DBackground primaryColor={primaryColor} secondaryColor={secondaryColor} />
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
                  className="absolute -inset-1 rounded-full opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                />
                <div
                  className={`relative z-10 h-28 w-28 overflow-hidden rounded-full ring-4 sm:h-32 sm:w-32 ${isDark ? 'ring-[#12121A] bg-[#12121A]' : 'ring-white bg-white'} shadow-xl`}
                >
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImage} alt={personalInfo.name || 'Profile'} className="relative z-10 h-full w-full object-cover" />
                  ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center text-4xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                      {(personalInfo.name || 'U').trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ${isDark ? 'ring-[#12121A]' : 'ring-white'}`}>
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
                {card.category && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${surfaceSoft} ${textSubtle} ring-1 ${borderSoft}`}>
                    <Icon.Tag className="h-3 w-3" />
                    {card.category.name}
                    {card.subcategory && ` › ${card.subcategory.name}`}
                  </span>
                )}
                {showCompany && (companyDetails.company_name || personalInfo.company) && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${surfaceSoft} ${textSubtle} ring-1 ${borderSoft}`}>
                    <Icon.Building className="h-3 w-3" />
                    {companyDetails.company_name || personalInfo.company}
                  </span>
                )}
                <span
                  className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm overflow-hidden"
                >
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, opacity: isDark ? 0.2 : 0.15 }} />
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset" style={{ borderColor: primaryColor, opacity: 0.5 }} />
                  <Icon.Bolt className="relative z-10 h-3 w-3" style={{ color: primaryColor }} />
                  <span className="relative z-10" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>NFC Enabled</span>
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
                tint={primaryColor}
                isDark={isDark}
                icon={<Icon.Save className="h-5 w-5" />}
              />
            </motion.div>

            {/* ---- ABOUT ---- */}
            {personalInfo.bio && (
              <Section title="About" isDark={isDark} textMuted={textMuted}>
                <div className={`rounded-2xl p-4 ${cardStyle}`}>
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
                        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl ${cardStyle}`}
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
                <div className="flex flex-col gap-3">
                  {showCompany && companyDetails.company_name && (
                    <InfoRow
                      icon={<Icon.Building className="h-5 w-5" style={{ color: primaryColor }} />}
                      label="Company"
                      value={companyDetails.company_name}
                      isDark={isDark}
                    />
                  )}
                  {showCompany && companyDetails.gst && (
                    <InfoRow
                      icon={<Icon.Wallet className="h-5 w-5" style={{ color: primaryColor }} />}
                      label="GST"
                      value={
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{companyDetails.gst}</span>
                          <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                            <Icon.Check className="w-2.5 h-2.5 text-green-400" />
                            Verified
                          </span>
                        </div>
                      }
                      onCopy={() => copyToClipboard('gst', companyDetails.gst)}
                      copied={copied === 'gst'}
                      isDark={isDark}
                      action={
                        <button
                          onClick={() => handleVerifyGst(companyDetails.gst)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:scale-105 active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                          <Icon.Check className="h-3.5 w-3.5" />
                          Verify
                        </button>
                      }
                    />
                  )}
                  {showCompany && companyDetails.website && (
                    <InfoRow
                      icon={<Icon.Globe className="h-5 w-5" style={{ color: primaryColor }} />}
                      label="Website"
                      value={companyDetails.website}
                      href={companyDetails.website}
                      tint={primaryColor}
                      isDark={isDark}
                    />
                  )}
                  {showAddress && fullAddress && (
                    <InfoRow
                      icon={<Icon.MapPin className="h-5 w-5" style={{ color: primaryColor }} />}
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
                <div className={`group overflow-hidden rounded-2xl ${cardStyle}`}>
                  {/* Embedded Map */}
                  <div className="h-48 w-full bg-slate-200 dark:bg-slate-800">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent([locationInfo.village, locationInfo.city, locationInfo.state, locationInfo.pincode].filter(Boolean).join(', '))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
                      allowFullScreen
                    />
                  </div>
                  
                  {/* Location Details */}
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-black/20 group-hover:bg-black/40' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                        <Icon.MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Address</p>
                        <p className={`mt-1 break-words text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {[locationInfo.village, locationInfo.city].filter(Boolean).join(', ') || 'Location'}
                        </p>
                        <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {[locationInfo.state, locationInfo.pincode].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>

                    {locationInfo.map_url && (
                      <a
                        href={locationInfo.map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:scale-105 active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                      >
                        Directions
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M9 7h8v8" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* ---- PAYMENT (PAY ME) ---- */}
            {showPayment && hasPayment && (
              <Section title="Pay Me" isDark={isDark} textMuted={textMuted}>
                <div className={`grid grid-cols-2 gap-3`}>
                  {(paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.ifsc_code) && (
                    <button
                      onClick={() => setActivePaymentModal('bank')}
                      className={`flex flex-col items-start justify-center gap-1 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10' : 'bg-slate-50 hover:bg-white ring-1 ring-slate-200 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-50 text-indigo-600">
                          <Icon.Wallet className="h-4 w-4" />
                        </span>
                        <span className={`text-sm font-bold ${textMain}`}>Bank</span>
                      </div>
                      <span className={`text-[10px] ${textMuted}`}>Pay via Bank Transfer</span>
                    </button>
                  )}
                  {(paymentInfo.qr_path || paymentInfo.upi_id || paymentInfo.upi || paymentInfo.phonepe) && (
                    <button
                      onClick={() => setActivePaymentModal('barcode')}
                      className={`flex flex-col items-start justify-center gap-1 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10' : 'bg-slate-50 hover:bg-white ring-1 ring-slate-200 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                          <Icon.QrCode className="h-4 w-4" />
                        </span>
                        <span className={`text-sm font-bold ${textMain}`}>Bar Code</span>
                      </div>
                      <span className={`text-[10px] ${textMuted}`}>Scan QR or UPI</span>
                    </button>
                  )}
                </div>

                {/* Download Brochure (If exists) */}
                {companyDetails.brochure_url && (
                  <a
                    href={companyDetails.brochure_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500 py-3 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10`}
                  >
                    <Icon.Download className="h-4 w-4" />
                    Download Brochure (PDF)
                  </a>
                )}
              </Section>
            )}

            {/* ---- PRODUCTS (SHOP) ---- */}
            {products && products.length > 0 && (
              <div className="mt-8 px-1">
                <div className="mb-4 flex items-end justify-between px-1">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Our Products</h2>
                  <span className={`text-sm font-medium ${textMuted}`}>{products.length} items</span>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Icon.Search className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={`w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition ${
                      isDark ? 'bg-white/5 text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-white/20' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-transparent focus:ring-2 focus:ring-black/5'
                    }`}
                  />
                </div>

                {/* Categories */}
                {productCategories.length > 1 && (
                  <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {productCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? isDark
                              ? 'bg-white text-black'
                              : `text-white`
                            : isDark
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                        style={selectedCategory === cat && !isDark ? { backgroundColor: primaryColor } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                    {filteredProducts.map((product: any) => {
                      const inCart = cart.some(item => item.id === product.id);
                      
                      return (
                        <div key={product.id} className={`group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-white ring-1 ring-slate-200 shadow-sm'} transition-shadow hover:shadow-lg`}>
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-white/5">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-300">
                                <Icon.Image className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                              </div>
                            )}
                            {product.category && (
                              <div className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-white/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-slate-800 backdrop-blur-md shadow-sm">
                                {product.category}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                            <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{product.name}</h4>
                            {product.description && (
                              <p className={`mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
                            )}
                            <div className="mt-2 sm:mt-4 flex items-center justify-between">
                              <p className={`text-sm sm:text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{Number(product.price).toLocaleString('en-IN')}</p>
                              <button
                                onClick={() => {
                                  if (inCart) {
                                    setIsCartOpen(true);
                                  } else {
                                    addToCart(product);
                                  }
                                }}
                                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                                  inCart ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-white shadow-md'
                                }`}
                                style={inCart ? {} : { backgroundColor: primaryColor }}
                              >
                                {inCart ? <Icon.Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Icon.ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />}
                                <span className="hidden sm:inline">{inCart ? 'Added' : 'Add'}</span>
                                <span className="sm:hidden">{inCart ? 'In Cart' : 'Add'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center rounded-3xl py-12 text-center ${cardStyle}`}>
                    <Icon.Search className={`mb-3 h-8 w-8 opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>No products found</p>
                    <p className={`mt-1 text-xs ${textMuted}`}>Try adjusting your search or category filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---- INQUIRY FORM ---- */}
            {customBranding.show_lead_form !== false && (
              <Section title="Send an Inquiry" isDark={isDark} textMuted={textMuted}>
                <div className={`rounded-2xl p-5 ${cardStyle}`}>
                  <p className="text-base font-semibold">Get in touch</p>
                  <p className={`mt-0.5 text-xs ${textMuted}`}>We'll reply within 24 hours.</p>
                  <div className="mt-4">
                    <LeadForm cardId={card.id} bare isDark={isDark} primaryColor={primaryColor} />
                  </div>
                </div>
              </Section>
            )}

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
      {/* ---- CART MODAL ---- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`w-full max-w-md overflow-hidden rounded-3xl ${surface} shadow-2xl ring-1 ${borderSoft} flex flex-col max-h-[90vh]`}
          >
            <div className={`flex items-center justify-between border-b ${borderSoft} px-5 py-4`}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Your Cart</h2>
                {cart.length > 0 && !orderSuccess && (
                  <button onClick={() => setCart([])} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition underline underline-offset-2">
                    Reset Cart
                  </button>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)} className={`rounded-full p-2 hover:bg-slate-200 dark:hover:bg-white/10 transition`}>
                <Icon.X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Icon.ShoppingCart className="h-12 w-12 opacity-50 mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 rounded-2xl ${surfaceSoft} p-3 ring-1 ${borderSoft}`}>
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon.Building className="h-full w-full p-3 opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-semibold">{item.name}</h4>
                        <p className={`text-xs`} style={{ color: primaryColor }}>₹{Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center rounded-lg bg-black/5 dark:bg-white/10 p-1">
                          <button onClick={() => updateCartQty(item.id, -1)} className="p-1 hover:text-slate-900 dark:hover:text-white transition">
                            <Icon.Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="p-1 hover:text-slate-900 dark:hover:text-white transition">
                            <Icon.Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition">
                          <Icon.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className={`mt-2 border-t ${borderSoft} pt-4`}>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span style={{ color: primaryColor }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Your Details</p>
                    
                    {formError && (
                      <div className="rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/20 text-rose-500 text-xs font-semibold">
                        {formError}
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Name *"
                      value={checkoutName}
                      onChange={e => setCheckoutName(e.target.value)}
                      className={`w-full rounded-xl border-none ${surfaceSoft} ring-1 ${borderSoft} px-4 py-3 text-sm focus:ring-2`}
                      style={{ outlineColor: primaryColor }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={checkoutPhone}
                      onChange={e => setCheckoutPhone(e.target.value)}
                      className={`w-full rounded-xl border-none ${surfaceSoft} ring-1 ${borderSoft} px-4 py-3 text-sm focus:ring-2`}
                      style={{ outlineColor: primaryColor }}
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={checkoutEmail}
                      onChange={e => setCheckoutEmail(e.target.value)}
                      className={`w-full rounded-xl border-none ${surfaceSoft} ring-1 ${borderSoft} px-4 py-3 text-sm focus:ring-2`}
                      style={{ outlineColor: primaryColor }}
                    />
                    <input
                      type="text"
                      placeholder="Pincode (6 digits) *"
                      maxLength={6}
                      value={checkoutPincode}
                      onChange={e => setCheckoutPincode(e.target.value.replace(/\D/g, ''))}
                      className={`w-full rounded-xl border-none ${surfaceSoft} ring-1 ${borderSoft} px-4 py-3 text-sm focus:ring-2`}
                      style={{ outlineColor: primaryColor }}
                    />
                    
                    {isFetchingPincode && (
                      <p className={`text-[11px] font-medium ${textMuted} px-2`}>Loading localities...</p>
                    )}

                    {postOffices.length > 0 && (
                      <select
                        value={checkoutVillage}
                        onChange={e => setCheckoutVillage(e.target.value)}
                        className={`w-full rounded-xl border-none ${surfaceSoft} ring-1 ${borderSoft} px-4 py-3 text-sm focus:ring-2`}
                        style={{ outlineColor: primaryColor }}
                      >
                        <option value="" disabled className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Select Village / Area *</option>
                        {postOffices.map((po, i) => (
                          <option key={i} value={po.Name} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                            {po.Name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && !orderSuccess && (
              <div className={`border-t ${borderSoft} p-5 flex flex-col gap-2 bg-black/5 dark:bg-white/5`}>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <Icon.Whatsapp className="h-5 w-5" />
                  Order via WhatsApp
                </button>
                {email && (
                  <button
                    onClick={handleEmailCheckout}
                    disabled={isSubmittingOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-70"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmittingOrder ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Icon.Mail className="h-5 w-5" />
                        Order via Email
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {orderSuccess && (
              <div className={`border-t ${borderSoft} p-5 flex flex-col items-center justify-center gap-3 bg-emerald-500/10`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Icon.Check className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">Order Placed Successfully!</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check your email for the receipt.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ---- FLOATING CART BUTTON ---- */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
          style={{ backgroundColor: primaryColor, color: '#fff', boxShadow: `0 8px 32px ${primary30}` }}
        >
          <div className="relative">
            <Icon.ShoppingCart className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#12121A]">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* ---- GST VERIFICATION MODAL ---- */}
      <AnimatePresence>
        {showGstModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGstModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm overflow-hidden rounded-3xl ${isDark ? 'bg-[#12121A] ring-white/10' : 'bg-white ring-slate-200'} p-6 shadow-2xl ring-1`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                    <Icon.Check className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>GST Verification</h3>
                </div>
                <button onClick={() => setShowGstModal(false)} className={`rounded-full p-2 transition ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100'}`}>
                  <Icon.X className="h-5 w-5" />
                </button>
              </div>

              {verifyingGst ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
                  <p className="mt-4 text-sm font-medium text-slate-400">Fetching Govt. Records...</p>
                </div>
              ) : gstData?.error ? (
                <div className="rounded-2xl bg-red-500/10 p-4 text-center text-red-500 ring-1 ring-red-500/20">
                  <Icon.AlertTriangle className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-sm font-semibold">{gstData.error}</p>
                </div>
              ) : gstData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Legal Name</p>
                    <p className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{gstData.legal_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                      <p className="mt-1 font-semibold text-emerald-500">{gstData.status}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Taxpayer Type</p>
                      <p className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{gstData.taxpayer_type}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Principal Place of Business</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{gstData.principal_place_of_business}</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---- PAYMENT MODAL ---- */}
      <AnimatePresence>
        {activePaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePaymentModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl ${surface} shadow-2xl ring-1 ${borderSoft} flex flex-col max-h-[90vh]`}
            >
              <div className="flex flex-col items-center p-6">
                <div className="mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/20" />
                
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setActivePaymentModal(null)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    <Icon.X className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold">{activePaymentModal === 'bank' ? 'Bank Details' : 'Bar Code / UPI'}</h2>
                <p className={`mt-1 text-sm ${textMuted}`}>{activePaymentModal === 'bank' ? 'Pay directly to bank account' : 'Scan or use UPI to pay'}</p>

                {activePaymentModal === 'bank' ? (
                  <div className="mt-6 w-full space-y-3">
                    {paymentInfo.bank_name && (
                      <div className={`w-full rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft} flex flex-col`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Bank Name</p>
                        <p className="mt-0.5 text-sm font-semibold">{paymentInfo.bank_name}</p>
                      </div>
                    )}
                    {paymentInfo.account_number && (
                      <div className={`w-full rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft} flex items-center justify-between`}>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Account Number</p>
                          <p className="mt-0.5 text-sm font-semibold">{paymentInfo.account_number}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard('modal_acc', paymentInfo.account_number)}
                          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition ${copied === 'modal_acc' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {copied === 'modal_acc' ? <Icon.Check className="h-4 w-4" /> : <Icon.Copy className="h-4 w-4" />}
                          {copied === 'modal_acc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                    {paymentInfo.ifsc_code && (
                      <div className={`w-full rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft} flex items-center justify-between`}>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>IFSC Code</p>
                          <p className="mt-0.5 text-sm font-semibold uppercase">{paymentInfo.ifsc_code}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard('modal_ifsc', paymentInfo.ifsc_code)}
                          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition ${copied === 'modal_ifsc' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {copied === 'modal_ifsc' ? <Icon.Check className="h-4 w-4" /> : <Icon.Copy className="h-4 w-4" />}
                          {copied === 'modal_ifsc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`mt-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl ${isDark ? 'bg-white' : 'bg-slate-50 ring-1 ring-slate-200'} p-3 shadow-sm`}>
                      {paymentInfo.qr_path ? (
                        <img src={paymentInfo.qr_path} alt="QR Code" className="h-full w-full object-contain" />
                      ) : (
                        <Icon.QrCode className="h-12 w-12 text-slate-300" />
                      )}
                    </div>

                    <div className="mt-8 w-full space-y-3">
                      {(paymentInfo.upi_id || paymentInfo.upi) && (
                        <div className={`w-full rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft} flex items-center justify-between`}>
                          <div className="min-w-0 pr-4">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>UPI ID</p>
                            <p className="mt-0.5 truncate text-sm font-semibold">{paymentInfo.upi_id || paymentInfo.upi}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('modal_upi', paymentInfo.upi_id || paymentInfo.upi)}
                            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition ${copied === 'modal_upi' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                          >
                            {copied === 'modal_upi' ? <Icon.Check className="h-4 w-4" /> : <Icon.Copy className="h-4 w-4" />}
                            {copied === 'modal_upi' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {paymentInfo.phonepe && (
                        <div className={`w-full rounded-2xl p-4 ${surfaceSoft} ring-1 ${borderSoft} flex items-center justify-between`}>
                          <div className="min-w-0 pr-4">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>PhonePe Number</p>
                            <p className="mt-0.5 truncate text-sm font-semibold">{paymentInfo.phonepe}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('modal_phonepe', paymentInfo.phonepe)}
                            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition ${copied === 'modal_phonepe' ? 'bg-emerald-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                          >
                            {copied === 'modal_phonepe' ? <Icon.Check className="h-4 w-4" /> : <Icon.Copy className="h-4 w-4" />}
                            {copied === 'modal_phonepe' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>

                    {paymentInfo.qr_path && (
                      <a
                        href={paymentInfo.qr_path}
                        download="payment_qr.png"
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                      >
                        <Icon.Download className="h-4 w-4" />
                        Download QR Code
                      </a>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
  action,
  cardStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  href?: string;
  tint?: string;
  onCopy?: () => void;
  copied?: boolean;
  isDark: boolean;
  action?: React.ReactNode;
  cardStyle?: string;
}) {
  return (
    <div className={`group flex items-center justify-between gap-4 rounded-2xl p-4 ${cardStyle || ''}`}>
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-black/20 group-hover:bg-black/40' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-sm font-medium hover:underline"
              style={{ color: tint }}
            >
              {value}
            </a>
          ) : (
            <div className={`mt-1 break-words text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {onCopy && (
          <button
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
              isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {copied ? <Icon.Check className="h-4 w-4 text-emerald-500" /> : <Icon.Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
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
  cardStyle,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  isDark: boolean;
  mono?: boolean;
  cardStyle?: string;
}) {
  return (
    <div className={`group flex items-center justify-between gap-2 rounded-2xl p-3 ${cardStyle || ''}`}>
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
