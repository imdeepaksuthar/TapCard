'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface LeadFormProps {
  cardId: number;
  bare?: boolean;
  isDark?: boolean;
  primaryColor?: string;
}

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function LeadForm({
  cardId,
  bare = false,
  isDark = false,
  primaryColor = '#6366f1',
}: LeadFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...formData, card_id: cardId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to submit');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  // Tailwind palette per theme — shared between bare and standalone variants
  const inputBase = isDark
    ? 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 transition focus:bg-white/[0.08]'
    : 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:bg-white';

  const focusStyle = (e: any) => {
    e.currentTarget.style.borderColor = primaryColor;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(primaryColor, 0.18)}`;
  };
  const blurStyle = (e: any) => {
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.boxShadow = '';
  };

  const form = (
    <>
      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 rounded-xl p-4 text-sm ${
            isDark
              ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
              : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
          }`}
        >
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-semibold">Thanks for reaching out!</p>
            <p className="mt-0.5 opacity-80">Your message has been sent. We'll get back to you shortly.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs font-medium underline opacity-80 hover:opacity-100"
            >
              Send another message
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={focusStyle}
            onBlur={blurStyle}
            className={inputBase}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={inputBase}
            />
            <input
              type="tel"
              required
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onFocus={focusStyle}
              onBlur={blurStyle}
              className={inputBase}
            />
          </div>
          <textarea
            rows={3}
            placeholder="How can we help you?"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onFocus={focusStyle}
            onBlur={blurStyle}
            className={`${inputBase} resize-none`}
          />

          {errorMsg && (
            <p className={`text-xs ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-70"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${hexToRgba(primaryColor, 0.78)})`,
              boxShadow: `0 8px 20px ${hexToRgba(primaryColor, 0.32)}`,
            }}
          >
            {status === 'loading' ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                Send Message
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}
    </>
  );

  if (bare) return form;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-8 rounded-2xl p-6 shadow-xl ${
        isDark
          ? 'bg-slate-900/60 ring-1 ring-white/10 shadow-black/30'
          : 'bg-white ring-1 ring-slate-200 shadow-slate-200/50'
      }`}
    >
      <h3 className={`mb-4 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Let's Connect</h3>
      {form}
    </motion.div>
  );
}
