'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  height?: string;
  flipHint?: boolean;
}

// 3D flip card with real CSS preserve-3d. Tap or click to flip,
// also subtly tilts on cursor for a tactile feel before flipping.
export default function FlipCard3D({ front, back, className = '', height = 'auto', flipHint = true }: Props) {
  const [flipped, setFlipped] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!wrapRef.current || !innerRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 10 + (flipped ? 180 : 0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (innerRef.current) {
          innerRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        }
      });
    },
    [flipped]
  );

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateX(0deg) rotateY(${flipped ? 180 : 0}deg)`;
    }
  }, [flipped]);

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: '1200px', height }}
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        ref={innerRef}
        className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>

      {flipHint && (
        <AnimatePresence>
          {!flipped && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wider text-white/60"
            >
              tap to flip
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}