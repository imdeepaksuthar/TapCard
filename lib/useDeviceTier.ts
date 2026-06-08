'use client';

import { useEffect, useState } from 'react';

export type DeviceTier = 'high' | 'mid' | 'low';

export interface DeviceCapability {
  /** Resolved once on the client; `null` during SSR / first paint. */
  tier: DeviceTier | null;
  /** True when we should skip WebGL entirely (no GL support or reduced-motion). */
  prefersStatic: boolean;
  /** Coarse pointer / no hover — disables cursor parallax. */
  isTouch: boolean;
  isMobile: boolean;
  /** Upper bound for the renderer's pixel ratio on this device. */
  maxDpr: number;
}

const INITIAL: DeviceCapability = {
  tier: null,
  prefersStatic: false,
  isTouch: false,
  isMobile: false,
  maxDpr: 1.5,
};

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Detects device capability once on mount so the hero can pick the right
 * quality preset (or skip WebGL altogether). Runs client-side only — during
 * SSR and the first paint `tier` is `null`, which callers treat as "show the
 * static fallback" to keep LCP fast and avoid layout shift.
 */
export function useDeviceTier(): DeviceCapability {
  const [cap, setCap] = useState<DeviceCapability>(INITIAL);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = !!nav.connection?.saveData;
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    // Grade the device from its weakest signal: cores, RAM, and form factor.
    let tier: DeviceTier = 'high';
    if (cores <= 4 || memory <= 4 || isMobile) tier = 'mid';
    if (cores <= 2 || memory <= 2 || saveData) tier = 'low';

    setCap({
      tier,
      // No GL or an explicit motion preference → render the static hero, never mount a Canvas.
      prefersStatic: reducedMotion || !hasWebGL(),
      isTouch,
      isMobile,
      maxDpr: tier === 'high' ? 1.75 : tier === 'mid' ? 1.25 : 1,
    });
  }, []);

  return cap;
}
