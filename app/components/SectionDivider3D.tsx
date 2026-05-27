'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/lib/colorUtils';

interface Props {
  color: string;
  label?: string;
  className?: string;
}

// Pure-CSS 3D divider — a glowing orb sitting between two animated lines.
// Avoids spinning up a second WebGL canvas for every section.
export default function SectionDivider3D({ color, label, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative my-5 flex items-center justify-center gap-3 ${className}`}
      aria-hidden
    >
      <div
        className="h-px flex-1"
        style={{ background: `linear-gradient(to right, transparent, ${hexToRgba(color, 0.4)})` }}
      />
      <div className="relative" style={{ perspective: '400px' }}>
        <motion.div
          animate={{ rotateX: 360, rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="relative h-6 w-6"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${color}, ${hexToRgba(color, 0)} 70%)`,
              boxShadow: `0 0 24px ${hexToRgba(color, 0.6)}, inset 0 0 10px ${hexToRgba('#ffffff', 0.4)}`,
            }}
          />
          <span
            className="absolute inset-1 rounded-full"
            style={{
              background: `radial-gradient(circle at 70% 70%, ${hexToRgba('#ffffff', 0.8)}, transparent 60%)`,
              transform: 'translateZ(6px)',
            }}
          />
        </motion.div>
      </div>
      {label && (
        <span
          className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: hexToRgba(color, 0.85) }}
        >
          {label}
        </span>
      )}
      <div
        className="h-px flex-1"
        style={{ background: `linear-gradient(to left, transparent, ${hexToRgba(color, 0.4)})` }}
      />
    </motion.div>
  );
}