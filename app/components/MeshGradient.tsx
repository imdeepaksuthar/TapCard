'use client';

import React, { useMemo } from 'react';
import { derivePalette } from '@/lib/colorUtils';

interface Props {
  color: string;
  isDark?: boolean;
  intensity?: number; // 0 - 1
  className?: string;
}

// Animated mesh-style gradient backdrop built from CSS blurred orbs.
// GPU-cheap, no canvas, derives a full palette from a single brand color.
export default function MeshGradient({ color, isDark = true, intensity = 0.55, className = '' }: Props) {
  const palette = useMemo(() => derivePalette(color), [color]);

  const orbs = useMemo(
    () => [
      { color: palette.primary, top: '8%', left: '12%', size: 420, delay: 0 },
      { color: palette.accent, top: '40%', left: '70%', size: 380, delay: -8 },
      { color: palette.complement, top: '72%', left: '20%', size: 340, delay: -16 },
      { color: palette.glow, top: '60%', left: '55%', size: 300, delay: -4 },
      { color: palette.light, top: '15%', left: '55%', size: 260, delay: -12 },
    ],
    [palette]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
      style={{
        background: isDark
          ? `radial-gradient(ellipse at top, ${palette.dark}, #05050A 70%)`
          : `radial-gradient(ellipse at top, ${palette.light}30, #f5f6fa 70%)`,
      }}
    >
      {orbs.map((o, i) => (
        <span
          key={i}
          className="mesh-orb"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            background: o.color,
            opacity: isDark ? intensity : intensity * 0.55,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}
      {/* Fine noise overlay for premium texture */}
      <div className="mesh-noise" />
      <style jsx>{`
        .mesh-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          mix-blend-mode: ${isDark ? 'screen' : 'multiply'};
          transform: translate(-50%, -50%);
          animation: meshFloat 22s ease-in-out infinite;
          will-change: transform;
        }
        .mesh-noise {
          position: absolute;
          inset: 0;
          opacity: ${isDark ? 0.05 : 0.04};
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='1'/></svg>");
          mix-blend-mode: overlay;
        }
        @keyframes meshFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          25%      { transform: translate(-35%, -65%) scale(1.15) rotate(40deg); }
          50%      { transform: translate(-60%, -40%) scale(0.9)  rotate(80deg); }
          75%      { transform: translate(-45%, -55%) scale(1.1)  rotate(140deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mesh-orb { animation: none; }
        }
      `}</style>
    </div>
  );
}