'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Lightweight global toast — no context/provider wiring needed at call sites.
// Import `toast` anywhere and call toast.error(...) / toast.success(...); mount
// <Toaster /> once (done in the dashboard layout) to render them.

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; }

let toasts: ToastItem[] = [];
let listeners: Array<(t: ToastItem[]) => void> = [];
let counter = 0;

function emit() {
  for (const l of listeners) l(toasts);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(message: string, type: ToastType) {
  const id = ++counter;
  toasts = [...toasts, { id, message, type }];
  emit();
  if (typeof window !== 'undefined') {
    window.setTimeout(() => dismiss(id), 4500);
  }
  return id;
}

export const toast = {
  success: (m: string) => push(m, 'success'),
  error: (m: string) => push(m, 'error'),
  info: (m: string) => push(m, 'info'),
  dismiss,
};

const TONE: Record<ToastType, { accent: string; ring: string; icon: React.ReactNode }> = {
  success: {
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/25',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />,
  },
  error: {
    accent: 'text-rose-400',
    ring: 'ring-rose-500/25',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />,
  },
  info: {
    accent: 'text-blue-400',
    ring: 'ring-blue-500/25',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.push(setItems);
    setItems(toasts);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-[#10192e]/95 px-4 py-3 shadow-xl ring-1 ${TONE[t.type].ring} backdrop-blur-xl`}
          >
            <svg className={`mt-0.5 h-4 w-4 shrink-0 ${TONE[t.type].accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {TONE[t.type].icon}
            </svg>
            <p className="flex-1 text-sm font-medium text-zinc-100 break-words">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
