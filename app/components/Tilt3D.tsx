'use client';

import React, { useRef, useCallback } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  max?: number;        // max tilt in degrees
  scale?: number;      // hover scale
  glare?: boolean;     // enable diagonal sheen
  glareColor?: string; // glare tint
  perspective?: number;
  onClick?: () => void;
  as?: 'div' | 'button';
}

// Lightweight CSS-3D tilt wrapper. Smooth pointer parallax + optional glare,
// gracefully falls back to no-op on touch / reduced motion.
export default function Tilt3D({
  children,
  className = '',
  max = 10,
  scale = 1.02,
  glare = true,
  glareColor = 'rgba(255,255,255,0.35)',
  perspective = 900,
  onClick,
  as = 'div',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!wrapRef.current || !innerRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (innerRef.current) {
          innerRef.current.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
        }
        if (glareRef.current) {
          const angle = Math.atan2(py - 0.5, px - 0.5) * (180 / Math.PI) - 90;
          glareRef.current.style.background = `linear-gradient(${angle}deg, ${glareColor} 0%, transparent 60%)`;
          glareRef.current.style.opacity = '0.9';
        }
      });
    },
    [max, scale, perspective, glareColor]
  );

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (innerRef.current) {
      innerRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [perspective]);

  const Inner = (
    <div
      ref={innerRef}
      className="tilt-3d-inner relative h-full w-full transition-transform duration-200 ease-out will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300"
        />
      )}
    </div>
  );

  if (as === 'button') {
    return (
      <button
        ref={wrapRef as any}
        type="button"
        onPointerMove={handleMove}
        onPointerLeave={reset}
        onClick={onClick}
        className={`tilt-3d ${className}`}
      >
        {Inner}
      </button>
    );
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onClick={onClick}
      className={`tilt-3d ${className}`}
    >
      {Inner}
    </div>
  );
}