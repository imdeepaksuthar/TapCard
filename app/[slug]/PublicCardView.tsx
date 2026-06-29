'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import MeshGradient from '@/app/components/MeshGradient';
import { derivePalette } from '@/lib/colorUtils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import LeadForm from '../../components/LeadForm';
import { QRCodeCanvas } from 'qrcode.react';

gsap.registerPlugin(ScrollTrigger);

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

// Local inline placeholder (a self-contained SVG data URI) shown for
// products/services with no image — avoids a slow cross-origin request to an
// external stock-photo host on every such tile in the public card view.
const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='600'%20height='600'%20viewBox='0%200%2024%2024'%3E%3Crect%20width='24'%20height='24'%20fill='%23eef0f6'/%3E%3Cg%20fill='none'%20stroke='%23c2c8d6'%20stroke-width='1.4'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='3.5'%20y='4.5'%20width='17'%20height='15'%20rx='2'/%3E%3Ccircle%20cx='9'%20cy='10'%20r='1.6'/%3E%3Cpath%20d='M20%2016l-4.5-4.5L7%2019.5'/%3E%3C/g%3E%3C/svg%3E";

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
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
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
  ChevronLeft: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  // Social brand glyphs (monochrome)
  Facebook: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  ),
  Twitter: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Instagram: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  ),
  LinkedIn: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  YouTube: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.52A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.13c1.9.52 9.4.52 9.4.52s7.5 0 9.4-.52a3 3 0 0 0 2.1-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z" />
    </svg>
  ),
  ShoppingCart: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  FileText: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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
  Calendar: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  Star: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  MessageCircle: (p: AnyObj) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

// Extracts a clean username from any stored value:
// - Plain username: "imdeep" → "imdeep"
// - Correct platform URL: "https://instagram.com/imdeep" → "imdeep"
// - Localhost or wrong URL: "http://127.0.0.1:3000/c/imdeep-xyz" → last path segment
const extractUsername = (v: string): string => {
  if (!v) return '';
  if (!v.startsWith('http')) return v.replace(/^@/, '').trim();
  try {
    const url = new URL(v);
    // Get last non-empty path segment as the username
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || v;
  } catch {
    return v;
  }
};

const SOCIAL_META: Record<string, { label: string; color: string; href: (v: string) => string; Icon: any }> = {
  facebook: { label: 'Facebook', color: '#1877F2', href: (v) => `https://facebook.com/${extractUsername(v)}`, Icon: Icon.Facebook },
  twitter: { label: 'X', color: '#0F1419', href: (v) => `https://x.com/${extractUsername(v)}`, Icon: Icon.Twitter },
  instagram: { label: 'Instagram', color: '#E1306C', href: (v) => `https://instagram.com/${extractUsername(v)}`, Icon: Icon.Instagram },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', href: (v) => `https://linkedin.com/in/${extractUsername(v)}`, Icon: Icon.LinkedIn },
  youtube: { label: 'YouTube', color: '#FF0000', href: (v) => `https://youtube.com/@${extractUsername(v)}`, Icon: Icon.YouTube },
};

export default function PublicCardView({ data, products = [], services = [] }: { data: any, products?: any[], services?: any[] }) {
  const { card } = data;
  const isPersonal = card.card_type === 'personal' || card.template_id === 'personal';
  const isProfessional = card.card_type === 'professional' || card.template_id === 'professional';
  const personalInfo = asObject(card.personal_info);
  const contactButtons = asObject(card.contact_buttons);
  const socialLinks = asObject(card.social_links);
  const paymentInfo = asObject(card.payment_info);
  const companyDetails = asObject(card.company_details);
  const customBranding = asObject(card.custom_branding);

  const proprietorDetails = Array.isArray(card.proprietor_details) ? card.proprietor_details : [];
  const galleryContent = Array.isArray(card.gallery_content) ? card.gallery_content : [];
  const openingHours = asObject(card.opening_hours);
  const locationInfo = asObject(card.location_info);
  const brochurePdfs = Array.isArray(card.brochure_pdfs) ? card.brochure_pdfs : [];

  const showSocial = customBranding.show_social !== false;
  const showCompany = customBranding.show_company !== false;
  const showPayment = customBranding.show_payment !== false;
  const showProprietor = customBranding.show_proprietor !== false;
  const showGallery = customBranding.show_gallery !== false;
  const showHours = customBranding.show_hours !== false;
  const showAddress = customBranding.show_address !== false;
  const showLocation = customBranding.show_location !== false;
  const showBrochures = customBranding.show_brochures !== false;

  const [isDark, setIsDark] = useState<boolean>(true); // Default SSR
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [shareOk, setShareOk] = useState(false);

  // Sync theme with system preference ONCE on mount only (not as a live listener,
  // so that the manual toggle button is never overridden by the OS preference).
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
    }
  }, []);

  const mainRef = useRef<HTMLElement>(null);

  // GSAP entrance animations — useEffect with [] so this runs EXACTLY ONCE on mount.
  // Using plain useEffect avoids the @gsap/react useGSAP automatic revert-on-re-render
  // behaviour which was resetting opacity/scale to 0 every time isDark state changed.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Entrance animations for top elements
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.gsap-hero', {
        opacity: 0,
        scaleY: 0.8,
        transformOrigin: 'top center',
        duration: 0.8,
      })
        .from('.gsap-profile-avatar', {
          opacity: 0,
          scale: 0.6,
          y: 30,
          duration: 0.8,
          ease: 'back.out(1.5)',
        }, '-=0.4')
        .from('.gsap-profile-badge', {
          opacity: 0,
          scale: 0,
          rotation: -60,
          duration: 0.4,
          ease: 'back.out(2)',
        }, '-=0.2')
        .from('.gsap-profile-name', {
          opacity: 0,
          y: 20,
          duration: 0.6,
        }, '-=0.4')
        .from('.gsap-profile-title', {
          opacity: 0,
          y: 15,
          duration: 0.5,
        }, '-=0.4')
        .from('.gsap-profile-tags > *', {
          opacity: 0,
          scale: 0.8,
          y: 10,
          stagger: 0.08,
          duration: 0.5,
        }, '-=0.3')
        .from('.gsap-connect-header', {
          opacity: 0,
          y: 10,
          duration: 0.4,
        }, '-=0.2')
        .from('.gsap-connect-socials > *', {
          opacity: 0,
          scale: 0,
          rotation: 20,
          stagger: 0.05,
          duration: 0.5,
          ease: 'back.out(1.8)',
        }, '-=0.3')
        .from('.gsap-quick-actions > *', {
          opacity: 0,
          y: 20,
          stagger: 0.06,
          duration: 0.6,
        }, '-=0.3')
        .from('.gsap-sticky-bar', {
          opacity: 0,
          y: 80,
          duration: 0.8,
          ease: 'power4.out',
        }, '-=0.5');

      // ScrollTrigger for sections
      const sections = gsap.utils.toArray<HTMLElement>('.gsap-section');
      sections.forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: 'power2.out',
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, []); // ← empty deps: run once on mount only


  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
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

  // Gallery Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Feedback & Rating State
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // Generate or retrieve a unique device ID from localStorage
  const getDeviceId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('tapcard_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('tapcard_device_id', deviceId);
    }
    return deviceId;
  }, []);

  // Fetch reviews on mount
  useEffect(() => {
    if (!card.id) return;
    const deviceId = getDeviceId();
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reviews?card_id=${card.id}&device_id=${deviceId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.avg_rating || 0);
        setTotalReviews(data.total_reviews || 0);
        setHasAlreadyReviewed(data.has_reviewed || false);
      })
      .catch(() => {});
  }, [card.id, getDeviceId]);

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewName.trim()) return;
    setIsSubmittingReview(true);
    try {
      const deviceId = getDeviceId();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: card.id,
          device_id: deviceId,
          reviewer_name: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      if (res.status === 409) {
        // Already reviewed from this device
        setHasAlreadyReviewed(true);
        setIsSubmittingReview(false);
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReviews(prev => [data.review, ...prev]);
      setAvgRating(data.avg_rating);
      setTotalReviews(data.total_reviews);
      setReviewRating(0);
      setReviewName('');
      setReviewComment('');
      setReviewSuccess(true);
      setHasAlreadyReviewed(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch {}
    setIsSubmittingReview(false);
  };


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

  // Products state (always uses products — services have their own section below)
  const items = products;
  const itemLabel = 'Our Products';
  const itemSearchPlaceholder = 'Search products...';
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productToView, setProductToView] = useState<any>(null);
  const [productViewImgIdx, setProductViewImgIdx] = useState(0);

  // Native Appointment Booking State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentStep, setAppointmentStep] = useState<number>(1);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [localBookedSlots, setLocalBookedSlots] = useState<any[]>(data.booked_slots || []);

  const [currentUrl, setCurrentUrl] = useState(`https://tapcard.com/${card?.slug}`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll and sync with GSAP ticker & ScrollTrigger
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(update);
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis scrolling when any modal is open to prevent background scrolling
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const isModalOpen = !!(
      isCartOpen ||
      productToView ||
      showGstModal ||
      activePaymentModal ||
      lightboxIndex !== null ||
      showAppointmentModal ||
      showQrModal
    );

    if (isModalOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isCartOpen, productToView, showGstModal, activePaymentModal, lightboxIndex, showAppointmentModal, showQrModal]);

  const productCategories = useMemo(() => {
    if (!items) return ['All'];
    const cats = new Set<string>();
    items.forEach((p: any) => {
      if (p.is_active && p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [items]);

  const filteredProducts = useMemo(() => {
    if (!items) return [];
    return items.filter((p: any) => {
      if (!p.is_active) return false;
      const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.description?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, productSearch, selectedCategory]);

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

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
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
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: any) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const themeName = customBranding.theme_color || card.theme_color || 'indigo';
  const primaryColor = customBranding.primary_color || data.theme?.primary_color || getHexColor(themeName);
  const palette = useMemo(() => derivePalette(primaryColor), [primaryColor]);
  const secondaryColor = customBranding.secondary_color || palette.accent;
  const primary15 = hexToRgba(primaryColor, 0.15);
  const primary30 = hexToRgba(primaryColor, 0.3);

  const profileImage =
    card.profile_image ||
    personalInfo.profile_image ||
    null;

  // Pull contact methods, falling back to social_links if contact_buttons is empty
  const phone = contactButtons.call || socialLinks.phone || socialLinks.call;
  const whatsapp = contactButtons.whatsapp || socialLinks.whatsapp;
  const email = contactButtons.email || socialLinks.email;

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
        setCheckoutStep(1);
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

  const cleanedPhone = phone ? String(phone).replace(/[^\d+]/g, '') : '';
  const cleanedWhatsapp = whatsapp ? String(whatsapp).replace(/[^\d]/g, '') : '';

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

  const hasPayment = !isPersonal && !!(paymentInfo.upi_id || paymentInfo.upi || paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.qr_path);
  const hasLocationBlock = !isPersonal && showLocation && (locationInfo.city || locationInfo.state || locationInfo.map_url);
  const hasBusinessBlock = !isPersonal && showCompany && (companyDetails.company_name || companyDetails.gst || companyDetails.website || (showAddress && fullAddress));

  const hasProprietorBlock = !isPersonal && showProprietor && proprietorDetails.length > 0 && proprietorDetails.some((p: any) => p.name);
  const hasGalleryBlock = showGallery && galleryContent.length > 0;
  // Opening hours block: only show if at least one day has a real time value OR is marked closed (excluding default Sunday)
  const hasHoursBlock = !isPersonal && showHours && Object.keys(openingHours).length > 0 &&
    (Object.values(openingHours).some((h: any) => h && h.open && h.open.trim() && h.open !== '--:-- --') ||
     Object.entries(openingHours).some(([day, h]: any) => day.toLowerCase() !== 'sunday' && h && h.closed === true));
  const hasBrochuresBlock = !isPersonal && showBrochures && brochurePdfs.length > 0;

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch { }
  };

  const generateTimeSlots = (dateString: string) => {
    if (!card.appointment_details || !dateString) return [];

    const { working_days, start_time, end_time, slot_duration } = card.appointment_details;
    const dateObj = new Date(dateString);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    if (working_days && !working_days.includes(dayName)) {
      return []; // Not a working day
    }

    const slots = [];
    const [startHour, startMin] = (start_time || '09:00').split(':').map(Number);
    const [endHour, endMin] = (end_time || '17:00').split(':').map(Number);
    const duration = Number(slot_duration || 30);

    let current = new Date(dateObj);
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(dateObj);
    end.setHours(endHour, endMin, 0, 0);

    const bookedSlots = localBookedSlots;

    while (current < end) {
      const timeString = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Convert current time to backend format HH:mm:ss safely
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      const backendTimeFormat = `${h}:${m}:00`;

      const isBooked = bookedSlots.some((bs: any) => bs.date === dateString && bs.time === backendTimeFormat);

      slots.push({ time: timeString, isBooked });

      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingName || !bookingEmail) return;

    setIsSubmittingBooking(true);
    setFormError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards/public/${card.slug}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          date: bookingDate,
          time: bookingTime,
          notes: bookingNotes
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Failed to book appointment');

      // Add to local booked slots to hide it immediately in current session
      const dateObjLocal = new Date(`2000-01-01 ${bookingTime}`);
      const hLocal = dateObjLocal.getHours().toString().padStart(2, '0');
      const mLocal = dateObjLocal.getMinutes().toString().padStart(2, '0');
      const backendTimeStr = `${hLocal}:${mLocal}:00`;
      setLocalBookedSlots((prev) => [...prev, { date: bookingDate, time: backendTimeStr }]);

      setBookingSuccess(true);
      setTimeout(() => {
        setShowAppointmentModal(false);
        setBookingSuccess(false);
        setBookingName('');
        setBookingEmail('');
        setBookingPhone('');
        setBookingNotes('');
        setBookingDate('');
        setBookingTime('');
        setAppointmentStep(1);
      }, 3000);
    } catch (err) {
      setFormError('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = personalInfo.name ? `${personalInfo.name} · Digital Card` : 'Digital Card';
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
        return;
      } catch { }
    }
    if (url) await copyToClipboard('share', url);
    setShareOk(true);
    setTimeout(() => setShareOk(false), 1600);
  };

  const handleSaveContact = async () => {
    const vcardUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cards/public/${card.slug}/vcard`;

    try {
      setSaving(true);

      const ua = navigator.userAgent || '';
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua);

      // iOS Safari: direct navigation triggers native contacts import
      if (isIOS || isSafari) {
        window.location.href = vcardUrl;
        return;
      }

      // Android & Desktop: fetch blob and trigger download
      const res = await fetch(vcardUrl);
      if (!res.ok) throw new Error('vcard fetch failed');
      const blob = await res.blob();
      const vcfBlob = new Blob([await blob.arrayBuffer()], { type: 'text/vcard' });
      const blobUrl = window.URL.createObjectURL(vcfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${(personalInfo.name || 'contact').replace(/\s+/g, '_')}.vcf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      }, 300);
    } catch {
      // Fallback: navigate directly to vCard URL (works on most platforms)
      try {
        window.location.href = vcardUrl;
      } catch {
        // Last resort: open tel: link
        if (cleanedPhone) window.location.href = `tel:${cleanedPhone}`;
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQr = () => {
    try {
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(personalInfo.name || 'qr_code').replace(/\s+/g, '_')}_card.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
      }, 100);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  // ─── Adaptive theme tokens (polished light + dark, brand-tinted) ───
  // Legacy names kept so existing call-sites stay valid; values upgraded so
  // every surface carries a faint wash of the brand color in BOTH modes.
  const surfaceSoft = isDark ? 'bg-white/[0.04]' : 'bg-white';
  const borderSoft = isDark ? 'border-white/10' : 'border-slate-200/70';
  const ringSoft = isDark ? 'ring-white/10' : 'ring-slate-200/70';

  // Consistent interactive card style used for Connect, Business, Location, etc.
  const cardStyle = `${surfaceSoft} ring-1 ${ringSoft} transition-all hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-white shadow-sm'}`;

  const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textSubtle = isDark ? 'text-slate-300' : 'text-slate-600';

  // Page background — a soft brand-tinted wash in BOTH modes (was a flat
  // brand-agnostic slate in light mode before) so each card feels branded.
  const pageStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#08080C' : '#eef0f6',
    backgroundImage: `radial-gradient(125% 85% at 50% -12%, ${hexToRgba(primaryColor, isDark ? 0.16 : 0.14)} 0%, transparent 60%)`,
    color: isDark ? '#f1f5f9' : '#0f172a',
    transition: 'background-color 300ms ease, color 300ms ease',
  };
  // The main rounded card surface behind the bento grid — subtle brand sheen up top.
  const cardSurfaceStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#0f0f13' : '#ffffff',
    backgroundImage: `linear-gradient(180deg, ${hexToRgba(primaryColor, isDark ? 0.06 : 0.05)}, transparent 240px)`,
    transition: 'background-color 300ms ease',
  };

  const sectionVariants: any = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <main
      ref={mainRef}
      className={`relative min-h-screen flex flex-col w-full font-sans ${textMain}`}
      style={pageStyle}
    >
      {/* Animated mesh gradient backdrop — derived from brand color */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <MeshGradient color={primaryColor} isDark={isDark} intensity={0.4} />
      </div>

      <div className="relative z-10 mx-auto flex flex-1 w-full max-w-[clamp(400px,92vw,1000px)] flex-col px-1.5 pt-1.5 pb-24 sm:px-[clamp(1rem,3vw,3rem)] sm:pt-[clamp(1rem,5vh,4rem)] sm:pb-[clamp(5rem,10vh,10rem)]">
        {/* ============ CARD ============ */}
        <div
          className={`relative flex-1 overflow-hidden rounded-3xl border ${borderSoft} shadow-2xl shadow-black/10 backdrop-blur`}
          style={cardSurfaceStyle}
        >
          <div className={showAllProducts ? 'hidden' : ''}>
            {/* ---- HERO ---- */}
            <div className="gsap-hero relative h-[clamp(6rem,16vh,10rem)] w-full overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 55%, ${palette.dark} 100%)` }}
              />
              {/* Premium mesh overlays */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.30) 0, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.20) 0, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0, transparent 70%)',
                }}
              />
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              {/* Bottom fade to card surface */}
              <div className="absolute inset-x-0 bottom-0 h-12" style={{ background: `linear-gradient(to bottom, transparent, ${isDark ? '#0f0f13' : '#ffffff'})` }} />

              {/* Top action bar */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/10">
                  <Icon.Eye className="h-3.5 w-3.5" />
                  {Number(card.views_count || 0).toLocaleString()} views
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    aria-label="Share via QR Code"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/30 hover:scale-105"
                  >
                    <Icon.QrCode className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsDark(prev => !prev)}
                    aria-label="Toggle theme"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/30 hover:scale-105"
                  >
                    {isDark ? <Icon.Sun className="h-4 w-4" /> : <Icon.Moon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ---- PROFILE ---- */}
          <div className="relative px-[clamp(1.25rem,4vw,2.5rem)] pb-[clamp(0.5rem,2vw,1rem)]">
            <div className={showAllProducts ? 'hidden' : ''}>
              <div className="-mt-[clamp(3.5rem,10vw,5rem)] flex flex-col items-center text-center pointer-events-none">
                <div className="gsap-profile-avatar relative h-[clamp(7rem,18vw,10rem)] w-[clamp(7rem,18vw,10rem)] pointer-events-auto">
                  <div
                    className="absolute -inset-1 rounded-full opacity-60 blur-lg"
                    style={{ background: `conic-gradient(from 0deg, ${primaryColor}, ${palette.accent}, ${palette.complement}, ${primaryColor})` }}
                  />
                  <div className={`relative z-10 h-full w-full overflow-hidden rounded-full ring-4 ${isDark ? 'ring-[#12121A] bg-[#12121A]' : 'ring-white bg-white'} shadow-xl`}>
                    {profileImage ? (
                      <Image 
                        src={profileImage} 
                        alt={personalInfo.name || 'Profile'} 
                        className="h-full w-full object-cover" 
                        priority 
                        width={128} 
                        height={128} 
                        unoptimized={profileImage.includes('data:image') || profileImage.includes('blob:')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${palette.accent})` }}>
                        {(personalInfo.name || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`gsap-profile-badge absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ${isDark ? 'ring-[#12121A]' : 'ring-white'}`}>
                    <Icon.Check className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>

                {personalInfo.name && (
                  <h1 className="gsap-profile-name mt-4 text-[clamp(1.5rem,4vw+0.5rem,2.5rem)] font-bold tracking-tight pointer-events-auto">{personalInfo.name}</h1>
                )}
                {personalInfo.designation && (
                  <p className={`gsap-profile-title mt-1 text-[clamp(0.875rem,2vw,1.125rem)] ${textSubtle} pointer-events-auto`}>{personalInfo.designation}</p>
                )}

                <div className="gsap-profile-tags mt-3 flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
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
                </div>
              </div>

              {/* ---- SOCIAL LINKS (SMALL) ---- */}
              {showSocial && filteredSocials.length > 0 && (
                <div className="mt-5 mb-2 flex flex-col items-center gap-2">
                  <p className={`gsap-connect-header text-[10px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>Connect</p>
                  <div className="gsap-connect-socials flex flex-wrap items-center justify-center gap-3">
                    {filteredSocials.map(([platform, url]) => {
                      const meta = SOCIAL_META[platform.toLowerCase()];
                      const resolvedHref = meta ? meta.href(String(url)) : String(url);
                      return (
                        <a
                          key={platform}
                          href={resolvedHref}
                          target="_blank"
                          rel="noreferrer"
                          title={meta?.label || platform}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white gsap-hover-safe-social hover:-translate-y-1 hover:shadow-lg hover:shadow-black/25 active:scale-95 shadow-sm ring-1 ring-white/10 hover:ring-white/20 will-change-transform"
                          style={{ backgroundColor: meta?.color || primaryColor }}
                        >
                          {meta ? <meta.Icon className="h-4 w-4" /> : <Icon.Globe className="h-4 w-4" />}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- QUICK ACTIONS ---- */}
              <div className="gsap-quick-actions mt-6 grid grid-cols-4 gap-[clamp(0.5rem,2vw,1rem)]">
                <QuickAction
                  disabled={!cleanedPhone}
                  href={cleanedPhone ? `tel:${cleanedPhone}` : undefined}
                  label="Call"
                  tint={primaryColor}
                  isDark={isDark}
                  icon={<Icon.Phone className="h-5 w-5" />}
                />
                <QuickAction
                  disabled={!cleanedWhatsapp}
                  href={cleanedWhatsapp ? `https://wa.me/${cleanedWhatsapp}` : undefined}
                  external
                  label="WhatsApp"
                  tint={primaryColor}
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
              </div>


              {/* ---- APPOINTMENT / SCHEDULE ---- */}
              {isProfessional && card.appointment_details?.is_enabled && (
                <div className="mt-6 w-full">
                  {(!card.appointment_details.booking_type || card.appointment_details.booking_type === 'url') ? (
                    card.appointment_details.booking_url && (
                      <a
                        href={card.appointment_details.booking_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Book an Appointment"
                        className="group relative w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 overflow-hidden"
                        style={{ backgroundColor: primaryColor, boxShadow: `0 8px 28px ${hexToRgba(primaryColor, 0.4)}, 0 2px 8px ${hexToRgba(primaryColor, 0.25)}` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Icon.Calendar className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">{card.appointment_details.title || 'Book an Appointment'}</span>
                      </a>
                    )
                  ) : (
                    <button
                      onClick={() => setShowAppointmentModal(true)}
                      className="group relative w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 overflow-hidden active:scale-[0.98] transition-transform"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 8px 28px ${hexToRgba(primaryColor, 0.4)}, 0 2px 8px ${hexToRgba(primaryColor, 0.25)}` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon.Calendar className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">{card.appointment_details.title || 'Book an Appointment'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* ============ BENTO GRID ============ */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-6 sm:gap-4 [grid-auto-flow:dense]">

              {/* ---- ABOUT ---- */}
              {personalInfo.bio && (
                <BentoTile title="About" tint={primaryColor} span="sm:col-span-6" isDark={isDark} textMuted={textMuted} bodyClassName="px-4 pb-4 pt-2">
                  <p className={`text-[14px] leading-relaxed ${textSubtle} whitespace-pre-wrap`}>
                    {personalInfo.bio}
                  </p>
                </BentoTile>
              )}



              {/* ---- BUSINESS ---- */}
              {hasBusinessBlock && (
                <BentoTile title="Business" icon={<Icon.Building className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-3" isDark={isDark} textMuted={textMuted} bodyClassName="px-1.5 pb-2 sm:px-2">
                  <div className="flex flex-col">
                    {showCompany && companyDetails.company_name && (
                      <div className={`${showCompany && (companyDetails.gst || companyDetails.website || fullAddress) ? (isDark ? 'border-b border-white/5' : 'border-b border-slate-200') : ''}`}>
                        <InfoRow
                          icon={<Icon.Building className="h-5 w-5" style={{ color: primaryColor }} />}
                          label="Company"
                          value={companyDetails.company_name}
                          isDark={isDark}
                        />
                      </div>
                    )}
                    {showCompany && companyDetails.gst && (
                      <div className={`${showCompany && (companyDetails.website || fullAddress) ? (isDark ? 'border-b border-white/5' : 'border-b border-slate-200') : ''}`}>
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
                        />
                      </div>
                    )}
                    {showCompany && companyDetails.website && (
                      <div className={`${showCompany && fullAddress ? (isDark ? 'border-b border-white/5' : 'border-b border-slate-200') : ''}`}>
                        <InfoRow
                          icon={<Icon.Globe className="h-5 w-5" style={{ color: primaryColor }} />}
                          label="Website"
                          value={companyDetails.website}
                          href={companyDetails.website.startsWith('http') ? companyDetails.website : `https://${companyDetails.website}`}
                          tint={primaryColor}
                          isDark={isDark}
                          ariaLabel="Visit Company Website"
                        />
                      </div>
                    )}
                    {showCompany && fullAddress && (
                      <div>
                        <InfoRow
                          icon={<Icon.MapPin className="h-5 w-5" style={{ color: primaryColor }} />}
                          label="Address"
                          value={fullAddress}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </BentoTile>
              )}

              {/* ---- PROPRIETOR DETAILS ---- */}
              {hasProprietorBlock && (
                <BentoTile title="Proprietor & Team" icon={<Icon.Save className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-6" isDark={isDark} textMuted={textMuted}>
                  <div className={`grid grid-cols-1 ${proprietorDetails.length === 1 ? 'w-full' : 'sm:grid-cols-2'} gap-4`}>
                    {proprietorDetails.map((proprietor: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-2xl ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200'} flex flex-col gap-4`}>
                        <div className="flex items-center gap-4">
                          {proprietor.image ? (
                            <img src={proprietor.image} alt={proprietor.name} className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-white/10" loading="lazy" decoding="async" width={56} height={56} />
                          ) : (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-200 text-slate-500'}`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{proprietor.name}</h4>
                            {proprietor.designation && <p className={`text-sm font-medium truncate`} style={{ color: primaryColor }}>{proprietor.designation}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {proprietor.phone && (
                            <a href={`tel:${proprietor.phone}`} aria-label={`Call ${proprietor.name}`} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}>
                              <Icon.Phone className="w-3.5 h-3.5" />
                              Call
                            </a>
                          )}
                          {proprietor.whatsapp && (
                            <a href={`https://wa.me/${proprietor.whatsapp}`} target="_blank" rel="noreferrer" aria-label={`Message ${proprietor.name} on WhatsApp`} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>
                              <Icon.Whatsapp className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          )}
                          {proprietor.email && (
                            <a aria-label={`Email ${proprietor.name}`} href={`mailto:${proprietor.email}`} className={`flex items-center justify-center p-2 rounded-xl transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}>
                              <Icon.Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </BentoTile>
              )}

              {/* ---- LOCATION ---- */}
              {hasLocationBlock && (() => {
                const lat = locationInfo.latitude ? parseFloat(locationInfo.latitude) : null;
                const lng = locationInfo.longitude ? parseFloat(locationInfo.longitude) : null;
                const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
                const locationLabel = [locationInfo.village, locationInfo.city].filter(Boolean).join(', ') || 'Location';
                const mapsQuery = hasCoords
                  ? `${lat},${lng}`
                  : encodeURIComponent([locationInfo.address, locationInfo.village, locationInfo.city, locationInfo.state, locationInfo.pincode].filter(Boolean).join(', '));
                const mapsLink = locationInfo.map_url || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
                const embedSrc = hasCoords
                  ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.007},${lng + 0.01},${lat + 0.007}&layer=mapnik&marker=${lat},${lng}`
                  : `https://www.openstreetmap.org/export/embed.html?bbox=${''}&layer=mapnik`;

                return (
                  <BentoTile title="Location" icon={<Icon.MapPin className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-3" isDark={isDark} textMuted={textMuted} bodyClassName="p-2">
                    <div className="overflow-hidden rounded-2xl">
                      {/* Map embed */}
                      {hasCoords && (
                        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-slate-200 dark:bg-slate-800">
                          <iframe
                            src={embedSrc}
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                            title="Location Map"
                            style={{ filter: isDark ? 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)' : 'none' }}
                          />
                        </div>
                      )}

                      {/* Location details */}
                      <div className="flex items-start gap-3 p-4">
                        <span
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: primary15, color: primaryColor }}
                        >
                          <Icon.MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{locationLabel}</p>
                          <p className={`mt-0.5 text-xs ${textMuted}`}>
                            {[locationInfo.state, locationInfo.pincode].filter(Boolean).join(' · ')}
                          </p>
                          <a
                            href={mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Get directions on Maps"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                            style={{ color: primaryColor }}
                          >
                            {hasCoords ? 'Get Directions' : 'Open in Maps'}
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </BentoTile>
                );
              })()}

              {/* ---- GALLERY ---- */}
              {hasGalleryBlock && (
                <BentoTile title="Gallery" icon={<Icon.Image className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-3" isDark={isDark} textMuted={textMuted}>
                  {galleryContent.length === 1 ? (
                    <div
                      className="w-full cursor-pointer rounded-2xl"
                      onClick={() => setLightboxIndex(0)}
                    >
                      <div className={`w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl border ${borderSoft} group shadow-md`}>
                        <img
                          src={galleryContent[0]}
                          alt="Gallery image"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile: Clean 2-column grid */}
                      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                        {galleryContent.slice(0, 4).map((url: string, idx: number) => (
                          <div
                            key={idx}
                            className="relative cursor-pointer group"
                            onClick={() => setLightboxIndex(idx)}
                          >
                            <div className={`aspect-square overflow-hidden rounded-xl border ${borderSoft} shadow-sm`}>
                              <img src={url} alt={`Gallery item ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            {/* Show remaining count on last visible item */}
                            {idx === 3 && galleryContent.length > 4 && (
                              <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="text-white font-bold text-lg">+{galleryContent.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {galleryContent.length > 4 && (
                        <p className={`mt-2 text-center text-[11px] sm:hidden ${textMuted}`}>Tap to view all {galleryContent.length} photos</p>
                      )}

                      {/* Desktop: Grid showing all images */}
                      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {galleryContent.map((url: string, idx: number) => (
                          <div
                            key={idx}
                            className="relative cursor-pointer group"
                            onClick={() => setLightboxIndex(idx)}
                          >
                            <div className={`aspect-square overflow-hidden rounded-xl border ${borderSoft} shadow-sm`}>
                              <img src={url} alt={`Gallery item ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </BentoTile>
              )}

              {/* ---- BROCHURES ---- */}
              {hasBrochuresBlock && (
                <BentoTile title="Brochures" icon={<Icon.FileText className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-3" isDark={isDark} textMuted={textMuted}>
                  <div className="space-y-3">
                    {brochurePdfs.map((url: string, idx: number) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" aria-label={`Download Brochure ${idx + 1}`} className={`flex items-center justify-between p-4 rounded-xl transition hover:-translate-y-0.5 ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10' : 'bg-slate-50 hover:bg-white ring-1 ring-slate-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Brochure {idx + 1}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>PDF Document</p>
                          </div>
                        </div>
                        <Icon.Download className="w-4 h-4" style={{ color: primaryColor }} />
                      </a>
                    ))}
                  </div>
                </BentoTile>
              )}

              {/* ---- OPENING HOURS ---- */}
              {hasHoursBlock && (() => {
                const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const todayHours: any = Object.entries(openingHours).find(([d]) => d.toLowerCase() === todayName)?.[1];
                const isOpenNow = todayHours && !todayHours.closed;
                return (
                  <BentoTile title="Opening Hours" icon={<Icon.Calendar className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-3" isDark={isDark} textMuted={textMuted}>
                    {/* Today's status badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${isOpenNow
                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isOpenNow && todayHours?.open ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {isOpenNow && todayHours?.open && todayHours?.close
                          ? `Open Now · ${todayHours.open} – ${todayHours.close}`
                          : 'Closed Now'}
                      </span>
                    </div>
                    <div className={`rounded-2xl divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {Object.entries(openingHours)
                        .filter(([, hours]: [string, any]) => hours && (hours.closed === true || (hours.open && hours.open.trim() && hours.open !== '--:-- --')))
                        .map(([day, hours]: [string, any]) => {
                          const isToday = day.toLowerCase() === todayName;
                          return (
                            <div key={day} className={`flex justify-between items-center px-4 py-3 ${isToday ? (isDark ? 'bg-white/[0.06]' : 'bg-white') : ''
                              }`}>
                              <span className={`capitalize font-medium text-sm flex items-center gap-2 ${isToday ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-gray-400' : 'text-gray-500')
                                }`}>
                                {isToday && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />}
                                {day}
                                {isToday && <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>Today</span>}
                              </span>
                              {hours.closed ? (
                                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md">Closed</span>
                              ) : (
                                <span className={`text-sm font-medium ${isToday ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-gray-400' : 'text-gray-500')
                                  }`}>
                                  {hours.open} – {hours.close}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </BentoTile>
                );
              })()}

              {/* ---- PAYMENT (PAY ME) ---- */}
              {showPayment && hasPayment && (
                <BentoTile title="Pay Me" icon={<Icon.Wallet className="h-4 w-4" />} tint={primaryColor} span="sm:col-span-6" isDark={isDark} textMuted={textMuted}>
                  <div className={`grid gap-3 ${((paymentInfo.bank_name || paymentInfo.account_number || paymentInfo.ifsc_code) &&
                    (paymentInfo.qr_path || paymentInfo.upi_id || paymentInfo.upi || paymentInfo.phonepe))
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                    }`}>
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
                          <span className={`text-sm font-bold ${textMain}`}>QR / UPI</span>
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
                      aria-label="Download Brochure"
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500 py-3 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10`}
                    >
                      <Icon.Download className="h-4 w-4" />
                      Download Brochure (PDF)
                    </a>
                  )}
                </BentoTile>
              )}

              </div>
              {/* ============ /BENTO GRID ============ */}

            </div>

            {/* ---- PRODUCTS (SHOP) ---- */}
            {!isPersonal && items && items.length > 0 && (
              <div className={showAllProducts ? "mt-4 sm:mt-6" : "mt-6"}>
                {showAllProducts && (
                  <button
                    onClick={() => { setShowAllProducts(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <Icon.ChevronLeft className="h-4 w-4 -ml-1" />
                    Back to Profile
                  </button>
                )}
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>{itemLabel}</h3>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>{items.length} items</span>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Icon.Search className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder={itemSearchPlaceholder}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={`w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition ${isDark ? 'bg-white/5 text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-white/20' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-transparent focus:ring-2 focus:ring-black/5'
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
                        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${selectedCategory === cat
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
                  (() => {
                    const displayProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 12);
                    return (
                      <>
                        {displayProducts.length === 1 ? (
                          <div className="flex justify-center w-full">
                            {displayProducts.map((product: any) => {
                              const inCart = cart.some(item => item.id === product.id);
                              return (
                                <div
                                  key={product.id}
                                  className={`group flex flex-col sm:flex-row items-center overflow-hidden rounded-3xl cursor-pointer ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-white ring-1 ring-slate-200 shadow-sm'} transition-shadow hover:shadow-lg w-full max-w-xl`}
                                  onClick={() => { setProductToView(product); setProductViewImgIdx(0); }}
                                >
                                  <div className="relative aspect-[4/3] w-full sm:w-1/2 overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
                                    <img
                                      src={
                                        product.images?.[0] && (product.images[0].startsWith('http') || product.images[0].startsWith('/') || product.images[0].startsWith('data:'))
                                          ? product.images[0]
                                          : IMG_PLACEHOLDER
                                      }
                                      alt={product.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = IMG_PLACEHOLDER;
                                      }}
                                    />
                                    {product.category && (
                                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-800 backdrop-blur-md shadow-sm">
                                        {product.category}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-1 flex-col p-5 w-full">
                                    <h4 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{product.name}</h4>
                                    {product.description && (
                                      <p className={`mt-2 text-xs font-medium line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
                                    )}
                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                      {product.price !== null && product.price !== undefined && Number(product.price) > 0 ? (
                                        <p className={`text-lg sm:text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{Number(product.price).toLocaleString('en-IN')}</p>
                                      ) : null}
                                      <div className="flex items-center gap-2 w-full">
                                        {inCart ? (
                                          <div className={`flex-1 flex shrink-0 items-center justify-between rounded-xl px-2 py-1.5 transition-all shadow-md`} style={{ backgroundColor: primaryColor }}>
                                            <button onClick={(e) => { e.stopPropagation(); updateCartQty(product.id, -1); }} className="p-1.5 text-white active:scale-95 hover:bg-black/20 rounded-lg"><Icon.Minus className="h-4 w-4" /></button>
                                            <span className="text-white font-bold text-xs">{cart.find(i => i.id === product.id)?.quantity || 1}</span>
                                            <button onClick={(e) => { e.stopPropagation(); updateCartQty(product.id, 1); }} className="p-1.5 text-white active:scale-95 hover:bg-black/20 rounded-lg"><Icon.Plus className="h-4 w-4" /></button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addToCart(product);
                                            }}
                                            className={`flex-1 flex shrink-0 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 text-white shadow-md`}
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            {isProfessional ? <Icon.FileText className="h-4 w-4 shrink-0" /> : <Icon.ShoppingCart className="h-4 w-4 shrink-0" />}
                                            <span className="whitespace-nowrap">{isProfessional ? 'Add to Quote' : 'Add'}</span>
                                          </button>
                                        )}
                                        {cleanedWhatsapp && (
                                          <a
                                            href={`https://wa.me/${cleanedWhatsapp}?text=${encodeURIComponent(`Hi! I'm interested in *${product.name}*${Number(product.price) > 0 ? ` priced at ₹${Number(product.price).toLocaleString('en-IN')}` : ''}. Please share more details.`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label="Inquire via WhatsApp"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex shrink-0 items-center justify-center rounded-xl p-2.5 text-white transition-all active:scale-95 hover:opacity-90 aspect-square"
                                            style={{ backgroundColor: '#25D366' }}
                                            title="WhatsApp Inquiry"
                                          >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                            {displayProducts.map((product: any) => {
                              const inCart = cart.some(item => item.id === product.id);
                              const waHref = cleanedWhatsapp
                                ? `https://wa.me/${cleanedWhatsapp}?text=${encodeURIComponent(`Hi! I'm interested in *${product.name}*${Number(product.price) > 0 ? ` priced at ₹${Number(product.price).toLocaleString('en-IN')}` : ''}. Please share more details.`)}`
                                : null;

                              return (
                                <div
                                  key={product.id}
                                  className={`group flex flex-col h-full overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${isDark ? 'bg-white/[0.05] ring-1 ring-white/10 hover:ring-white/20' : 'bg-white ring-1 ring-slate-200/80 shadow-sm hover:shadow-slate-200'}`}
                                  onClick={() => { setProductToView(product); setProductViewImgIdx(0); }}
                                >
                                  {/* Product Image */}
                                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                                    <img
                                      src={
                                        product.images?.[0] && (product.images[0].startsWith('http') || product.images[0].startsWith('/') || product.images[0].startsWith('data:'))
                                          ? product.images[0]
                                          : IMG_PLACEHOLDER
                                      }
                                      alt={product.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = IMG_PLACEHOLDER;
                                      }}
                                    />
                                    {/* Category badge */}
                                    {product.category && (
                                      <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                        {product.category}
                                      </div>
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                                    {/* Name */}
                                    <div className="min-h-[1.5rem] sm:min-h-[1.75rem]">
                                      <h4 className={`text-sm sm:text-base font-bold leading-snug line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {product.name}
                                      </h4>
                                    </div>
                                    {/* Description */}
                                    <div className="min-h-[2rem] sm:min-h-[2.25rem] mt-1">
                                      {product.description && (
                                        <p className={`text-[11px] sm:text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          {product.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Divider */}
                                    <div className={`my-2.5 h-px w-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />

                                    {/* Price and Buttons */}
                                    <div className="mt-auto flex flex-col gap-2.5">
                                      <div className="min-w-0 w-full">
                                        {product.price !== null && product.price !== undefined && Number(product.price) > 0 ? (
                                          <p className={`truncate text-sm sm:text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                          </p>
                                        ) : (
                                          <p className={`truncate text-[10px] sm:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Price on request</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 w-full">
                                        {/* Add to Cart */}
                                        {inCart ? (
                                          <div className={`flex-1 flex shrink-0 items-center justify-between rounded-lg px-1.5 py-1 transition-all shadow-md`} style={{ backgroundColor: primaryColor }}>
                                            <button aria-label="Decrease quantity" onClick={(e) => { e.stopPropagation(); updateCartQty(product.id, -1); }} className="p-1.5 text-white active:scale-95 hover:bg-black/20 rounded-md"><Icon.Minus className="h-3 w-3" /></button>
                                            <span className="text-white font-bold text-[11px] sm:text-xs">{cart.find(i => i.id === product.id)?.quantity || 1}</span>
                                            <button aria-label="Increase quantity" onClick={(e) => { e.stopPropagation(); updateCartQty(product.id, 1); }} className="p-1.5 text-white active:scale-95 hover:bg-black/20 rounded-md"><Icon.Plus className="h-3 w-3" /></button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addToCart(product);
                                            }}
                                            className={`flex-1 flex shrink-0 items-center justify-center gap-1 rounded-lg py-2 text-[11px] sm:text-xs font-bold text-white transition-all active:scale-95 shadow-md`}
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            {isProfessional ? <Icon.FileText className="h-3 w-3 shrink-0" /> : <Icon.ShoppingCart className="h-3 w-3 shrink-0" />}
                                            <span className="whitespace-nowrap">{isProfessional ? 'Quote' : 'Add'}</span>
                                          </button>
                                        )}

                                        {/* WhatsApp Inquiry */}
                                        {waHref && (
                                          <a
                                            href={waHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label="Inquire via WhatsApp"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex shrink-0 items-center justify-center rounded-lg p-2 sm:p-2.5 text-white transition-all active:scale-95 hover:brightness-110 aspect-square"
                                            style={{ backgroundColor: '#25D366' }}
                                            title="WhatsApp Inquiry"
                                          >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                                              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                                            </svg>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {!showAllProducts && filteredProducts.length > 12 && (
                          <div className="mt-8 flex justify-center">
                            <button
                              onClick={() => { setShowAllProducts(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-transform active:scale-95 ${isDark ? 'bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/20' : 'bg-white text-slate-900 hover:bg-slate-50 ring-1 ring-slate-200'}`}
                            >
                              View All {filteredProducts.length} Products
                              <Icon.ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className={`flex flex-col items-center justify-center rounded-3xl py-12 text-center ${cardStyle}`}>
                    <Icon.Search className={`mb-3 h-8 w-8 opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>No items found</p>
                    <p className={`mt-1 text-xs ${textMuted}`}>Try adjusting your search or category filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---- SERVICES SECTION (visible on all card types) ---- */}
            {services && services.length > 0 && !showAllProducts && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>Our Services</h3>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${textMuted}`}>{services.filter((s: any) => s.is_active).length} services</span>
                </div>
                <div className="flex flex-col gap-4">
                  {services.filter((s: any) => s.is_active).map((service: any) => {
                    const waMsg = `Hi! I'm interested in your service *${service.name}*${Number(service.price) > 0 ? ` (₹${Number(service.price).toLocaleString('en-IN')})` : ''}. Please share more details.`;
                    const waHref = cleanedWhatsapp ? `https://wa.me/${cleanedWhatsapp}?text=${encodeURIComponent(waMsg)}` : null;
                    const imgs = service.images || [];
                    return (
                      <div
                        key={service.id}
                        className={`group flex flex-col sm:flex-row overflow-hidden rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${isDark ? 'bg-white/[0.05] ring-1 ring-white/10 hover:ring-white/20' : 'bg-white ring-1 ring-slate-200/80 shadow-sm hover:shadow-slate-200'
                          }`}
                      >
                        {/* Service Image */}
                        {imgs.length > 0 && (
                          <div className="relative w-full sm:w-36 shrink-0 overflow-hidden bg-slate-100 dark:bg-white/5">
                            <div className="aspect-video sm:aspect-square w-full h-full overflow-hidden">
                              <img
                                src={imgs[0]}
                                alt={service.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {/* Content */}
                        <div className="flex flex-1 flex-col p-4 gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {service.name}
                              </h4>
                              {service.price !== null && service.price !== undefined && Number(service.price) > 0 ? (
                                <span
                                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white whitespace-nowrap"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  ₹{Number(service.price).toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold border ${isDark ? 'border-white/20 text-slate-300' : 'border-slate-200 text-slate-500'
                                  }`}>
                                  Price on request
                                </span>
                              )}
                            </div>
                            {service.description && (
                              <p className={`mt-1.5 text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {service.description}
                              </p>
                            )}
                          </div>
                          {/* CTAs */}
                          <div className="flex items-center gap-2">
                            {waHref ? (
                              <a
                                href={waHref}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Inquire via WhatsApp"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition-all active:scale-95 shadow-md"
                                style={{ backgroundColor: primaryColor }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                                </svg>
                                Inquire on WhatsApp
                              </a>
                            ) : (
                              <a
                                href={cleanedPhone ? `tel:${cleanedPhone}` : `mailto:${email || ''}`}
                                aria-label="Inquire now"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition-all active:scale-95 shadow-md"
                                style={{ backgroundColor: primaryColor }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                                </svg>
                                Inquire Now
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={showAllProducts ? 'hidden' : ''}>

              {/* ---- INQUIRY FORM ---- */}
              {customBranding.show_lead_form !== false && (
                <BentoTile title="Send an Inquiry" icon={<Icon.Mail className="h-4 w-4" />} tint={primaryColor} span="mt-6" isDark={isDark} textMuted={textMuted} bodyClassName="px-4 pb-5 pt-2 sm:px-5">
                  <p className="text-base font-semibold">Get in touch</p>
                  <p className={`mt-0.5 text-xs ${textMuted}`}>We'll reply within 24 hours.</p>
                  <div className="mt-4">
                    <LeadForm cardId={card.id} bare isDark={isDark} primaryColor={primaryColor} />
                  </div>
                </BentoTile>
              )}

              {/* ---- FEEDBACK & RATINGS ---- */}
              <div className="mt-6 gsap-section">
                <div className={`rounded-2xl p-5 sm:p-6 ${isDark ? 'bg-white/[0.03] ring-1 ring-white/10' : 'bg-white ring-1 ring-slate-200/70 shadow-sm'}`}>
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: hexToRgba(primaryColor, 0.12) }}>
                      <Icon.Star className="h-4.5 w-4.5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>Feedback & Ratings</h3>
                      <p className={`text-[11px] ${textMuted}`}>Share your experience</p>
                    </div>
                  </div>

                  {/* Average Rating Summary */}
                  {totalReviews > 0 && (
                    <div className={`flex items-center gap-4 rounded-xl p-4 mb-5 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200/60'}`}>
                      <div className="text-center">
                        <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgRating}</div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon.Star
                              key={star}
                              className="h-3.5 w-3.5"
                              style={{
                                fill: star <= Math.round(avgRating) ? '#facc15' : 'transparent',
                                color: star <= Math.round(avgRating) ? '#facc15' : isDark ? '#475569' : '#cbd5e1',
                                strokeWidth: 1.5,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className={`h-10 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      <div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalReviews}</span>
                        <span className={`text-sm ml-1 ${textMuted}`}>{totalReviews === 1 ? 'Review' : 'Reviews'}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Review Form */}
                  {!hasAlreadyReviewed ? (
                    <AnimatePresence mode="wait">
                      {reviewSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`flex flex-col items-center justify-center gap-3 rounded-xl p-6 mb-5 ${isDark ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'bg-emerald-50 ring-1 ring-emerald-200'}`}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                            <Icon.Check className="h-6 w-6 text-emerald-500" />
                          </div>
                          <p className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Thank you for your feedback!</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`rounded-xl p-4 mb-5 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200/60'}`}
                        >
                          <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-700'}`}>Leave a Review</p>

                          {/* Star Rating Input */}
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setReviewRating(star)}
                                className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                              >
                                <Icon.Star
                                  className="h-7 w-7 transition-colors duration-150"
                                  style={{
                                    fill: star <= (hoveredStar || reviewRating) ? '#facc15' : 'transparent',
                                    color: star <= (hoveredStar || reviewRating) ? '#facc15' : isDark ? '#475569' : '#cbd5e1',
                                    strokeWidth: 1.5,
                                  }}
                                />
                              </button>
                            ))}
                            {reviewRating > 0 && (
                              <span className={`ml-2 text-xs font-medium ${textMuted}`}>
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                              </span>
                            )}
                          </div>

                          {/* Name Input */}
                          <input
                            type="text"
                            value={reviewName}
                            onChange={e => setReviewName(e.target.value)}
                            placeholder="Your Name *"
                            className={`w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all mb-2.5 ${isDark
                              ? 'bg-white/[0.06] text-white placeholder:text-slate-500 focus:ring-2 ring-white/20'
                              : 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-300'
                              }`}
                          />

                          {/* Comment Textarea */}
                          <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            placeholder="Share your experience (optional)"
                            rows={3}
                            className={`w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all resize-none mb-3 ${isDark
                              ? 'bg-white/[0.06] text-white placeholder:text-slate-500 focus:ring-2 ring-white/20'
                              : 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-300'
                              }`}
                          />

                          {/* Submit Button */}
                          <button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview || !reviewRating || !reviewName.trim()}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {isSubmittingReview ? (
                              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                              <>
                                <Icon.MessageCircle className="h-4 w-4" />
                                Submit Review
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl p-5 mb-5 text-center ${isDark ? 'bg-white/[0.02] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200/60'}`}>
                      <Icon.Check className="h-5 w-5 text-emerald-500 mb-1" />
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>You've already left a review.</p>
                      <p className={`text-xs ${textMuted}`}>Thanks for sharing your experience!</p>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Recent Reviews</p>
                      {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review: any, idx: number) => (
                        <div
                          key={review.id || idx}
                          className={`rounded-xl p-3.5 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200/60'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {review.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{review.reviewer_name}</p>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Icon.Star
                                      key={star}
                                      className="h-3 w-3"
                                      style={{
                                        fill: star <= review.rating ? '#facc15' : 'transparent',
                                        color: star <= review.rating ? '#facc15' : isDark ? '#475569' : '#cbd5e1',
                                        strokeWidth: 1.5,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className={`text-[10px] shrink-0 ${textMuted}`}>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            </span>
                          </div>
                          {review.comment && (
                            <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{review.comment}</p>
                          )}
                        </div>
                      ))}

                      {/* Show More / Less */}
                      {reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className={`w-full text-center text-xs font-semibold py-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                          {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* ============ QR CODE MODAL ============ */}
      <AnimatePresence>
        {showQrModal && (
          <div key="qr-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className={`relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center shadow-[0_32px_80px_rgba(0,0,0,0.6)] ${isDark
                  ? 'bg-[#0f0f1a]/90 text-white ring-1 ring-white/10 backdrop-blur-2xl'
                  : 'bg-white/90 text-slate-900 ring-1 ring-slate-200 backdrop-blur-2xl'
                }`}
            >
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)' }} />
              {/* Glow orb behind QR */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-30" style={{ backgroundColor: primaryColor }} />
              <button
                aria-label="Close QR Modal"
                onClick={() => setShowQrModal(false)}
                className={`absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isDark ? 'bg-white/8 text-slate-400 hover:bg-white/15 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                  }`}
              >
                <Icon.X className="h-4 w-4" />
              </button>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl relative z-10" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${palette.accent})`, boxShadow: `0 8px 24px ${hexToRgba(primaryColor, 0.4)}` }}>
                <Icon.QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-1 text-xl font-bold tracking-tight relative z-10">Share this Card</h3>
              <p className={`mb-8 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} relative z-10`}>Scan this QR code with any smartphone camera to view {personalInfo.name || 'this profile'}.</p>

              <div className={`mx-auto mb-6 flex items-center justify-center overflow-hidden rounded-2xl p-4 ring-1 relative z-10 ${isDark ? 'bg-white ring-white/10' : 'bg-white ring-slate-200'
                }`} style={{ boxShadow: `0 0 40px ${hexToRgba(primaryColor, 0.12)}` }}>
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={currentUrl}
                  size={192}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex gap-3 mt-2 relative z-10">
                <button
                  onClick={handleDownloadQr}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95 ${isDark ? 'bg-white/[0.08] text-white hover:bg-white/[0.14] ring-1 ring-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                >
                  <Icon.Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    handleShare();
                    setShowQrModal(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all active:scale-95 hover:opacity-90"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 4px 16px ${hexToRgba(primaryColor, 0.4)}` }}
                >
                  <Icon.Copy className="h-4 w-4" />
                  Copy Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---- STICKY ACTION BAR ---- */}
      <div className="gsap-sticky-bar fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 sm:pb-5">
        {/* Blur gradient ground shadow */}
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to top, rgba(8,8,12,0.85), transparent)' : 'linear-gradient(to top, rgba(241,245,249,0.90), transparent)' }} />
        <div
          className={`relative flex w-full max-w-md gap-2 rounded-full p-1.5 sm:max-w-xl md:max-w-2xl overflow-hidden`}
          style={{
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07) inset'
              : '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06) inset',
          }}
        >
          {/* Top shimmer */}
          <div className="absolute inset-x-0 top-0 h-px rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)' }} />
          <button
            onClick={handleSaveContact}
            disabled={saving}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-70 active:scale-95 ${isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            <Icon.Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handleShare}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all duration-300 active:scale-95 hover:opacity-90"
            style={{ backgroundColor: primaryColor, boxShadow: `0 4px 16px ${hexToRgba(primaryColor, 0.4)}` }}
          >
            {shareOk ? <Icon.Check className="h-4 w-4" /> : <Icon.Share className="h-4 w-4" />}
            {shareOk ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Toast for copy feedback */}
      {copied && copied !== 'share' && (
        <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Copied to clipboard
        </div>
      )}
      {/* ---- CART MODAL (Two-Step Checkout) ---- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ${borderSoft} grid max-h-[92vh] sm:max-h-[85vh]`}
            style={{ 
              backgroundColor: isDark ? '#0f0f13' : '#ffffff',
              gridTemplateRows: 'auto auto minmax(0, 1fr) auto'
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b ${borderSoft} px-5 py-4 shrink-0`}>
              <div className="flex items-center gap-3 min-w-0">
                {checkoutStep === 2 && !orderSuccess && (
                  <button
                    aria-label="Back to Cart"
                    onClick={() => { setCheckoutStep(1); setFormError(''); }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                  >
                    <Icon.ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-lg font-bold truncate">
                  {orderSuccess ? (isProfessional ? 'Request Sent' : 'Order Placed') : checkoutStep === 1 ? (isProfessional ? 'Your Quotation' : 'Your Cart') : 'Your Details'}
                </h2>
                {checkoutStep === 1 && cart.length > 0 && !orderSuccess && (
                  <button onClick={() => setCart([])} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition underline underline-offset-2 shrink-0">
                    Clear
                  </button>
                )}
              </div>
              <button aria-label="Close Cart Modal" onClick={() => { setIsCartOpen(false); setCheckoutStep(1); setFormError(''); }} className={`shrink-0 rounded-full p-2 transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                <Icon.X className="h-5 w-5" />
              </button>
            </div>

            {/* Step indicator */}
            {cart.length > 0 && !orderSuccess && (
              <div className={`flex items-center gap-2 px-5 py-3 border-b ${borderSoft} shrink-0`}>
                <div className="flex items-center gap-2 flex-1">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white`} style={{ backgroundColor: primaryColor }}>1</span>
                  <span className={`text-xs font-semibold ${checkoutStep === 1 ? (isDark ? 'text-white' : 'text-slate-900') : textMuted}`}>Review</span>
                </div>
                <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className={`text-xs font-semibold ${checkoutStep === 2 ? (isDark ? 'text-white' : 'text-slate-900') : textMuted}`}>Checkout</span>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${checkoutStep === 2 ? 'text-white' : isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`} style={checkoutStep === 2 ? { backgroundColor: primaryColor } : {}}>2</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {orderSuccess ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Icon.Check className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{isProfessional ? 'Request Sent Successfully!' : 'Order Placed Successfully!'}</p>
                  <p className={`mt-2 text-sm ${textMuted}`}>We've received your request. We'll get back to you shortly.</p>
                </div>
              ) : cart.length === 0 ? (
                /* ── Empty cart ── */
                <div className="flex flex-col items-center justify-center py-16 px-5">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    {isProfessional ? <Icon.FileText className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} /> : <Icon.ShoppingCart className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                  </div>
                  <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{isProfessional ? 'No items selected' : 'Your cart is empty'}</p>
                  <p className={`mt-1 text-sm ${textMuted}`}>Select items to get started</p>
                </div>
              ) : checkoutStep === 1 ? (
                /* ── STEP 1: Cart Review ── */
                <div className="p-5 pb-8 flex flex-col gap-3">
                  {cart.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                      <div className={`h-14 w-14 overflow-hidden rounded-xl shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : item.images?.[0] && (item.images[0].startsWith('http') || item.images[0].startsWith('/') || item.images[0].startsWith('data:')) ? (
                          <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <img src={IMG_PLACEHOLDER} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-semibold">{item.name}</h4>
                        {item.price !== null && item.price !== undefined && Number(item.price) > 0 && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: primaryColor }}>₹{Number(item.price).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center rounded-lg p-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <button aria-label="Decrease quantity" onClick={() => updateCartQty(item.id, -1)} className={`p-1.5 rounded-md transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-white'}`}>
                            <Icon.Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <button aria-label="Increase quantity" onClick={() => updateCartQty(item.id, 1)} className={`p-1.5 rounded-md transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-white'}`}>
                            <Icon.Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button aria-label="Remove from cart" onClick={() => removeFromCart(item.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition">
                          <Icon.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Order summary */}
                  <div className={`mt-2 rounded-2xl p-4 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${textMuted}`}>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span className="text-sm font-semibold">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={`border-t pt-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Total</span>
                        <span className="text-lg font-extrabold" style={{ color: primaryColor }}>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-24 shrink-0 w-full" />
                </div>
              ) : (
                /* ── STEP 2: Customer Details ── */
                <div className="p-5 flex flex-col gap-4">
                  {/* Mini order summary */}
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs ${textMuted}`}>{cart.reduce((s, i) => s + i.quantity, 0)} items</p>
                        <p className="text-lg font-extrabold" style={{ color: primaryColor }}>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                      >
                        Edit Cart
                      </button>
                    </div>
                  </div>

                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Contact Information</p>

                  {formError && (
                    <div className="rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                      <Icon.AlertTriangle className="h-4 w-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <label className={`absolute left-4 top-1 text-[9px] font-semibold uppercase tracking-wider ${textMuted}`}>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={checkoutName}
                        onChange={e => setCheckoutName(e.target.value)}
                        className={`w-full rounded-xl ${isDark ? 'bg-white/[0.06] ring-1 ring-white/10 text-white placeholder-slate-500 focus:ring-white/25' : 'bg-slate-50 ring-1 ring-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'} px-4 pt-5 pb-2.5 text-sm outline-none transition focus:ring-2`}
                      />
                    </div>
                    <div className="relative">
                      <label className={`absolute left-4 top-1 text-[9px] font-semibold uppercase tracking-wider ${textMuted}`}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={checkoutPhone}
                        onChange={e => setCheckoutPhone(e.target.value)}
                        className={`w-full rounded-xl ${isDark ? 'bg-white/[0.06] ring-1 ring-white/10 text-white placeholder-slate-500 focus:ring-white/25' : 'bg-slate-50 ring-1 ring-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'} px-4 pt-5 pb-2.5 text-sm outline-none transition focus:ring-2`}
                      />
                    </div>
                    <div className="relative">
                      <label className={`absolute left-4 top-1 text-[9px] font-semibold uppercase tracking-wider ${textMuted}`}>Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={checkoutEmail}
                        onChange={e => setCheckoutEmail(e.target.value)}
                        className={`w-full rounded-xl ${isDark ? 'bg-white/[0.06] ring-1 ring-white/10 text-white placeholder-slate-500 focus:ring-white/25' : 'bg-slate-50 ring-1 ring-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'} px-4 pt-5 pb-2.5 text-sm outline-none transition focus:ring-2`}
                      />
                    </div>
                  </div>

                  <p className={`text-[11px] font-semibold uppercase tracking-wider mt-2 ${textMuted}`}>Delivery Address</p>

                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <label className={`absolute left-4 top-1 text-[9px] font-semibold uppercase tracking-wider ${textMuted}`}>Pincode</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          value={checkoutPincode}
                          onChange={e => setCheckoutPincode(e.target.value.replace(/\D/g, ''))}
                          className={`w-full rounded-xl ${isDark ? 'bg-white/[0.06] ring-1 ring-white/10 text-white placeholder-slate-500 focus:ring-white/25' : 'bg-slate-50 ring-1 ring-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'} px-4 pt-5 pb-2.5 text-sm outline-none transition focus:ring-2`}
                        />
                        {isFetchingPincode && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg className="animate-spin h-4 w-4" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                        )}
                        {checkoutPincode.length === 6 && postOffices.length > 0 && !isFetchingPincode && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Icon.Check className="h-4 w-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {postOffices.length > 0 && (
                      <div className="relative">
                        <label className={`absolute left-4 top-1 text-[9px] font-semibold uppercase tracking-wider z-[1] ${textMuted}`}>Village / Area</label>
                        <select
                          value={checkoutVillage}
                          onChange={e => setCheckoutVillage(e.target.value)}
                          className={`w-full rounded-xl ${isDark ? 'bg-white/[0.06] ring-1 ring-white/10 text-white focus:ring-white/25' : 'bg-slate-50 ring-1 ring-slate-200 text-slate-900 focus:ring-slate-300'} px-4 pt-5 pb-2.5 text-sm outline-none transition focus:ring-2 appearance-none`}
                        >
                          <option value="" disabled className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Select your area</option>
                          {postOffices.map((po, i) => (
                            <option key={i} value={po.Name} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                              {po.Name}
                            </option>
                          ))}
                        </select>
                        <Icon.ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 pointer-events-none ${textMuted}`} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {cart.length > 0 && !orderSuccess && (
              <div className={`border-t ${borderSoft} p-4 shrink-0 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                {checkoutStep === 1 ? (
                  /* Step 1 → Proceed to checkout */
                  <button
                    onClick={() => { setCheckoutStep(2); setFormError(''); }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isProfessional ? 'Request Quotation' : 'Proceed to Checkout'}
                    <Icon.ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  /* Step 2 → Place order */
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleWhatsAppCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <Icon.Whatsapp className="h-5 w-5" />
                      {isProfessional ? 'Request via WhatsApp' : 'Order via WhatsApp'}
                    </button>
                    {email && (
                      <button
                        onClick={handleEmailCheckout}
                        disabled={isSubmittingOrder}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition active:scale-[0.98] disabled:opacity-70 ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
                      >
                        {isSubmittingOrder ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isProfessional ? 'Sending Request...' : 'Placing Order...'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Icon.Mail className="h-5 w-5" />
                            {isProfessional ? 'Request via Email' : 'Order via Email'}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ---- PRODUCT VIEW MODAL ---- */}
      <AnimatePresence>
        {productToView && (
          <ProductViewModal
            key="product-modal"
            product={productToView}
            imgIdx={productViewImgIdx}
            setImgIdx={setProductViewImgIdx}
            allProducts={filteredProducts}
            onNavigate={(product: any) => { setProductToView(product); setProductViewImgIdx(0); }}
            onClose={() => setProductToView(null)}
            onCartAction={() => {
              if (cart.some(item => item.id === productToView.id)) {
                setIsCartOpen(true);
              } else {
                addToCart(productToView);
              }
              setProductToView(null);
            }}
            inCart={cart.some(item => item.id === productToView.id)}
            isDark={isDark}
            primaryColor={primaryColor}
            isProfessional={isProfessional}
          />
        )}
      </AnimatePresence>

      {/* ---- GST VERIFICATION MODAL ---- */}
      <AnimatePresence>
        {showGstModal && (
          <div key="gst-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                <button aria-label="Close GST Modal" onClick={() => setShowGstModal(false)} className={`rounded-full p-2 transition ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100'}`}>
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
          <div key="payment-modal" className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
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
              className={`relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ${borderSoft} flex flex-col max-h-[90vh]`}
              style={{ backgroundColor: isDark ? '#0f0f13' : '#ffffff' }}
            >
              <div className="flex flex-col items-center p-6">
                <div className="mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/20" />

                <div className="absolute right-4 top-4">
                  <button
                    aria-label="Close Payment Modal"
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
                        aria-label="Download QR Code"
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

      <AnimatePresence>
        {lightboxIndex !== null && galleryContent[lightboxIndex] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              aria-label="Close Lightbox"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 rounded-full z-10"
            >
              <Icon.X className="w-6 h-6" />
            </button>

            {galleryContent.length > 1 && (
              <button
                aria-label="Previous Image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex === 0 ? galleryContent.length - 1 : lightboxIndex - 1);
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-10"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}

            {galleryContent.length > 1 && (
              <button
                aria-label="Next Image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex === galleryContent.length - 1 ? 0 : lightboxIndex + 1);
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-10"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              src={galleryContent[lightboxIndex]}
              alt={`Enlarged view ${lightboxIndex + 1}`}
              className="w-full max-w-4xl max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, { offset }) => {
                if (galleryContent.length <= 1) return;
                const swipeThreshold = 50;
                if (offset.x < -swipeThreshold) {
                  setLightboxIndex(lightboxIndex === galleryContent.length - 1 ? 0 : lightboxIndex + 1);
                } else if (offset.x > swipeThreshold) {
                  setLightboxIndex(lightboxIndex === 0 ? galleryContent.length - 1 : lightboxIndex - 1);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Modal */}
      <AnimatePresence>
        {showAppointmentModal && (
          <motion.div
            key="appointment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4"
            onClick={() => { setShowAppointmentModal(false); setAppointmentStep(1); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-3xl ${isDark ? 'bg-[#1c1c1e] text-white shadow-2xl shadow-black/50 border border-white/10' : 'bg-white text-slate-900 shadow-2xl'} p-6 max-h-[85vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Book Appointment</h3>
                <button
                  aria-label="Close Appointment Modal"
                  onClick={() => { setShowAppointmentModal(false); setAppointmentStep(1); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <Icon.X className="h-4 w-4" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Icon.Check className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Booking Confirmed!</h4>
                  <p className={`text-sm ${textMuted}`}>Your appointment has been successfully requested.</p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  {formError && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                      {formError}
                    </div>
                  )}

                  {appointmentStep === 1 && (
                    <>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Select Date</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);

                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;

                            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                            const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                            const dayNum = d.getDate();
                            const isSelected = bookingDate === dateString;

                            const workingDays = card.appointment_details?.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                            if (!workingDays.includes(dayName)) return null;

                            return (
                              <button
                                key={dateString}
                                type="button"
                                onClick={() => {
                                  setBookingDate(dateString);
                                  setBookingTime('');
                                }}
                                className={`flex flex-col items-center justify-center min-w-[72px] py-3 rounded-2xl border snap-start transition-all ${isSelected
                                  ? 'text-white shadow-lg'
                                  : isDark
                                    ? 'border-white/10 text-slate-300 hover:bg-white/5'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                              >
                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">{monthName}</span>
                                <span className="text-2xl font-black mb-1">{dayNum}</span>
                                <span className="text-[10px] uppercase font-semibold opacity-80">{dayName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {bookingDate && (
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Select Time</label>
                          <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1">
                            {generateTimeSlots(bookingDate).map(slot => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={slot.isBooked}
                                onClick={() => {
                                  if (!slot.isBooked) setBookingTime(slot.time);
                                }}
                                className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all ${slot.isBooked
                                  ? isDark ? 'border-white/5 bg-white/5 text-white/30 cursor-not-allowed line-through' : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                  : bookingTime === slot.time
                                    ? 'text-white shadow-md'
                                    : isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                style={bookingTime === slot.time ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                              >
                                {slot.isBooked ? `${slot.time} - Booked` : slot.time}
                              </button>
                            ))}
                            {generateTimeSlots(bookingDate).length === 0 && (
                              <div className={`col-span-3 text-center py-4 text-sm ${textMuted}`}>
                                No available slots for this date.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setAppointmentStep(2)}
                        disabled={!bookingTime}
                        className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Next
                        <Icon.ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {appointmentStep === 2 && bookingTime && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Your Name</label>
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Your Email</label>
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Notes (Optional)</label>
                        <textarea
                          rows={2}
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors resize-none ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          placeholder="Anything I should know?"
                        />
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setAppointmentStep(1)}
                          className={`flex items-center justify-center rounded-xl px-4 py-4 font-bold transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                        >
                          <Icon.ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingBooking}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isSubmittingBooking ? (
                            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Icon.Calendar className="h-4 w-4" />
                              Confirm Booking
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Footer */}
      {cartItemCount > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-[90] p-4 pb-safe bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.1)] transform transition-transform translate-y-0 ${isDark ? 'dark:bg-[#12121A] border-t border-white/10' : ''}`}>
          <div className="mx-auto max-w-[clamp(400px,90vw,800px)]">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between rounded-2xl px-5 py-3.5 text-white font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  {cart.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={
                        item.images?.[0] && (item.images[0].startsWith('http') || item.images[0].startsWith('/') || item.images[0].startsWith('data:'))
                          ? item.images[0]
                          : IMG_PLACEHOLDER
                      }
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-white/20 object-cover shrink-0 bg-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = IMG_PLACEHOLDER;
                      }}
                    />
                  ))}
                  {cart.length > 3 && <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-black/20 flex items-center justify-center text-[10px] text-white shrink-0">+{cart.length - 3}</div>}
                </div>
                <span className="truncate">{cartItemCount} item{cartItemCount > 1 ? 's' : ''} added</span>
              </div>
              <span className="flex items-center gap-1 shrink-0">Continue <Icon.ChevronRight className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

/* ============================================================
 * Helper components
 * ============================================================ */

// Bento grid tile — adaptive, brand-tinted surface with an optional compact
// header. Carries the `gsap-section` class so the existing ScrollTrigger
// reveal animation applies automatically.
function BentoTile({
  title,
  icon,
  tint = '#6366f1',
  span = '',
  isDark,
  textMuted,
  className = '',
  bodyClassName = 'p-3 sm:p-4',
  headerRight,
  children,
}: {
  title?: string;
  icon?: React.ReactNode;
  tint?: string;
  span?: string;
  isDark: boolean;
  textMuted: string;
  className?: string;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const face: React.CSSProperties = {
    backgroundColor: isDark ? hexToRgba(tint, 0.055) : '#ffffff',
    backgroundImage: isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))'
      : `linear-gradient(180deg, ${hexToRgba(tint, 0.05)}, rgba(255,255,255,0))`,
    border: `1px solid ${isDark ? hexToRgba(tint, 0.16) : hexToRgba(tint, 0.12)}`,
    boxShadow: isDark
      ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 30px rgba(0,0,0,0.28)'
      : `0 1px 2px rgba(15,23,42,0.04), 0 12px 30px ${hexToRgba(tint, 0.10)}`,
  };
  return (
    <section
      className={`gsap-section group relative flex min-w-0 flex-col overflow-hidden rounded-3xl ${span} ${className}`}
      style={face}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${hexToRgba(tint, isDark ? 0.5 : 0.35)}, transparent)` }}
      />
      {(title || headerRight) && (
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: hexToRgba(tint, isDark ? 0.18 : 0.1), color: tint }}
              >
                {icon}
              </span>
            )}
            {title && (
              <h3 className={`text-[11px] font-bold uppercase tracking-[0.16em] ${textMuted}`}>{title}</h3>
            )}
          </div>
          {headerRight}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

// (Section helper removed — replaced by the BentoTile bento layout above.)

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
  const base = `group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 overflow-hidden gsap-hover-safe-action transition-all duration-300 ${isDark
      ? 'bg-white/[0.05] ring-1 ring-white/[0.09] hover:bg-white/[0.09] hover:ring-white/20'
      : 'bg-white ring-1 ring-slate-200/80 shadow-sm hover:shadow-md hover:ring-slate-300'
    } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:-translate-y-1 active:scale-95'}`;

  const inner = (
    <>
      {/* Shimmer top border on hover */}
      {!disabled && (
        <div
          className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to right, transparent, ${tint}60, transparent)` }}
        />
      )}
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: hexToRgba(tint, isDark ? 0.16 : 0.10),
          color: tint,
          boxShadow: disabled ? 'none' : `0 0 0 0 ${hexToRgba(tint, 0)}`,
        }}
        onMouseEnter={(e) => {
          if (!disabled) (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px ${hexToRgba(tint, 0.35)}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${hexToRgba(tint, 0)}`;
        }}
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
      <a
        className={base}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        if (onClick) onClick();
      }}
      className={base}
    >
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
  ariaLabel,
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
  ariaLabel?: string;
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
              aria-label={ariaLabel}
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {copied ? <Icon.Check className="h-4 w-4 text-emerald-500" /> : <Icon.Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function ProductViewModal({
  product,
  imgIdx,
  setImgIdx,
  allProducts,
  onNavigate,
  onClose,
  onCartAction,
  inCart,
  isDark,
  primaryColor,
  isProfessional,
}: {
  product: any;
  imgIdx: number;
  setImgIdx: (i: number) => void;
  allProducts: any[];
  onNavigate: (product: any) => void;
  onClose: () => void;
  onCartAction: () => void;
  inCart: boolean;
  isDark: boolean;
  primaryColor: string;
  isProfessional: boolean;
}) {
  const touchRef = useRef<{ startX: number; startY: number; startTime: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0
    ? product.images.map((img: string) =>
      img && (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:'))
        ? img
        : IMG_PLACEHOLDER
    )
    : [IMG_PLACEHOLDER];
  const hasMultipleImages = images.length > 1;

  // Find current product index in the list
  const currentIdx = allProducts.findIndex((p: any) => p.id === product.id);
  const hasPrevProduct = currentIdx > 0;
  const hasNextProduct = currentIdx < allProducts.length - 1;

  const goToPrevImage = useCallback(() => {
    if (hasMultipleImages) setImgIdx((imgIdx - 1 + images.length) % images.length);
  }, [imgIdx, images.length, hasMultipleImages, setImgIdx]);

  const goToNextImage = useCallback(() => {
    if (hasMultipleImages) setImgIdx((imgIdx + 1) % images.length);
  }, [imgIdx, images.length, hasMultipleImages, setImgIdx]);

  const goToPrevProduct = useCallback(() => {
    if (hasPrevProduct) onNavigate(allProducts[currentIdx - 1]);
  }, [hasPrevProduct, currentIdx, allProducts, onNavigate]);

  const goToNextProduct = useCallback(() => {
    if (hasNextProduct) onNavigate(allProducts[currentIdx + 1]);
  }, [hasNextProduct, currentIdx, allProducts, onNavigate]);

  // Touch swipe handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, startTime: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchRef.current.startX;
    const deltaY = touch.clientY - touchRef.current.startY;
    const elapsed = Date.now() - touchRef.current.startTime;
    touchRef.current = null;

    // Only register horizontal swipes (not vertical scrolls), min 40px, max 500ms
    if (Math.abs(deltaX) < 40 || Math.abs(deltaY) > Math.abs(deltaX) || elapsed > 500) return;

    if (deltaX < 0) {
      // Swiped left → next
      if (hasMultipleImages) goToNextImage();
      else if (hasNextProduct) goToNextProduct();
    } else {
      // Swiped right → prev
      if (hasMultipleImages) goToPrevImage();
      else if (hasPrevProduct) goToPrevProduct();
    }
  }, [hasMultipleImages, goToNextImage, goToPrevImage, hasNextProduct, goToNextProduct, hasPrevProduct, goToPrevProduct]);

  const surfaceSoft = isDark ? 'bg-white/[0.04]' : 'bg-slate-50';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={`relative flex w-full sm:max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl ${isDark ? 'bg-[#12121A] border border-white/10' : 'bg-white'} max-h-[92vh] sm:max-h-[85vh]`}
      >
        {/* Image carousel */}
        <div
          ref={imageContainerRef}
          className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 shrink-0 select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = IMG_PLACEHOLDER;
                  }}
                />
              </AnimatePresence>

              {/* Image dots */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                    />
                  ))}
                </div>
              )}

              {/* Image prev/next arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-90"
                  >
                    <Icon.ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-90"
                  >
                    <Icon.ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {hasMultipleImages && (
                <div className="absolute top-3 left-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                  {imgIdx + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Icon.Image className="h-12 w-12 opacity-50" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition hover:bg-black/70 active:scale-90 z-10"
          >
            <Icon.X className="h-5 w-5" />
          </button>
        </div>

        {/* Product details */}
        <div className="flex flex-col p-5 sm:p-6 overflow-y-auto flex-1">
          {product.category && (
            <span className={`mb-2 w-max rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {product.category}
            </span>
          )}
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</h2>
          {product.description && (
            <p className={`mt-3 text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{product.description}</p>
          )}

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {product.price !== null && product.price !== undefined && Number(product.price) > 0 ? `₹${Number(product.price).toLocaleString('en-IN')}` : ''}
            </p>
            <button
              onClick={onCartAction}
              className="rounded-xl px-5 py-3 font-bold text-white shadow-md transition active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: inCart ? '#10b981' : primaryColor }}
            >
              {inCart ? <Icon.Check className="h-5 w-5" /> : (isProfessional ? <Icon.FileText className="h-5 w-5" /> : <Icon.ShoppingCart className="h-5 w-5" />)}
              <span className="font-semibold">{inCart ? 'Added' : (isProfessional ? 'Add to Quote' : 'Add to Cart')}</span>
            </button>
          </div>
        </div>

        {/* Product-level prev/next navigation */}
        {allProducts.length > 1 && (
          <div className={`flex items-center justify-between border-t px-5 py-3 ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
            <button
              onClick={goToPrevProduct}
              disabled={!hasPrevProduct}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95 ${hasPrevProduct
                ? isDark ? 'text-white bg-white/10 hover:bg-white/15' : 'text-slate-700 bg-slate-200 hover:bg-slate-300'
                : 'opacity-30 cursor-not-allowed ' + (isDark ? 'text-white/50' : 'text-slate-400')
                }`}
            >
              <Icon.ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {currentIdx + 1} of {allProducts.length}
            </span>
            <button
              onClick={goToNextProduct}
              disabled={!hasNextProduct}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95 ${hasNextProduct
                ? isDark ? 'text-white bg-white/10 hover:bg-white/15' : 'text-slate-700 bg-slate-200 hover:bg-slate-300'
                : 'opacity-30 cursor-not-allowed ' + (isDark ? 'text-white/50' : 'text-slate-400')
                }`}
            >
              Next
              <Icon.ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
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
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          {copied ? <Icon.Check className="h-3.5 w-3.5 text-emerald-500" /> : <Icon.Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
